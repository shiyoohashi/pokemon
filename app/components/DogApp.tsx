"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DOG_STAGES, DAILY_GOAL, WEATHER_MAP } from "../data/dogStages";

// ── Tamagotchi ───────────────────────────────────────────────────────────────

type TamaState = {
  hunger: number;      // 0=満腹 → 100=ペコペコ
  happiness: number;   // 0=しょんぼり → 100=ルンルン
  poopCount: number;   // 0〜5
  lastFedAt: number;
  lastPettedAt: number;
  nextPoopAt: number;
  lastUpdatedAt: number;
};

const HUNGER_PER_MIN = 100 / 600;    // 10時間で満腹→ペコペコ
const HAPPY_DECAY_MIN = 100 / 480;   // 8時間で最大→最小
const POOP_INTERVAL_MS = 3 * 3600_000; // 3時間ごとにうんち
const PET_COOLDOWN_MS = 60_000;       // なでるクールダウン1分
const MAX_POOP = 5;

const TAMA_DEFAULT: TamaState = {
  hunger: 20,
  happiness: 80,
  poopCount: 0,
  lastFedAt: Date.now(),
  lastPettedAt: 0,
  nextPoopAt: Date.now() + POOP_INTERVAL_MS,
  lastUpdatedAt: Date.now(),
};

function computeTama(saved: TamaState): TamaState {
  const now = Date.now();
  const mins = (now - saved.lastUpdatedAt) / 60_000;
  if (mins <= 0) return saved;

  let hunger = Math.min(100, saved.hunger + HUNGER_PER_MIN * mins);
  let happiness =
    saved.happiness -
    HAPPY_DECAY_MIN * mins -
    (hunger > 60 ? HAPPY_DECAY_MIN * 0.5 * mins : 0) -
    (saved.poopCount > 0 ? HAPPY_DECAY_MIN * 0.3 * saved.poopCount * mins : 0);
  happiness = Math.max(0, Math.min(100, happiness));

  let { poopCount, nextPoopAt } = saved;
  if (nextPoopAt && now >= nextPoopAt && poopCount < MAX_POOP) {
    poopCount++;
    nextPoopAt = now + POOP_INTERVAL_MS;
  }

  return { ...saved, hunger, happiness, poopCount, nextPoopAt, lastUpdatedAt: now };
}

function loadTama(): TamaState {
  try {
    const raw = localStorage.getItem("dog_tama");
    if (!raw) return { ...TAMA_DEFAULT, lastUpdatedAt: Date.now() };
    return computeTama(JSON.parse(raw) as TamaState);
  } catch {
    return { ...TAMA_DEFAULT, lastUpdatedAt: Date.now() };
  }
}

function saveTama(s: TamaState) {
  try { localStorage.setItem("dog_tama", JSON.stringify(s)); } catch {}
}

// ── Steps ────────────────────────────────────────────────────────────────────

function getToday() { return new Date().toDateString(); }

function loadSteps() {
  try {
    const total = parseInt(localStorage.getItem("dog_totalSteps") ?? "0", 10);
    const date = localStorage.getItem("dog_date") ?? "";
    const todayRaw = parseInt(localStorage.getItem("dog_todaySteps") ?? "0", 10);
    return {
      total: isNaN(total) ? 0 : total,
      today: date === getToday() ? (isNaN(todayRaw) ? 0 : todayRaw) : 0,
    };
  } catch { return { total: 0, today: 0 }; }
}

function saveSteps(total: number, today: number) {
  try {
    localStorage.setItem("dog_totalSteps", String(total));
    localStorage.setItem("dog_todaySteps", String(today));
    localStorage.setItem("dog_date", getToday());
  } catch {}
}

// ── Weather ───────────────────────────────────────────────────────────────────

type Weather = { temp: number; code: number };

// ── Component ────────────────────────────────────────────────────────────────

type TamaAnim = "feed" | "pet" | "clean" | null;

