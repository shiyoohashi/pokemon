"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  STAGES,
  EVOLUTION_AT,
  STAGE_START_STEPS,
  NEXT_STAGE,
  determineBranch,
  DAILY_GOAL,
  WEATHER_MAP,
  type CareProfile,
} from "../data/dogStages";

// ── Tamagotchi types & logic ─────────────────────────────────────────────────

type TamaState = {
  hunger: number;      // 0=満腹 → 100=ペコペコ
  happiness: number;   // 0=しょんぼり → 100=ルンルン
  poopCount: number;
  lastFedAt: number;
  lastPettedAt: number;
  nextPoopAt: number;
  lastUpdatedAt: number;
};

const HUNGER_PER_MIN  = 100 / 600;   // 10h で満腹→ペコペコ
const HAPPY_DECAY_MIN = 100 / 480;   // 8h で最大→最小
const POOP_INTERVAL   = 3 * 3_600_000;
const PET_COOLDOWN    = 60_000;
const MAX_POOP        = 5;

function makeTama(): TamaState {
  const now = Date.now();
  return { hunger: 20, happiness: 80, poopCount: 0, lastFedAt: now, lastPettedAt: 0, nextPoopAt: now + POOP_INTERVAL, lastUpdatedAt: now };
}

function computeTama(s: TamaState): TamaState {
  const now = Date.now();
  const mins = (now - s.lastUpdatedAt) / 60_000;
  if (mins <= 0) return s;
  let hunger = Math.min(100, s.hunger + HUNGER_PER_MIN * mins);
  let happiness = s.happiness
    - HAPPY_DECAY_MIN * mins
    - (hunger > 60 ? HAPPY_DECAY_MIN * 0.5 * mins : 0)
    - (s.poopCount > 0 ? HAPPY_DECAY_MIN * 0.3 * s.poopCount * mins : 0);
  happiness = Math.max(0, Math.min(100, happiness));
  let { poopCount, nextPoopAt } = s;
  if (nextPoopAt && now >= nextPoopAt && poopCount < MAX_POOP) {
    poopCount++;
    nextPoopAt = now + POOP_INTERVAL;
  }
  return { ...s, hunger, happiness, poopCount, nextPoopAt, lastUpdatedAt: now };
}

// ── Storage helpers ───────────────────────────────────────────────────────────

function getToday() { return new Date().toDateString(); }

type SavedData = {
  name: string; stageId: string; total: number; today: number;
  tama: TamaState; care: CareProfile;
};

function loadAll(): SavedData {
  try {
    const name    = localStorage.getItem("dog_name")    ?? "";
    const stageId = localStorage.getItem("dog_stageId") ?? "egg";
    const total   = Math.max(0, parseInt(localStorage.getItem("dog_totalSteps") ?? "0", 10) || 0);
    const date    = localStorage.getItem("dog_date") ?? "";
    const todayRaw = parseInt(localStorage.getItem("dog_todaySteps") ?? "0", 10) || 0;
    const today   = date === getToday() ? todayRaw : 0;
    const tamaRaw = localStorage.getItem("dog_tama");
    const tama    = tamaRaw ? computeTama(JSON.parse(tamaRaw) as TamaState) : makeTama();
    const careRaw = localStorage.getItem("dog_care");
    const care: CareProfile = careRaw
      ? JSON.parse(careRaw)
      : { feedCount: 0, petCount: 0, cleanCount: 0, neglectEvents: 0 };
    return { name, stageId, total, today, tama, care };
  } catch {
    return { name: "", stageId: "egg", total: 0, today: 0, tama: makeTama(), care: { feedCount: 0, petCount: 0, cleanCount: 0, neglectEvents: 0 } };
  }
}

