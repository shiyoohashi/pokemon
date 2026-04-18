"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  STAGES, EVOLUTION_AT, NEXT_STAGE, STAGE_START_STEPS,
  determineBranch, WEATHER_MAP,
  type CareProfile,
} from "../data/dogStages";
import { ITEMS } from "../data/items";
import MainTab from "./MainTab";
import ShopTab from "./ShopTab";
import MiniGameTab from "./MiniGameTab";
import AlbumTab from "./AlbumTab";

type TamaState = {
  hunger: number;
  hydration: number;
  happiness: number;
  vip: number;
  isSulking: boolean;
  poopCount: number;
  lastFedAt: number;
  lastWateredAt: number;
  lastPettedAt: number;
  nextPoopAt: number;
  lastUpdatedAt: number;
  birthDate: number;
};

type Tab = "main" | "shop" | "game" | "album";
type WeatherState = "idle" | "loading" | "denied";

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function defaultTama(): TamaState {
  const now = Date.now();
  return {
    hunger: 0, hydration: 0, happiness: 80, vip: 0,
    isSulking: false, poopCount: 0,
    lastFedAt: now, lastWateredAt: now, lastPettedAt: now,
    nextPoopAt: now + 2 * 3600_000,
    lastUpdatedAt: now, birthDate: now,
  };
}

function computeTama(prev: TamaState): TamaState {
  const now = Date.now();
  const elapsedMs = now - prev.lastUpdatedAt;
  const elapsedHours = elapsedMs / 3_600_000;
  if (elapsedHours < 0.001) return prev;

  let { hunger, hydration, happiness, vip, isSulking, poopCount, nextPoopAt } = prev;

  // Decay rates per hour
  hunger    = clamp(hunger    + elapsedHours * 12);
  hydration = clamp(hydration + elapsedHours * 16);
  happiness = clamp(happiness - elapsedHours * 8, 0, 100);

  // Poop accumulation
  let poop = nextPoopAt;
  while (now >= poop && poopCount < 5) {
    poopCount = Math.min(poopCount + 1, 5);
    poop = poop + 2 * 3600_000;
  }
  nextPoopAt = poop;

  // Neglect → sulking
  const neglected = hunger > 90 || hydration > 90 || poopCount >= 5;
  isSulking = neglected;

  // Sulking penalty on happiness
  if (isSulking) happiness = clamp(happiness - elapsedHours * 20, 0, 100);

  return { ...prev, hunger, hydration, happiness, vip, isSulking, poopCount, nextPoopAt, lastUpdatedAt: now };
}

const LS = {
  name:       "ck_name",
  stageId:    "ck_stageId",
  totalSteps: "ck_totalSteps",
  todaySteps: "ck_todaySteps",
  date:       "ck_date",
  tama:       "ck_tama",
  care:       "ck_care",
  coins:      "ck_coins",
  inventory:  "ck_inventory",
};

