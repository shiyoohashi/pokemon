"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  STAGES, EVO_AT_DAY, getEvolutionTarget, migrateStageId,
  WEATHER_MAP, type CareProfile,
} from "../data/dogStages";
import { ITEMS } from "../data/items";
import MainTab    from "./MainTab";
import StepsTab   from "./StepsTab";
import ShopTab    from "./ShopTab";
import MiniGameTab from "./MiniGameTab";
import ZukanTab   from "./ZukanTab";

type TamaState = {
  hunger: number; hydration: number; happiness: number; vip: number;
  isSulking: boolean; poopCount: number;
  lastFedAt: number; lastWateredAt: number; lastPettedAt: number;
  nextPoopAt: number; lastUpdatedAt: number; birthDate: number;
};

type Tab = "main" | "steps" | "shop" | "game" | "zukan";
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
    nextPoopAt: now + 2 * 3_600_000,
    lastUpdatedAt: now, birthDate: now,
  };
}

function computeTama(prev: TamaState): TamaState {
  const now = Date.now();
  const elapsedH = (now - prev.lastUpdatedAt) / 3_600_000;
  if (elapsedH < 0.001) return prev;

  let { hunger, hydration, happiness, vip, isSulking, poopCount, nextPoopAt } = prev;
  hunger    = clamp(hunger    + elapsedH * 12);
  hydration = clamp(hydration + elapsedH * 16);
  happiness = clamp(happiness - elapsedH * 8, 0, 100);

  let poop = nextPoopAt;
  while (now >= poop && poopCount < 5) { poopCount++; poop += 2 * 3_600_000; }
  nextPoopAt = poop;

  isSulking = hunger > 90 || hydration > 90 || poopCount >= 5;
  if (isSulking) happiness = clamp(happiness - elapsedH * 20, 0, 100);

  return { ...prev, hunger, hydration, happiness, vip, isSulking, poopCount, nextPoopAt, lastUpdatedAt: now };
}