export default function DogApp() {
  const [tama, setTama] = useState<TamaState>(TAMA_DEFAULT);
  const [totalSteps, setTotalSteps] = useState(0);
  const [todaySteps, setTodaySteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherState, setWeatherState] = useState<"idle" | "loading" | "denied">("idle");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [tamaAnim, setTamaAnim] = useState<TamaAnim>(null);
  const prevStageIdx = useRef(0);
  const lastMag = useRef(0);
  const lastStepAt = useRef(0);

  useEffect(() => {
    const steps = loadSteps();
    setTotalSteps(steps.total);
    setTodaySteps(steps.today);
    prevStageIdx.current = DOG_STAGES.findLastIndex((s) => steps.total >= s.minSteps);
    const t = loadTama();
    setTama(t);
    saveTama(t);
    fetchWeather();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // アプリが開いている間30秒ごとにたまごっちを更新
  useEffect(() => {
    const id = setInterval(() => {
      setTama((prev) => {
        const next = computeTama(prev);
        saveTama(next);
        return next;
      });
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const addSteps = useCallback((n: number) => {
    setTotalSteps((prev) => {
      const next = prev + n;
      setTodaySteps((td) => {
        const nextTd = td + n;
        saveSteps(next, nextTd);
        return nextTd;
      });
      const newIdx = DOG_STAGES.findLastIndex((s) => next >= s.minSteps);
      if (newIdx > prevStageIdx.current) {
        prevStageIdx.current = newIdx;
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2500);
      }
      return next;
    });
  }, []);

  // 歩数計（DeviceMotionEvent）
  useEffect(() => {
    if (!isTracking) return;
    function handleMotion(e: DeviceMotionEvent) {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
      const now = Date.now();
      if (lastMag.current < 13 && mag >= 13 && now - lastStepAt.current > 350) {
        lastStepAt.current = now;
        addSteps(1);
      }
      lastMag.current = mag;
    }
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [isTracking, addSteps]);

  const toggleTracking = useCallback(async () => {
    if (isTracking) { setIsTracking(false); return; }
    type DMA = { requestPermission: () => Promise<string> };
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof (DeviceMotionEvent as unknown as DMA).requestPermission === "function") {
      const perm = await (DeviceMotionEvent as unknown as DMA).requestPermission();
      if (perm !== "granted") return;
    }
    setIsTracking(true);
  }, [isTracking]);

  const fetchWeather = useCallback(async () => {
    if (!navigator.geolocation) return;
    setWeatherState("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
        );
        const data = await res.json();
        setWeather({ temp: Math.round(data.current.temperature_2m), code: data.current.weather_code });
        setWeatherState("idle");
      },
      () => setWeatherState("denied")
    );
  }, []);

  // たまごっちアクション
  const showAnim = (anim: TamaAnim) => {
    setTamaAnim(anim);
    setTimeout(() => setTamaAnim(null), 1500);
  };

  const feed = useCallback(() => {
    setTama((prev) => {
      const now = Date.now();
      const next: TamaState = {
        ...prev,
        hunger: Math.max(0, prev.hunger - 40),
        happiness: Math.min(100, prev.happiness + 10),
        lastFedAt: now,
        nextPoopAt: prev.nextPoopAt > now ? prev.nextPoopAt : now + POOP_INTERVAL_MS,
        lastUpdatedAt: now,
      };
      saveTama(next);
      return next;
    });
    showAnim("feed");
  }, []);

  const pet = useCallback(() => {
    const now = Date.now();
    setTama((prev) => {
      if (now - prev.lastPettedAt < PET_COOLDOWN_MS) return prev;
      const next: TamaState = {
        ...prev,
        happiness: Math.min(100, prev.happiness + 20),
        lastPettedAt: now,
        lastUpdatedAt: now,
      };
      saveTama(next);
      return next;
    });
    showAnim("pet");
  }, []);

  const clean = useCallback(() => {
    setTama((prev) => {
      if (prev.poopCount === 0) return prev;
      const next: TamaState = {
        ...prev,
        poopCount: 0,
        happiness: Math.min(100, prev.happiness + 15),
        lastUpdatedAt: Date.now(),
      };
      saveTama(next);
      return next;
    });
    showAnim("clean");
  }, []);

  // 派生値
  const stageIdx = DOG_STAGES.findLastIndex((s) => totalSteps >= s.minSteps);
  const stage = DOG_STAGES[stageIdx];
  const nextStage = DOG_STAGES[stageIdx + 1] ?? null;
  const growthPct = nextStage
    ? Math.min(((totalSteps - stage.minSteps) / (nextStage.minSteps - stage.minSteps)) * 100, 100)
    : 100;
  const dailyPct = Math.min((todaySteps / DAILY_GOAL) * 100, 100);
  const goalReached = todaySteps >= DAILY_GOAL;
  const canPet = Date.now() - tama.lastPettedAt >= PET_COOLDOWN_MS;

  const weatherInfo = weather
    ? (WEATHER_MAP[weather.code] ?? { emoji: "🌡️", label: "不明", walkAdvice: "お外を確認しよう" })
    : null;

  const dateLabel = new Date().toLocaleDateString("ja-JP", {
    month: "long", day: "numeric", weekday: "short",
  });

  function statusMsg(): string {
    if (tama.hunger > 80) return "お腹ペコペコ...なにかたべさせて😢";
    if (tama.poopCount >= 3) return "くさい！うんちがいっぱい...😷";
    if (tama.poopCount > 0) return "うんちしたよ！きれいにしてね💩";
    if (tama.happiness < 30) return "さみしいよ...なでてほしいな😞";
    return stage.message;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(to bottom, ${stage.bgFrom}, ${stage.bgTo})` }}
    >
      {/* レベルアップオーバーレイ */}
      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white/90 rounded-3xl px-8 py-6 shadow-2xl text-center animate-bounce">
            <div className="text-5xl mb-2">🎉</div>
            <p className="text-2xl font-black text-amber-700">成長した！</p>
            <p className="text-lg font-bold text-amber-500">{stage.name}</p>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2">
        <div>
          <h1 className="text-lg font-black text-amber-900">🐾 わんわん成長日記</h1>
          <p className="text-xs text-amber-700">{dateLabel}</p>
        </div>
        <div className="bg-white/60 rounded-2xl px-3 py-2 min-w-[72px] text-center">
          {weatherState === "loading" && <p className="text-xs text-gray-400">取得中...</p>}
          {weatherState === "denied" && (
            <button onClick={fetchWeather} className="text-xs text-amber-600">📍 位置情報</button>
          )}
          {weatherState === "idle" && weatherInfo && weather && (
            <>
              <div className="text-2xl leading-none">{weatherInfo.emoji}</div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">{weather.temp}°C</div>
              <div className="text-[10px] text-gray-500">{weatherInfo.label}</div>
            </>
          )}
          {weatherState === "idle" && !weather && (
            <button onClick={fetchWeather} className="text-xs text-amber-600">天気を取得</button>
          )}
        </div>
      </header>

      {weatherInfo && (
        <p className="text-center text-sm font-semibold text-amber-800 px-4 pb-1">
          {weatherInfo.walkAdvice}
        </p>
      )}

      {/* メイン */}
      <main className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col items-center gap-4">

        {/* 犬 */}
        <div className="relative flex flex-col items-center mt-2">
          {tamaAnim && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl font-bold animate-bounce pointer-events-none z-10 whitespace-nowrap">
              {tamaAnim === "feed"  && "🍖 もぐもぐ"}
              {tamaAnim === "pet"   && "❤️"}
              {tamaAnim === "clean" && "✨ きれい！"}
            </div>
          )}
          <div
            className="transition-all duration-700 select-none"
            style={{ fontSize: stage.sizePx, lineHeight: 1 }}
          >
            {stage.emoji}
          </div>
          {tama.poopCount > 0 && (
            <div className="text-2xl mt-1 tracking-widest">
              {"💩".repeat(Math.min(tama.poopCount, 5))}
            </div>
          )}
          <h2 className="text-xl font-black text-amber-900 mt-1">{stage.name}</h2>
          <p className="text-sm text-amber-800 text-center max-w-xs mt-1">{statusMsg()}</p>
        </div>

        {/* たまごっちステータス */}
        <div className="w-full max-w-sm bg-white/60 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-black text-amber-900">📊 ステータス</h3>

          <div>
            <div className="flex justify-between text-xs text-amber-800 mb-1">
              <span>🍖 お腹</span>
              <span>
                {tama.hunger > 80 ? "ペコペコ😢" : tama.hunger > 50 ? "すいてきた" : "満足😊"}
              </span>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-orange-300 to-red-500 transition-all duration-500"
                style={{ width: `${tama.hunger}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-amber-800 mb-1">
              <span>💗 ご機嫌</span>
              <span>
                {tama.happiness > 70 ? "ルンルン🎵" : tama.happiness > 40 ? "まあまあ" : "しょんぼり😞"}
              </span>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-500"
                style={{ width: `${tama.happiness}%` }}
              />
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-2">
          <button
            onClick={feed}
            className="bg-white/70 active:bg-white/90 rounded-2xl py-4 flex flex-col items-center gap-1 text-amber-800 font-bold text-sm shadow-sm"
          >
            <span className="text-3xl">🍖</span>ご飯
          </button>
          <button
            onClick={pet}
            disabled={!canPet}
            className={`rounded-2xl py-4 flex flex-col items-center gap-1 font-bold text-sm shadow-sm transition-opacity ${
              canPet ? "bg-white/70 active:bg-white/90 text-amber-800" : "bg-white/30 text-amber-400"
            }`}
          >
            <span className="text-3xl">✋</span>
            {canPet ? "なでる" : "ちょっと待って"}
          </button>
          <button
            onClick={clean}
            disabled={tama.poopCount === 0}
            className={`rounded-2xl py-4 flex flex-col items-center gap-1 font-bold text-sm shadow-sm transition-opacity ${
              tama.poopCount > 0 ? "bg-white/70 active:bg-white/90 text-amber-800" : "bg-white/30 text-amber-400"
            }`}
          >
            <span className="text-3xl">🧹</span>そうじ
          </button>
        </div>

        {/* 成長バー */}
        <div className="w-full max-w-sm">
          <div className="flex justify-between text-xs text-amber-800 mb-1 font-medium">
            <span>🌱 成長度</span>
            <span>
              {nextStage ? `あと ${(nextStage.minSteps - totalSteps).toLocaleString()}歩` : "MAX！"}
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

        {/* 今日の歩数 */}
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
            <p className="text-center text-sm font-bold text-emerald-600 mt-2">🎉 今日の目標達成！</p>
          )}
        </div>

        <p className="text-xs text-amber-700">
          累計 <span className="font-bold">{totalSteps.toLocaleString()}</span> 歩
        </p>

        {/* 歩数計ボタン */}
        <div className="w-full max-w-sm flex flex-col gap-2">
          <button
            onClick={toggleTracking}
            className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-md transition-colors ${
              isTracking ? "bg-red-400 active:bg-red-500" : "bg-amber-500 active:bg-amber-600"
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

      <footer className="py-3 text-center text-xs text-amber-700">
        毎日お散歩して一緒に大きくなろう 🐾
      </footer>
    </div>
  );
}
