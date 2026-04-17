"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  DOG_STAGES,
  DAILY_GOAL,
  WEATHER_MAP,
  type WeatherInfo,
} from "../data/dogStages";

type Weather = {
  temp: number;
  code: number;
  info: WeatherInfo;
};

const STEP_THRESHOLD = 13;
const STEP_COOLDOWN_MS = 350;

function getToday() {
  return new Date().toDateString();
}

function loadStorage() {
  try {
    const total = parseInt(localStorage.getItem("dog_totalSteps") ?? "0", 10);
    const date = localStorage.getItem("dog_date") ?? "";
    const todayRaw = parseInt(localStorage.getItem("dog_todaySteps") ?? "0", 10);
    const today = date === getToday() ? todayRaw : 0;
    return { total: isNaN(total) ? 0 : total, today: isNaN(today) ? 0 : today };
  } catch {
    return { total: 0, today: 0 };
  }
}

function saveStorage(total: number, today: number) {
  try {
    localStorage.setItem("dog_totalSteps", String(total));
    localStorage.setItem("dog_todaySteps", String(today));
    localStorage.setItem("dog_date", getToday());
  } catch {}
}

export default function DogApp() {
  const [totalSteps, setTotalSteps] = useState(0);
  const [todaySteps, setTodaySteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherState, setWeatherState] = useState<"idle" | "loading" | "denied">("idle");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevStageIndex = useRef(0);
  const lastMag = useRef(0);
  const lastStepAt = useRef(0);

  useEffect(() => {
    const { total, today } = loadStorage();
    setTotalSteps(total);
    setTodaySteps(today);
    prevStageIndex.current = DOG_STAGES.findLastIndex((s) => total >= s.minSteps);
    fetchWeather();
  }, []);

  const addSteps = useCallback((n: number) => {
    setTotalSteps((prev) => {
      const next = prev + n;
      setTodaySteps((td) => {
        const nextTd = td + n;
        saveStorage(next, nextTd);
        return nextTd;
      });
      const newIdx = DOG_STAGES.findLastIndex((s) => next >= s.minSteps);
      if (newIdx > prevStageIndex.current) {
        prevStageIndex.current = newIdx;
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2500);
      }
      return next;
    });
  }, []);

  // Pedometer via DeviceMotionEvent
  useEffect(() => {
    if (!isTracking) return;

    function handleMotion(e: DeviceMotionEvent) {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
      const now = Date.now();
      if (
        lastMag.current < STEP_THRESHOLD &&
        mag >= STEP_THRESHOLD &&
        now - lastStepAt.current > STEP_COOLDOWN_MS
      ) {
        lastStepAt.current = now;
        addSteps(1);
      }
      lastMag.current = mag;
    }

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [isTracking, addSteps]);

  const toggleTracking = useCallback(async () => {
    if (isTracking) {
      setIsTracking(false);
      return;
    }
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
    ) {
      const perm = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
      if (perm !== "granted") return;
    }
    setIsTracking(true);
  }, [isTracking]);

  const fetchWeather = useCallback(async () => {
    if (!navigator.geolocation) return;
    setWeatherState("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
        );
        const data = await res.json();
        const code: number = data.current.weather_code;
        const info = WEATHER_MAP[code] ?? { emoji: "🌡️", label: "不明", walkAdvice: "お外を確認しよう" };
        setWeather({ temp: Math.round(data.current.temperature_2m), code, info });
        setWeatherState("idle");
      },
      () => setWeatherState("denied")
    );
  }, []);

  const currentIdx = DOG_STAGES.findLastIndex((s) => totalSteps >= s.minSteps);
  const stage = DOG_STAGES[currentIdx];
  const nextStage = DOG_STAGES[currentIdx + 1] ?? null;
  const growthPct = nextStage
    ? Math.min(((totalSteps - stage.minSteps) / (nextStage.minSteps - stage.minSteps)) * 100, 100)
    : 100;
  const dailyPct = Math.min((todaySteps / DAILY_GOAL) * 100, 100);
  const goalReached = todaySteps >= DAILY_GOAL;

  const today = new Date();
  const dateLabel = today.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(to bottom, ${stage.bgFrom}, ${stage.bgTo})` }}
    >
      {/* Level-up overlay */}
      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white/90 rounded-3xl px-8 py-6 shadow-2xl text-center animate-bounce">
            <div className="text-5xl mb-2">🎉</div>
            <p className="text-2xl font-black text-amber-700">成長した！</p>
            <p className="text-lg font-bold text-amber-500">{stage.name}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2">
        <div>
          <h1 className="text-lg font-black text-amber-900">🐾 わんわん成長日記</h1>
          <p className="text-xs text-amber-700">{dateLabel}</p>
        </div>

        {/* Weather */}
        <div className="bg-white/60 rounded-2xl px-3 py-2 min-w-[72px] text-center">
          {weatherState === "loading" && (
            <p className="text-xs text-gray-400">取得中...</p>
          )}
          {weatherState === "denied" && (
            <button onClick={fetchWeather} className="text-xs text-amber-600">
              📍 位置情報
            </button>
          )}
          {weatherState === "idle" && weather && (
            <>
              <div className="text-2xl leading-none">{weather.info.emoji}</div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">{weather.temp}°C</div>
              <div className="text-[10px] text-gray-500">{weather.info.label}</div>
            </>
          )}
          {weatherState === "idle" && !weather && (
            <button onClick={fetchWeather} className="text-xs text-amber-600">
              天気を取得
            </button>
          )}
        </div>
      </header>

      {/* Walk advice */}
      {weather && (
        <p className="text-center text-sm font-semibold text-amber-800 px-4 py-1">
          {weather.info.walkAdvice}
        </p>
      )}

      {/* Dog display */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 gap-5">
        <div className="flex flex-col items-center gap-2">
          <div
            className="select-none transition-all duration-700"
            style={{ fontSize: stage.sizePx, lineHeight: 1 }}
          >
            {stage.emoji}
          </div>
          <h2 className="text-xl font-black text-amber-900">{stage.name}</h2>
          <p className="text-sm text-amber-800 text-center max-w-xs">{stage.message}</p>
        </div>

        {/* Growth bar */}
        <div className="w-full max-w-sm">
          <div className="flex justify-between text-xs text-amber-800 mb-1 font-medium">
            <span>🌱 成長度</span>
            <span>
              {nextStage
                ? `あと ${(nextStage.minSteps - totalSteps).toLocaleString()}歩`
                : "MAX！"}
            </span>
          </div>
          <div className="w-full bg-white/40 rounded-full h-4 overflow-hidden">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
              style={{ width: `${growthPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-amber-700 mt-0.5">
            <span>{stage.name}</span>
            <span>{nextStage?.name ?? "ゴール達成！"}</span>
          </div>
        </div>

        {/* Today steps */}
        <div className="w-full max-w-sm bg-white/60 rounded-2xl p-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-bold text-amber-900">今日の歩数</span>
            <span className="text-xs text-amber-600">目標 {DAILY_GOAL.toLocaleString()}歩</span>
          </div>
          <div className="text-4xl font-black text-amber-800 mb-2 tabular-nums">
            {todaySteps.toLocaleString()}
            <span className="text-base font-normal ml-1">歩</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${dailyPct}%` }}
            />
          </div>
          {goalReached && (
            <p className="text-center text-sm font-bold text-emerald-600 mt-2">
              🎉 今日の目標達成！
            </p>
          )}
        </div>

        {/* Cumulative */}
        <p className="text-xs text-amber-700">
          累計 <span className="font-bold">{totalSteps.toLocaleString()}</span> 歩
        </p>

        {/* Controls */}
        <div className="w-full max-w-sm flex flex-col gap-2">
          <button
            onClick={toggleTracking}
            className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-md transition-colors ${
              isTracking
                ? "bg-red-400 active:bg-red-500"
                : "bg-amber-500 active:bg-amber-600"
            }`}
          >
            {isTracking ? "⏹ 計測停止" : "▶ 歩数計測スタート"}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => addSteps(100)}
              className="flex-1 py-3 bg-white/60 active:bg-white/80 rounded-2xl text-sm font-bold text-amber-800"
            >
              +100歩
            </button>
            <button
              onClick={() => addSteps(1000)}
              className="flex-1 py-3 bg-white/60 active:bg-white/80 rounded-2xl text-sm font-bold text-amber-800"
            >
              +1,000歩
            </button>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-amber-700">
        毎日お散歩して一緒に大きくなろう 🐾
      </footer>
    </div>
  );
}