const LS = {
  name: "ck_name", stageId: "ck_stageId",
  totalSteps: "ck_totalSteps", todaySteps: "ck_todaySteps", date: "ck_date",
  tama: "ck_tama", care: "ck_care", coins: "ck_coins", inventory: "ck_inventory",
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
  const [actionLocked, setActionLocked] = useState(false);
  const [evolving, setEvolving]     = useState<string | null>(null);
  const [nameInput, setNameInput]   = useState("");
  const [notifPerm, setNotifPerm]   = useState<NotificationPermission | "unsupported">("unsupported");

  const evolvingRef      = useRef(false);
  const motionCleanupRef = useRef<(() => void) | null>(null);
  const lastHungerNotif  = useRef(0);
  const lastPoopNotif    = useRef(0);

  // ── SW + Notifications ────────────────────────────────────
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/pokemon/sw.js", { scope: "/pokemon/" }).catch(() => {});
    }
    if ("Notification" in window) setNotifPerm(Notification.permission);
  }, []);

  function notify(title: string, body: string, tag: string) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    new Notification(title, { body, icon: "/pokemon/icon.svg", tag });
  }

  // ── Load ───────────────────────────────────────────────────
  useEffect(() => {
    try {
      const rawSid = localStorage.getItem(LS.stageId) ?? "egg";
      const sid    = migrateStageId(rawSid);
      const name   = localStorage.getItem(LS.name)   ?? "";
      const ts     = Number(localStorage.getItem(LS.totalSteps) ?? 0);
      const today  = Number(localStorage.getItem(LS.todaySteps) ?? 0);
      const date   = localStorage.getItem(LS.date)   ?? "";
      const rawT   = localStorage.getItem(LS.tama);
      const rawC   = localStorage.getItem(LS.care);
      const rawCo  = localStorage.getItem(LS.coins);
      const rawInv = localStorage.getItem(LS.inventory);

      setDogName(name);
      setStageId(sid);
      setTotalSteps(ts);
      const todayStr = new Date().toDateString();
      setTodaySteps(date === todayStr ? today : 0);
      localStorage.setItem(LS.date, todayStr);
      if (rawT)   setTama(computeTama(JSON.parse(rawT) as TamaState));
      if (rawC)   setCare(JSON.parse(rawC));
      if (rawCo)  setCoins(Number(rawCo));
      if (rawInv) setInventory(JSON.parse(rawInv));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  // ── Persist ────────────────────────────────────────────────
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

  // ── Tama tick every 30s ────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      setTama(prev => {
        const next = computeTama(prev);
        if (next.isSulking && !prev.isSulking)
          setCare(c => ({ ...c, neglectEvents: c.neglectEvents + 1 }));
        const now = Date.now();
        if (next.hunger > 80 && now - lastHungerNotif.current > 3_600_000) {
          notify("ちくわより 🐾", "おなかペコペコだワン🍖 ごはんをあげて！", "hunger");
          lastHungerNotif.current = now;
        }
        if (next.poopCount > prev.poopCount && now - lastPoopNotif.current > 600_000) {
          notify("ちくわより 🐾", "うんちしたワン💩 きれいにして！", "poop");
          lastPoopNotif.current = now;
        }
        return next;
      });
    }, 30_000);
    return () => clearInterval(id);
  }, [loaded]);

  // ── Visibility change: recalculate tama ───────────────────
  useEffect(() => {
    if (!loaded) return;
    const fn = () => { if (document.visibilityState === "visible") setTama(p => computeTama(p)); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [loaded]);

  // ── Time-based evolution ───────────────────────────────────
  useEffect(() => {
    if (!loaded || evolvingRef.current || !stageId || stageId.includes("_adult")) return;
    const dayAlive = Math.floor((Date.now() - tama.birthDate) / 86_400_000) + 1;
    const evoDay   = EVO_AT_DAY[stageId];
    if (evoDay === undefined || dayAlive < evoDay) return;

    evolvingRef.current = true;
    const nextId = getEvolutionTarget(stageId, care, totalSteps, tama.vip);
    if (!nextId) { evolvingRef.current = false; return; }

    setEvolving(nextId);
    setTimeout(() => {
      setStageId(nextId);
      setEvolving(null);
      evolvingRef.current = false;
    }, 3000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, stageId, tama.lastUpdatedAt, tama.birthDate, tama.vip, care, totalSteps]);

  // ── Pedometer ─────────────────────────────────────────────
  const startMotion = useCallback(() => {
    let lastMag = 0, cooldown = 0;
    function handler(e: DeviceMotionEvent) {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const mag  = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2);
      const diff = Math.abs(mag - lastMag); lastMag = mag;
      if (diff > 3 && cooldown <= 0) {
        setTotalSteps(s => s + 1); setTodaySteps(s => s + 1); cooldown = 8;
      }
      if (cooldown > 0) cooldown--;
    }
    window.addEventListener("devicemotion", handler);
    return () => window.removeEventListener("devicemotion", handler);
  }, []);

  const handleToggleTracking = useCallback(async () => {
    if (isTracking) {
      motionCleanupRef.current?.(); motionCleanupRef.current = null;
      setIsTracking(false); return;
    }
    const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DME.requestPermission === "function") {
      try { if (await DME.requestPermission() !== "granted") return; } catch { return; }
    }
    motionCleanupRef.current = startMotion(); setIsTracking(true);
  }, [isTracking, startMotion]);
  useEffect(() => () => { motionCleanupRef.current?.(); }, []);

  // ── Weather ────────────────────────────────────────────────
  const handleFetchWeather = useCallback(() => {
    if (!navigator.geolocation) return;
    setWeatherState("loading");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        try {
          const d = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`)).json();
          setWeather({ temp: Math.round(d.current.temperature_2m), code: d.current.weather_code });
          setWeatherState("idle");
        } catch { setWeatherState("denied"); }
      },
      () => setWeatherState("denied")
    );
  }, []);

  // ── Action helpers ─────────────────────────────────────────
  const showAnim = useCallback((a: NonNullable<typeof tamaAnim>) => {
    setTamaAnim(a); setActionLocked(true);
    setTimeout(() => { setTamaAnim(null); setActionLocked(false); }, 1500);
  }, []);

  const handleFeed = useCallback(() => {
    if (actionLocked) return;
    setTama(p => ({ ...p, hunger: clamp(p.hunger - 15), lastFedAt: Date.now() }));
    setCare(c => ({ ...c, feedCount: c.feedCount + 1 }));
    showAnim("feed");
  }, [actionLocked, showAnim]);

  const handleWater = useCallback(() => {
    if (actionLocked) return;
    setTama(p => ({ ...p, hydration: clamp(p.hydration - 15), lastWateredAt: Date.now() }));
    setCare(c => ({ ...c, waterCount: c.waterCount + 1 }));
    showAnim("water");
  }, [actionLocked, showAnim]);

  const handlePet = useCallback(() => {
    if (actionLocked || tama.isSulking || Date.now() - tama.lastPettedAt < 60_000) return;
    setTama(p => ({ ...p, happiness: clamp(p.happiness + 10, 0, 100), lastPettedAt: Date.now() }));
    setCare(c => ({ ...c, petCount: c.petCount + 1 }));
    showAnim("pet");
  }, [actionLocked, tama.isSulking, tama.lastPettedAt, showAnim]);

  const handleTapDog = useCallback(() => { handlePet(); }, [handlePet]);

  const handleClean = useCallback(() => {
    if (actionLocked || tama.poopCount === 0) return;
    setTama(p => ({ ...p, poopCount: 0, happiness: clamp(p.happiness + 5, 0, 100) }));
    setCare(c => ({ ...c, cleanCount: c.cleanCount + 1 }));
    showAnim("clean");
  }, [actionLocked, tama.poopCount, showAnim]);

  const handleAddSteps = useCallback((n: number) => {
    setTotalSteps(s => s + n); setTodaySteps(s => s + n);
  }, []);

  // Debug: shift birthDate back 1 day to trigger evolution
  const handleDebugAddDay = useCallback(() => {
    setTama(p => ({ ...p, birthDate: p.birthDate - 86_400_000 }));
  }, []);

  const handleHatch = useCallback(() => {
    const name = nameInput.trim() || "ちくわ";
    const now  = Date.now();
    setDogName(name); setStageId("egg");
    setTama({ ...defaultTama(), birthDate: now, lastUpdatedAt: now });
    setCare({ feedCount: 0, waterCount: 0, petCount: 0, cleanCount: 0, neglectEvents: 0, vipItemsUsed: 0 });
    setTotalSteps(0); setTodaySteps(0); setCoins(0); setInventory({});
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
    if ((item.effect.vip ?? 0) > 0) setCare(c => ({ ...c, vipItemsUsed: c.vipItemsUsed + 1 }));
    setTama(p => ({
      ...p,
      hunger:    item.effect.hunger    !== undefined ? clamp(p.hunger    + item.effect.hunger)            : p.hunger,
      hydration: item.effect.hydration !== undefined ? clamp(p.hydration + item.effect.hydration)         : p.hydration,
      happiness: item.effect.happiness !== undefined ? clamp(p.happiness + item.effect.happiness, 0, 100) : p.happiness,
      vip:       item.effect.vip       !== undefined ? clamp(p.vip       + item.effect.vip,       0, 100) : p.vip,
    }));
    const animMap: Record<string, "feed" | "water" | "pet"> = { food: "feed", drink: "water", toy: "pet" };
    const anim = animMap[item.category]; if (anim) showAnim(anim);
  }, [inventory, showAnim]);

  const handleEarnCoins = useCallback((n: number) => setCoins(c => c + n), []);

  const handleRequestNotif = useCallback(async () => {
    if (!("Notification" in window)) return;
    const p = await Notification.requestPermission(); setNotifPerm(p);
  }, []);

  // ── Render ─────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-4xl animate-float">🐾</div>
      </div>
    );
  }

  // Naming screen
  if (!dogName) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6 gap-8">
        <div className="text-center">
          <div className="text-8xl mb-3 animate-float">🥚</div>
          <h1 className="text-2xl font-black text-gray-900">ちくわのたまご</h1>
          <p className="text-sm text-gray-500 mt-1">なにかが孵化しそう...名前をつけてあげよう！</p>
        </div>
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-sm flex flex-col gap-4">
          <label className="text-sm font-bold text-gray-700">🐾 なまえ</label>
          <input
            type="text" value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleHatch()}
            placeholder="ちくわ" maxLength={10}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 placeholder-gray-300 outline-none focus:border-[#833AB4]"
          />
          <button onClick={handleHatch} className="ig-btn w-full py-4 rounded-2xl font-black text-lg">
            🐣 孵化させる！
          </button>
        </div>
      </div>
    );
  }

  const stage  = STAGES[stageId] ?? STAGES["egg"];
  const wInfo  = weather ? (WEATHER_MAP[weather.code] ?? null) : null;

  const TABS = [
    { id: "main"  as Tab, icon: "🏠", label: "ホーム" },
    { id: "steps" as Tab, icon: "🦶", label: "歩数" },
    { id: "shop"  as Tab, icon: "🛍️", label: "ショップ" },
    { id: "game"  as Tab, icon: "🎮", label: "ゲーム" },
    { id: "zukan" as Tab, icon: "📖", label: "図鑑" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Evolution overlay */}
      {evolving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
             style={{ background: "linear-gradient(135deg, #833AB4cc, #E1306Ccc, #F77737cc)" }}>
          <div className="text-7xl animate-evo-pulse">{stage.emoji}</div>
          <p className="text-white text-3xl font-black animate-pulse">✨ 進化中... ✨</p>
          <div className="text-7xl">{(STAGES[evolving] ?? STAGES["egg"]).emoji}</div>
          <p className="text-white text-xl font-black">{(STAGES[evolving] ?? STAGES["egg"]).name}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-20">
        {tab === "main"  && (
          <MainTab
            dogName={dogName} stageId={stageId} tama={tama}
            weather={weather} weatherState={weatherState}
            tamaAnim={tamaAnim} actionLocked={actionLocked}
            onFeed={handleFeed} onWater={handleWater}
            onPet={handlePet} onClean={handleClean}
            onTapDog={handleTapDog} onFetchWeather={handleFetchWeather}
          />
        )}
        {tab === "steps" && (
          <StepsTab
            totalSteps={totalSteps} todaySteps={todaySteps}
            isTracking={isTracking} notifPermission={notifPerm}
            onAddSteps={handleAddSteps} onToggleTracking={handleToggleTracking}
            onRequestNotif={handleRequestNotif} onDebugAddDay={handleDebugAddDay}
          />
        )}
        {tab === "shop"  && (
          <ShopTab coins={coins} inventory={inventory} onBuy={handleBuy} onUseItem={handleUseItem} />
        )}
        {tab === "game"  && <MiniGameTab onEarnCoins={handleEarnCoins} />}
        {tab === "zukan" && <ZukanTab currentStageId={stageId} />}
      </div>

      {/* Tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-40">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all">
            <span className={`text-xl leading-none ${tab === t.id ? "" : "opacity-40"}`}
                  style={tab === t.id ? { filter: "drop-shadow(0 0 4px #833AB4)" } : {}}>
              {t.icon}
            </span>
            <span className={`text-[10px] font-bold ${tab === t.id ? "ig-text" : "text-gray-400"}`}>
              {t.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