function persist(patch: Partial<{ name: string; stageId: string; total: number; today: number; tama: TamaState; care: CareProfile }>) {
  try {
    if (patch.name     !== undefined) localStorage.setItem("dog_name",       patch.name);
    if (patch.stageId  !== undefined) localStorage.setItem("dog_stageId",    patch.stageId);
    if (patch.total    !== undefined) localStorage.setItem("dog_totalSteps", String(patch.total));
    if (patch.today    !== undefined) {
      localStorage.setItem("dog_todaySteps", String(patch.today));
      localStorage.setItem("dog_date", getToday());
    }
    if (patch.tama     !== undefined) localStorage.setItem("dog_tama",  JSON.stringify(patch.tama));
    if (patch.care     !== undefined) localStorage.setItem("dog_care",  JSON.stringify(patch.care));
  } catch {}
}

// ── Component ─────────────────────────────────────────────────────────────────

type TamaAnim = "feed" | "pet" | "clean" | null;
type Weather  = { temp: number; code: number };

export default function DogApp() {
  const [loaded,      setLoaded]      = useState(false);
  const [dogName,     setDogName]     = useState("");
  const [nameInput,   setNameInput]   = useState("");
  const [isHatching,  setIsHatching]  = useState(false);
  const [stageId,     setStageId]     = useState("egg");
  const [totalSteps,  setTotalSteps]  = useState(0);
  const [todaySteps,  setTodaySteps]  = useState(0);
  const [tama,        setTama]        = useState<TamaState>(makeTama());
  const [care,        setCare]        = useState<CareProfile>({ feedCount: 0, petCount: 0, cleanCount: 0, neglectEvents: 0 });
  const [isTracking,  setIsTracking]  = useState(false);
  const [weather,     setWeather]     = useState<Weather | null>(null);
  const [weatherState,setWeatherState]= useState<"idle"|"loading"|"denied">("idle");
  const [evoNextId,   setEvoNextId]   = useState<string | null>(null);
  const [tamaAnim,    setTamaAnim]    = useState<TamaAnim>(null);

  const evolvingRef = useRef(false);
  const careRef     = useRef(care);
  const lastMag     = useRef(0);
  const lastStepAt  = useRef(0);

  useEffect(() => { careRef.current = care; }, [care]);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const d = loadAll();
    setDogName(d.name);
    setStageId(d.stageId);
    setTotalSteps(d.total);
    setTodaySteps(d.today);
    setTama(d.tama);
    const newCare = d.tama.hunger > 80
      ? { ...d.care, neglectEvents: d.care.neglectEvents + 1 }
      : d.care;
    setCare(newCare);
    persist({ tama: d.tama, care: newCare });
    setLoaded(true);
    fetchWeather();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tama tick ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setTama(prev => { const next = computeTama(prev); persist({ tama: next }); return next; });
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Evolution check ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded || evolvingRef.current || stageId === "egg") return;
    const milestone = EVOLUTION_AT[stageId];
    if (milestone === undefined || totalSteps < milestone) return;

    evolvingRef.current = true;
    const nextId = stageId === "baby"
      ? `${determineBranch(careRef.current, totalSteps)}_1`
      : NEXT_STAGE[stageId];
    if (!nextId) { evolvingRef.current = false; return; }

    setEvoNextId(nextId);
    setTimeout(() => {
      setStageId(nextId);
      persist({ stageId: nextId });
      setEvoNextId(null);
      evolvingRef.current = false;
    }, 3_500);
  }, [totalSteps, stageId, loaded]);

  // ── Pedometer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isTracking) return;
    function onMotion(e: DeviceMotionEvent) {
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
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [isTracking]); // addSteps uses only functional updates — no closure issue

  // ── Handlers ──────────────────────────────────────────────────────────────
  const addSteps = useCallback((n: number) => {
    setTotalSteps(prev => {
      const next = prev + n;
      setTodaySteps(td => { const nextTd = td + n; persist({ total: next, today: nextTd }); return nextTd; });
      return next;
    });
  }, []);

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
      async pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`);
        const data = await res.json();
        setWeather({ temp: Math.round(data.current.temperature_2m), code: data.current.weather_code });
        setWeatherState("idle");
      },
      () => setWeatherState("denied")
    );
  }, []);

  const showAnim = (a: TamaAnim) => { setTamaAnim(a); setTimeout(() => setTamaAnim(null), 1_500); };

  const feed = useCallback(() => {
    setTama(prev => {
      const now = Date.now();
      const next: TamaState = { ...prev, hunger: Math.max(0, prev.hunger - 40), happiness: Math.min(100, prev.happiness + 10), lastFedAt: now, nextPoopAt: prev.nextPoopAt > now ? prev.nextPoopAt : now + POOP_INTERVAL, lastUpdatedAt: now };
      persist({ tama: next });
      return next;
    });
    setCare(prev => { const next = { ...prev, feedCount: prev.feedCount + 1 }; persist({ care: next }); return next; });
    showAnim("feed");
  }, []);

  const pet = useCallback(() => {
    const now = Date.now();
    setTama(prev => {
      if (now - prev.lastPettedAt < PET_COOLDOWN) return prev;
      const next: TamaState = { ...prev, happiness: Math.min(100, prev.happiness + 20), lastPettedAt: now, lastUpdatedAt: now };
      persist({ tama: next });
      return next;
    });
    setCare(prev => { const next = { ...prev, petCount: prev.petCount + 1 }; persist({ care: next }); return next; });
    showAnim("pet");
  }, []);

  const clean = useCallback(() => {
    setTama(prev => {
      if (prev.poopCount === 0) return prev;
      const next: TamaState = { ...prev, poopCount: 0, happiness: Math.min(100, prev.happiness + 15), lastUpdatedAt: Date.now() };
      persist({ tama: next });
      return next;
    });
    setCare(prev => { const next = { ...prev, cleanCount: prev.cleanCount + 1 }; persist({ care: next }); return next; });
    showAnim("clean");
  }, []);

  const handleHatch = useCallback(() => {
    const name = nameInput.trim();
    if (!name) return;
    setIsHatching(true);
    setTimeout(() => {
      setDogName(name);
      setStageId("baby");
      persist({ name, stageId: "baby" });
      setIsHatching(false);
    }, 2_000);
  }, [nameInput]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const stage       = STAGES[stageId] ?? STAGES["egg"];
  const evoAt       = EVOLUTION_AT[stageId];
  const stageStart  = STAGE_START_STEPS[stageId] ?? 0;
  const growthPct   = evoAt !== undefined
    ? Math.min(((totalSteps - stageStart) / (evoAt - stageStart)) * 100, 100)
    : 100;
  const dailyPct    = Math.min((todaySteps / DAILY_GOAL) * 100, 100);
  const canPet      = Date.now() - tama.lastPettedAt >= PET_COOLDOWN;
  const weatherInfo = weather ? (WEATHER_MAP[weather.code] ?? { emoji: "🌡️", label: "不明", walkAdvice: "お外を確認しよう" }) : null;
  const dateLabel   = new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });
  const evoStage    = evoNextId ? STAGES[evoNextId] : null;

  function statusMsg(): string {
    if (tama.hunger > 80)      return `${dogName}お腹ペコペコ...ご飯ちょうだい😢`;
    if (tama.poopCount >= 3)   return "くさい！うんちがいっぱい...😷";
    if (tama.poopCount > 0)    return "うんちしたよ！きれいにしてね💩";
    if (tama.happiness < 30)   return `${dogName}さみしいよ...なでてほしいな😞`;
    return stage.message(dogName);
  }

  // ── Screens ───────────────────────────────────────────────────────────────

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-5xl animate-spin">🐾</div>
      </div>
    );
  }

  // たまご・命名画面
  if (stageId === "egg") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-100 to-amber-200 px-6">
        <div className="bg-white/70 rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className={`text-[120px] leading-none mb-4 transition-all duration-300 ${isHatching ? "animate-spin scale-125" : "animate-bounce"}`}>
            {isHatching ? "💥" : "🥚"}
          </div>
          {isHatching ? (
            <p className="text-2xl font-black text-amber-700 animate-pulse">パカ... 🐣</p>
          ) : (
            <>
              <h1 className="text-2xl font-black text-amber-800 mb-1">たまごが孵化しそう！</h1>
              <p className="text-sm text-amber-600 mb-6">なまえをつけてあげよう 🌱</p>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleHatch()}
                placeholder="なまえをいれてね"
                maxLength={10}
                className="w-full border-2 border-amber-300 rounded-2xl px-4 py-3 text-center text-xl font-bold text-amber-900 bg-amber-50 focus:outline-none focus:border-amber-500 mb-4"
              />
              <button
                onClick={handleHatch}
                disabled={!nameInput.trim()}
                className={`w-full py-4 rounded-2xl font-black text-white text-lg transition-all ${nameInput.trim() ? "bg-amber-500 active:bg-amber-600 shadow-md" : "bg-amber-200 cursor-not-allowed"}`}
              >
                {nameInput.trim() ? `「${nameInput.trim()}」にする 🥚` : "なまえをいれてね"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // メインゲーム画面
  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(to bottom, ${stage.bgFrom}, ${stage.bgTo})` }}>

      {/* 進化オーバーレイ */}
      {evoStage && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: `linear-gradient(to bottom, ${evoStage.bgFrom}, ${evoStage.bgTo})` }}
        >
          <p className="text-2xl font-black text-white/90 mb-6 animate-pulse">✨ 進化！ ✨</p>
          <div className="animate-bounce" style={{ fontSize: evoStage.sizePx, lineHeight: 1 }}>{evoStage.emoji}</div>
          <p className="text-3xl font-black text-white mt-6">{evoStage.name}</p>
          <p className="text-lg text-white/80 mt-2">{dogName}、すごい！</p>
        </div>
      )}

      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2">
        <div>
          <h1 className="text-lg font-black text-amber-900">🐾 {dogName}の成長日記</h1>
          <p className="text-xs text-amber-700">{dateLabel}</p>
        </div>
        <div className="bg-white/60 rounded-2xl px-3 py-2 min-w-[72px] text-center">
          {weatherState === "loading" && <p className="text-xs text-gray-400">取得中...</p>}
          {weatherState === "denied"  && <button onClick={fetchWeather} className="text-xs text-amber-600">📍 位置情報</button>}
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
        <p className="text-center text-sm font-semibold text-amber-800 px-4 pb-1">{weatherInfo.walkAdvice}</p>
      )}

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
          <div className="transition-all duration-700 select-none" style={{ fontSize: stage.sizePx, lineHeight: 1 }}>
            {stage.emoji}
          </div>
          {tama.poopCount > 0 && (
            <div className="text-2xl mt-1 tracking-widest">{"💩".repeat(Math.min(tama.poopCount, 5))}</div>
          )}
          <h2 className="text-xl font-black text-amber-900 mt-1">{stage.name}</h2>
          <p className="text-sm text-amber-800 text-center max-w-xs mt-1">{statusMsg()}</p>
        </div>

        {/* ステータスバー */}
        <div className="w-full max-w-sm bg-white/60 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-black text-amber-900">📊 ステータス</h3>
          <div>
            <div className="flex justify-between text-xs text-amber-800 mb-1">
              <span>🍖 お腹</span>
              <span>{tama.hunger > 80 ? "ペコペコ😢" : tama.hunger > 50 ? "すいてきた" : "満足😊"}</span>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-3 overflow-hidden">
              <div className="h-3 rounded-full bg-gradient-to-r from-orange-300 to-red-500 transition-all duration-500" style={{ width: `${tama.hunger}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-amber-800 mb-1">
              <span>💗 ご機嫌</span>
              <span>{tama.happiness > 70 ? "ルンルン🎵" : tama.happiness > 40 ? "まあまあ" : "しょんぼり😞"}</span>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-3 overflow-hidden">
              <div className="h-3 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-500" style={{ width: `${tama.happiness}%` }} />
            </div>
          </div>
        </div>

        {/* アクション */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-2">
          <button onClick={feed} className="bg-white/70 active:bg-white/90 rounded-2xl py-4 flex flex-col items-center gap-1 text-amber-800 font-bold text-sm shadow-sm">
            <span className="text-3xl">🍖</span>ご飯
          </button>
          <button onClick={pet} disabled={!canPet}
            className={`rounded-2xl py-4 flex flex-col items-center gap-1 font-bold text-sm shadow-sm ${canPet ? "bg-white/70 active:bg-white/90 text-amber-800" : "bg-white/30 text-amber-400"}`}>
            <span className="text-3xl">✋</span>
            <span className="text-[11px] text-center leading-tight">{canPet ? "なでる" : "ちょっと\n待って"}</span>
          </button>
          <button onClick={clean} disabled={tama.poopCount === 0}
            className={`rounded-2xl py-4 flex flex-col items-center gap-1 font-bold text-sm shadow-sm ${tama.poopCount > 0 ? "bg-white/70 active:bg-white/90 text-amber-800" : "bg-white/30 text-amber-400"}`}>
            <span className="text-3xl">🧹</span>そうじ
          </button>
        </div>

        {/* 成長バー */}
        <div className="w-full max-w-sm">
          <div className="flex justify-between text-xs text-amber-800 mb-1 font-medium">
            <span>🌱 成長度</span>
            <span>{evoAt !== undefined ? `あと ${Math.max(0, evoAt - totalSteps).toLocaleString()}歩` : "MAX！"}</span>
          </div>
          <div className="w-full bg-white/40 rounded-full h-4 overflow-hidden">
            <div className="h-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700" style={{ width: `${growthPct}%` }} />
          </div>

          {/* 赤ちゃん段階のみ：進化パスヒント */}
          {stageId === "baby" && (
            <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] text-center text-amber-800 font-bold">
              <div className="bg-orange-100/80 rounded-xl py-1.5 px-1">🏃 よく歩く<br/><span className="text-[9px] font-normal">→ ゴールデン🦮</span></div>
              <div className="bg-pink-100/80  rounded-xl py-1.5 px-1">💝 よくなでる<br/><span className="text-[9px] font-normal">→ プードル🐩</span></div>
              <div className="bg-green-100/80 rounded-xl py-1.5 px-1">🌿 放任する<br/><span className="text-[9px] font-normal">→ ウルフ🐺</span></div>
            </div>
          )}
        </div>

        {/* 今日の歩数 */}
        <div className="w-full max-w-sm bg-white/60 rounded-2xl p-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-bold text-amber-900">今日の歩数</span>
            <span className="text-xs text-amber-600">目標 {DAILY_GOAL.toLocaleString()}歩</span>
          </div>
          <div className="text-4xl font-black text-amber-800 mb-2 tabular-nums">
            {todaySteps.toLocaleString()}<span className="text-base font-normal ml-1">歩</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-3 overflow-hidden">
            <div className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500" style={{ width: `${dailyPct}%` }} />
          </div>
          {todaySteps >= DAILY_GOAL && (
            <p className="text-center text-sm font-bold text-emerald-600 mt-2">🎉 今日の目標達成！</p>
          )}
        </div>

        <p className="text-xs text-amber-700">累計 <span className="font-bold">{totalSteps.toLocaleString()}</span> 歩</p>

        {/* 歩数コントロール */}
        <div className="w-full max-w-sm flex flex-col gap-2">
          <button onClick={toggleTracking}
            className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-md transition-colors ${isTracking ? "bg-red-400 active:bg-red-500" : "bg-amber-500 active:bg-amber-600"}`}>
            {isTracking ? "⏹ 計測停止" : "▶ 歩数計測スタート"}
          </button>
          <div className="flex gap-2">
            <button onClick={() => addSteps(100)}   className="flex-1 py-3 bg-white/60 active:bg-white/80 rounded-2xl text-sm font-bold text-amber-800">+100歩</button>
            <button onClick={() => addSteps(1000)}  className="flex-1 py-3 bg-white/60 active:bg-white/80 rounded-2xl text-sm font-bold text-amber-800">+1,000歩</button>
          </div>
        </div>
      </main>

      <footer className="py-3 text-center text-xs text-amber-700">
        毎日お散歩して一緒に大きくなろう 🐾
      </footer>
    </div>
  );
}