export default function ChikuwaApp() {
  const [loaded, setLoaded]         = useState(false);
  const [tab, setTab]               = useState<Tab>("main");
  const [dogName, setDogName]       = useState("");
  const [stageId, setStageId]       = useState("egg");
  const [totalSteps, setTotalSteps] = useState(0);
  const [todaySteps, setTodaySteps] = useState(0);
  const [tama, setTama]             = useState<TamaState>(defaultTama);
  const [care, setCare]             = useState<CareProfile>({ feedCount: 0, waterCount: 0, petCount: 0, cleanCount: 0, neglectEvents: 0, vipItemsUsed: 0 });
  const [coins, setCoins]           = useState(0);
  const [inventory, setInventory]   = useState<Record<string, number>>({});
  const [isTracking, setIsTracking] = useState(false);
  const [weather, setWeather]       = useState<{ temp: number; code: number } | null>(null);
  const [weatherState, setWeatherState] = useState<WeatherState>("denied");
  const [tamaAnim, setTamaAnim]     = useState<"feed" | "water" | "pet" | "clean" | null>(null);
  const [evolving, setEvolving]     = useState<string | null>(null);
  const [nameInput, setNameInput]   = useState("");

  const evolvingRef = useRef(false);
  const motionCleanupRef = useRef<(() => void) | null>(null);

  // ── Load from localStorage ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const name = localStorage.getItem(LS.name) ?? "";
      const sid  = localStorage.getItem(LS.stageId) ?? "egg";
      const ts   = Number(localStorage.getItem(LS.totalSteps) ?? 0);
      const today = Number(localStorage.getItem(LS.todaySteps) ?? 0);
      const date  = localStorage.getItem(LS.date) ?? "";
      const rawTama = localStorage.getItem(LS.tama);
      const rawCare = localStorage.getItem(LS.care);
      const rawCoins = localStorage.getItem(LS.coins);
      const rawInv   = localStorage.getItem(LS.inventory);

      setDogName(name);
      setStageId(sid);
      setTotalSteps(ts);

      // Reset today steps if it's a new day
      const todayStr = new Date().toDateString();
      setTodaySteps(date === todayStr ? today : 0);
      localStorage.setItem(LS.date, todayStr);

      if (rawTama) {
        const parsed = JSON.parse(rawTama) as TamaState;
        setTama(computeTama(parsed));
      }
      if (rawCare) setCare(JSON.parse(rawCare));
      if (rawCoins) setCoins(Number(rawCoins));
      if (rawInv)   setInventory(JSON.parse(rawInv));
    } catch {/* ignore parse errors */}
    setLoaded(true);
  }, []);

  // ── Persist ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(LS.name,       dogName);
    localStorage.setItem(LS.stageId,    stageId);
    localStorage.setItem(LS.totalSteps, String(totalSteps));
    localStorage.setItem(LS.todaySteps, String(todaySteps));
    localStorage.setItem(LS.tama,       JSON.stringify(tama));
    localStorage.setItem(LS.care,       JSON.stringify(care));
    localStorage.setItem(LS.coins,      String(coins));
    localStorage.setItem(LS.inventory,  JSON.stringify(inventory));
  }, [loaded, dogName, stageId, totalSteps, todaySteps, tama, care, coins, inventory]);

  // ── Tama tick every 30s ──────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      setTama(prev => {
        const next = computeTama(prev);
        if (next.isSulking && !prev.isSulking) {
          setCare(c => ({ ...c, neglectEvents: c.neglectEvents + 1 }));
        }
        return next;
      });
    }, 30_000);
    return () => clearInterval(id);
  }, [loaded]);

  // ── Evolution check ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded || evolvingRef.current) return;
    const threshold = EVOLUTION_AT[stageId];
    if (threshold === undefined) return;
    if (totalSteps < threshold) return;

    evolvingRef.current = true;

    let nextId: string;
    if (stageId === "baby") {
      const branch = determineBranch(care, totalSteps, tama.vip);
      nextId = `${branch}_1`;
    } else {
      nextId = NEXT_STAGE[stageId];
      if (!nextId) { evolvingRef.current = false; return; }
    }

    setEvolving(nextId);
    setTimeout(() => {
      setStageId(nextId);
      setEvolving(null);
      evolvingRef.current = false;
    }, 3000);
  }, [loaded, stageId, totalSteps, care, tama.vip]);

  // ── Pedometer (DeviceMotion) ─────────────────────────────────────────────
  const startMotion = useCallback(() => {
    let lastMag = 0;
    let stepCooldown = 0;

    function handleMotion(e: DeviceMotionEvent) {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2);
      const diff = Math.abs(mag - lastMag);
      lastMag = mag;
      if (diff > 3 && stepCooldown <= 0) {
        setTotalSteps(s => s + 1);
        setTodaySteps(s => s + 1);
        stepCooldown = 8;
      }
      if (stepCooldown > 0) stepCooldown--;
    }

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, []);

  const handleToggleTracking = useCallback(async () => {
    if (isTracking) {
      motionCleanupRef.current?.();
      motionCleanupRef.current = null;
      setIsTracking(false);
      return;
    }

    // iOS permission
    const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DME.requestPermission === "function") {
      try {
        const result = await DME.requestPermission();
        if (result !== "granted") return;
      } catch { return; }
    }

    motionCleanupRef.current = startMotion();
    setIsTracking(true);
  }, [isTracking, startMotion]);

  useEffect(() => {
    return () => { motionCleanupRef.current?.(); };
  }, []);

  // ── Weather ──────────────────────────────────────────────────────────────
  const handleFetchWeather = useCallback(() => {
    if (!navigator.geolocation) return;
    setWeatherState("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
          const res  = await fetch(url);
          const data = await res.json();
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
          });
          setWeatherState("idle");
        } catch {
          setWeatherState("denied");
        }
      },
      () => setWeatherState("denied")
    );
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  function showAnim(a: "feed" | "water" | "pet" | "clean") {
    setTamaAnim(a);
    setTimeout(() => setTamaAnim(null), 1500);
  }

  const handleFeed = useCallback(() => {
    setTama(prev => ({ ...prev, hunger: clamp(prev.hunger - 30), lastFedAt: Date.now() }));
    setCare(c => ({ ...c, feedCount: c.feedCount + 1 }));
    showAnim("feed");
  }, []);

  const handleWater = useCallback(() => {
    setTama(prev => ({ ...prev, hydration: clamp(prev.hydration - 30), lastWateredAt: Date.now() }));
    setCare(c => ({ ...c, waterCount: c.waterCount + 1 }));
    showAnim("water");
  }, []);

  const handlePet = useCallback(() => {
    if (tama.isSulking) return;
    const canPet = Date.now() - tama.lastPettedAt >= 60_000;
    if (!canPet) return;
    setTama(prev => ({ ...prev, happiness: clamp(prev.happiness + 15, 0, 100), lastPettedAt: Date.now() }));
    setCare(c => ({ ...c, petCount: c.petCount + 1 }));
    showAnim("pet");
  }, [tama.isSulking, tama.lastPettedAt]);

  const handleClean = useCallback(() => {
    if (tama.poopCount === 0) return;
    setTama(prev => ({ ...prev, poopCount: 0, happiness: clamp(prev.happiness + 5, 0, 100) }));
    setCare(c => ({ ...c, cleanCount: c.cleanCount + 1 }));
    showAnim("clean");
  }, [tama.poopCount]);

  const handleAddSteps = useCallback((n: number) => {
    setTotalSteps(s => s + n);
    setTodaySteps(s => s + n);
  }, []);

  const handleHatch = useCallback(() => {
    const name = nameInput.trim() || "ちくわ";
    const now = Date.now();
    setDogName(name);
    setStageId("baby");
    setTama({ ...defaultTama(), birthDate: now, lastUpdatedAt: now });
    setCare({ feedCount: 0, waterCount: 0, petCount: 0, cleanCount: 0, neglectEvents: 0, vipItemsUsed: 0 });
  }, [nameInput]);

  const handleBuy = useCallback((itemId: string) => {
    const item = ITEMS[itemId];
    if (!item || coins < item.price) return;
    setCoins(c => c - item.price);
    setInventory(inv => ({ ...inv, [itemId]: (inv[itemId] ?? 0) + 1 }));
  }, [coins]);

  const handleUseItem = useCallback((itemId: string) => {
    const item = ITEMS[itemId];
    if (!item || (inventory[itemId] ?? 0) <= 0) return;
    setInventory(inv => ({ ...inv, [itemId]: inv[itemId] - 1 }));

    const isVipItem = (item.effect.vip ?? 0) > 0;
    if (isVipItem) setCare(c => ({ ...c, vipItemsUsed: c.vipItemsUsed + 1 }));

    setTama(prev => ({
      ...prev,
      hunger:    item.effect.hunger    !== undefined ? clamp(prev.hunger    + item.effect.hunger)               : prev.hunger,
      hydration: item.effect.hydration !== undefined ? clamp(prev.hydration + item.effect.hydration)            : prev.hydration,
      happiness: item.effect.happiness !== undefined ? clamp(prev.happiness + item.effect.happiness, 0, 100)    : prev.happiness,
      vip:       item.effect.vip       !== undefined ? clamp(prev.vip       + item.effect.vip,       0, 100)    : prev.vip,
    }));

    const animMap: Record<string, "feed" | "water" | "pet"> = {
      food: "feed", drink: "water", toy: "pet",
    };
    const anim = animMap[item.category];
    if (anim) showAnim(anim);
  }, [inventory]);

  const handleEarnCoins = useCallback((n: number) => {
    setCoins(c => c + n);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-4xl animate-bounce">🐾</div>
      </div>
    );
  }

  // Egg / naming screen
  if (stageId === "egg") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-amber-200 flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-center">
          <div className="text-8xl mb-2 animate-bounce">🥚</div>
          <h1 className="text-2xl font-black text-amber-900">ちくわのたまご</h1>
          <p className="text-sm text-amber-700 mt-1">なにかが孵化しそう...名前をつけてあげよう！</p>
        </div>
        <div className="bg-white/70 rounded-3xl p-6 w-full max-w-sm shadow-md flex flex-col gap-4">
          <label className="text-sm font-bold text-amber-900">🐾 名前をつけてね</label>
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="ちくわ"
            maxLength={10}
            className="w-full border-2 border-amber-300 rounded-xl px-4 py-3 text-lg font-bold text-amber-900 placeholder-amber-300 bg-white/80 outline-none focus:border-amber-500"
          />
          <button
            onClick={handleHatch}
            className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl text-lg shadow active:bg-amber-600"
          >
            🐣 孵化させる！
          </button>
        </div>
      </div>
    );
  }

  const stage = STAGES[stageId] ?? STAGES["egg"];
  const wInfo = weather ? (WEATHER_MAP[weather.code] ?? null) : null;
  const bgClass = wInfo?.scene === "indoor_rain" ? "from-slate-300 to-slate-400"
                : wInfo?.scene === "indoor_snow"  ? "from-blue-100 to-slate-200"
                : "from-amber-100 to-orange-100";

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: "main",  icon: "🏠", label: "ホーム" },
    { id: "shop",  icon: "🛍️", label: "ショップ" },
    { id: "game",  icon: "🎮", label: "ゲーム" },
    { id: "album", icon: "📸", label: "アルバム" },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgClass} flex flex-col`}>
      {/* Evolution overlay */}
      {evolving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 gap-6">
          <div className="text-6xl animate-spin">{stage.emoji}</div>
          <div className="text-3xl animate-pulse">✨ 進化中... ✨</div>
          <div className="text-5xl">{(STAGES[evolving] ?? STAGES["egg"]).emoji}</div>
          <p className="text-white text-xl font-black">{(STAGES[evolving] ?? STAGES["egg"]).name}</p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {tab === "main"  && (
          <MainTab
            dogName={dogName} stageId={stageId} tama={tama}
            totalSteps={totalSteps} todaySteps={todaySteps}
            isTracking={isTracking} weather={weather}
            weatherState={weatherState} tamaAnim={tamaAnim}
            onFeed={handleFeed} onWater={handleWater}
            onPet={handlePet} onClean={handleClean}
            onAddSteps={handleAddSteps}
            onToggleTracking={handleToggleTracking}
            onFetchWeather={handleFetchWeather}
          />
        )}
        {tab === "shop"  && (
          <ShopTab
            coins={coins} inventory={inventory}
            onBuy={handleBuy} onUseItem={handleUseItem}
          />
        )}
        {tab === "game"  && <MiniGameTab onEarnCoins={handleEarnCoins} />}
        {tab === "album" && <AlbumTab />}
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-amber-100 flex">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
              tab === t.id ? "text-amber-600" : "text-amber-400"
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            <span className="text-[10px] font-bold">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
