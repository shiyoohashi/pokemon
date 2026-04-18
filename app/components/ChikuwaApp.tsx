"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  STAGES, EVO_AT_DAY, NEXT_STAGE,
  determineBranch,  WEATHER_MAP,
  type CareProfile,
} from "../data/dogStages";
import { ITEMS } from "../data/items";
import MainTab   from "./MainTab";
import StepsTab  from "./StepsTab";
import ShopTab   from "./ShopTab";
import MiniGameTab from "./MiniGameTab";
import ZukanTab  from "./ZukanTab";
import AlbumTab  from "./AlbumTab";

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

  // Poop accumulation
  let poop = nextPoopAt;
  while (now >= poop && poopCount < 5) {
    poopCount++;
    poop += 2 * 3_600_000;
  }
  nextPoopAt = poop;

  const neglected = hunger > 90 || hydration > 90 || poopCount >= 5;
  isSulking = neglected;
  if (isSulking) happiness = clamp(happiness - elapsedH * 20, 0, 100);

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
  const [notifPerm, setNotifPerm]   = useState<NotificationPermission | "unsupported">("unsupported");

  const evolvingRef         = useRef(false);
  const motionCleanupRef    = useRef<(() => void) | null>(null);
  const lastHungerNotifRef  = useRef(0);
  const lastPoopNotifRef    = useRef(0);

  // ── Service worker + notification init ──────────────────────────────────
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/pokemon/sw.js", { scope: "/pokemon/" }).catch(() => {});
    }
    if ("Notification" in window) {
      setNotifPerm(Notification.permission);
    }
  }, []);

  function notify(title: string, body: string, tag: string) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    new Notification(title, { body, icon: "/pokemon/icon.svg", tag });
  }

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const name   = localStorage.getItem(LS.name)   ?? "";
      const sid    = localStorage.getItem(LS.stageId) ?? "egg";
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
    } catch {/* ignore */}
    setLoaded(true);
  }, []);

  // ── Persist ──────────────────────────────────────────────────────────────
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
        // Neglect event
        if (next.isSulking && !prev.isSulking) {
          setCare(c => ({ ...c, neglectEvents: c.neglectEvents + 1 }));
        }
        // Notifications
        const now = Date.now();
        if (next.hunger > 80 && now - lastHungerNotifRef.current > 3_600_000) {
          notify("ちくわより 🐾", "おなかペコペコだワン🍖 ごはんをあげて！", "hunger");
          lastHungerNotifRef.current = now;
        }
        if (next.poopCount > prev.poopCount && now - lastPoopNotifRef.current > 600_000) {
          notify("ちくわより 🐾", "うんちしたワン💩 きれいにして！", "poop");
          lastPoopNotifRef.current = now;
        }
        return next;
      });
    }, 30_000);
    return () => clearInterval(id);
  }, [loaded]);

  // ── Time-based evolution ─────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded || evolvingRef.current || stageId === "egg") return;
    const dayAlive  = Math.floor((Date.now() - tama.birthDate) / 86_400_000) + 1;
    const evoAtDay  = EVO_AT_DAY[stageId];

    // Adult graduation at day 30
    if (evoAtDay === undefined && stageId.endsWith("_adult") && dayAlive >= 30) {
      // Future: add to album and restart
      return;
    }

    if (evoAtDay === undefined || dayAlive < evoAtDay) return;

    evolvingRef.current = true;
    let nextId: string;

    if (stageId === "baby") {
      // Legacy compat: treat as pup
      const branch = determineBranch(care, totalSteps, tama.vip);
      nextId = `${branch}_pup`;
    } else if (stageId.endsWith("_pup") && !NEXT_STAGE[stageId]) {
      evolvingRef.current = false;
      return;
    } else if (stageId === "egg") {
      const branch = determineBranch(care, totalSteps, tama.vip);
      nextId = `${branch}_pup`;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, stageId, tama.birthDate, tama.lastUpdatedAt, tama.vip, care, totalSteps]);

  // Also check evolution on page visibility change (app comes to foreground)
  useEffect(() => {
    if (!loaded) return;
    const onVisible = () => {
      setTama(prev => computeTama(prev));
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loaded]);

  // ── Pedometer ────────────────────────────────────────────────────────────
  const startMotion = useCallback(() => {
    let lastMag    = 0;
    let cooldown   = 0;
    function handleMotion(e: DeviceMotionEvent) {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const mag  = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2);
      const diff = Math.abs(mag - lastMag);
      lastMag    = mag;
      if (diff > 3 && cooldown <= 0) {
        setTotalSteps(s => s + 1);
        setTodaySteps(s => s + 1);
        cooldown = 8;
      }
      if (cooldown > 0) cooldown--;
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
    const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DME.requestPermission === "function") {
      try {
        const r = await DME.requestPermission();
        if (r !== "granted") return;
      } catch { return; }
    }
    motionCleanupRef.current = startMotion();
    setIsTracking(true);
  }, [isTracking, startMotion]);

  useEffect(() => () => { motionCleanupRef.current?.(); }, []);

  // ── Weather ──────────────────────────────────────────────────────────────
  const handleFetchWeather = useCallback(() => {
    if (!navigator.geolocation) return;
    setWeatherState("loading");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        try {
          const url  = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
          const data = await (await fetch(url)).json();
          setWeather({ temp: Math.round(data.current.temperature_2m), code: data.current.weather_code });
          setWeatherState("idle");
        } catch { setWeatherState("denied"); }
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
    setTama(p => ({ ...p, hunger: clamp(p.hunger - 15), lastFedAt: Date.now() }));
    setCare(c => ({ ...c, feedCount: c.feedCount + 1 }));
    showAnim("feed");
  }, []);

  const handleWater = useCallback(() => {
    setTama(p => ({ ...p, hydration: clamp(p.hydration - 15), lastWateredAt: Date.now() }));
    setCare(c => ({ ...c, waterCount: c.waterCount + 1 }));
    showAnim("water");
  }, []);

  const handlePet = useCallback(() => {
    const now = Date.now();
    if (tama.isSulking || now - tama.lastPettedAt < 60_000) return;
    setTama(p => ({ ...p, happiness: clamp(p.happiness + 10, 0, 100), lastPettedAt: now }));
    setCare(c => ({ ...c, petCount: c.petCount + 1 }));
    showAnim("pet");
  }, [tama.isSulking, tama.lastPettedAt]);

  const handleTapDog = useCallback(() => {
    handlePet();
  }, [handlePet]);

  const handleClean = useCallback(() => {
    if (tama.poopCount === 0) return;
    setTama(p => ({ ...p, poopCount: 0, happiness: clamp(p.happiness + 5, 0, 100) }));
    setCare(c => ({ ...c, cleanCount: c.cleanCount + 1 }));
    showAnim("clean");
  }, [tama.poopCount]);

  const handleAddSteps = useCallback((n: number) => {
    setTotalSteps(s => s + n);
    setTodaySteps(s => s + n);
  }, []);

  const handleHatch = useCallback(() => {
    const name = nameInput.trim() || "ちくわ";
    const now  = Date.now();
    setDogName(name);
    setStageId("egg");
    setTama({ ...defaultTama(), birthDate: now, lastUpdatedAt: now });
    setCare({ feedCount: 0, waterCount: 0, petCount: 0, cleanCount: 0, neglectEvents: 0, vipItemsUsed: 0 });
    // After naming, immediately mark egg as "started", evolution at day 3
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
    const isVip = (item.effect.vip ?? 0) > 0;
    if (isVip) setCare(c => ({ ...c, vipItemsUsed: c.vipItemsUsed + 1 }));
    setTama(p => ({
      ...p,
      hunger:    item.effect.hunger    !== undefined ? clamp(p.hunger    + item.effect.hunger)            : p.hunger,
      hydration: item.effect.hydration !== undefined ? clamp(p.hydration + item.effect.hydration)         : p.hydration,
      happiness: item.effect.happiness !== undefined ? clamp(p.happiness + item.effect.happiness, 0, 100) : p.happiness,
      vip:       item.effect.vip       !== undefined ? clamp(p.vip       + item.effect.vip,       0, 100) : p.vip,
    }));
    const animMap: Record<string, "feed" | "water" | "pet"> = { food: "feed", drink: "water", toy: "pet" };
    const anim = animMap[item.category];
    if (anim) showAnim(anim);
  }, [inventory]);

  const handleEarnCoins = useCallback((n: number) => setCoins(c => c + n), []);

  const handleRequestNotif = useCallback(async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-4xl animate-bounce">🐾</div>
      </div>
    );
  }

  // Egg naming screen
  if (stageId === "egg" && !dogName) {
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
            onKeyDown={e => e.key === "Enter" && handleHatch()}
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

  const stage    = STAGES[stageId] ?? STAGES["egg"];
  const wInfo    = weather ? (WEATHER_MAP[weather.code] ?? null) : null;
  const bgClass  = wInfo?.scene === "indoor_rain" ? "from-slate-300 to-slate-400"
                 : wInfo?.scene === "indoor_snow"  ? "from-blue-100 to-slate-200"
                 : "from-amber-100 to-orange-100";

  const TABS = [
    { id: "main"  as Tab, icon: "🏠", label: "ホーム" },
    { id: "steps" as Tab, icon: "🦶", label: "歩数" },
    { id: "shop"  as Tab, icon: "🛍️", label: "ショップ" },
    { id: "game"  as Tab, icon: "🎮", label: "ゲーム" },
    { id: "zukan" as Tab, icon: "📖", label: "図鑑" },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgClass} flex flex-col`}>
      {/* Evolution overlay */}
      {evolving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 gap-4">
          <div className="text-6xl animate-evo-flash">{stage.emoji}</div>
          <div className="text-3xl text-white animate-pulse font-black">✨ 進化中... ✨</div>
          <div className="text-6xl">{(STAGES[evolving] ?? STAGES["egg"]).emoji}</div>
          <p className="text-white text-xl font-black mt-2">{(STAGES[evolving] ?? STAGES["egg"]).name}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-20">
        {tab === "main"  && (
          <MainTab
            dogName={dogName} stageId={stageId} tama={tama}
            weather={weather} weatherState={weatherState} tamaAnim={tamaAnim}
            onFeed={handleFeed} onWater={handleWater}
            onPet={handlePet} onClean={handleClean}
            onTapDog={handleTapDog}
            onFetchWeather={handleFetchWeather}
          />
        )}
        {tab === "steps" && (
          <StepsTab
            totalSteps={totalSteps} todaySteps={todaySteps}
            isTracking={isTracking} notifPermission={notifPerm}
            onAddSteps={handleAddSteps}
            onToggleTracking={handleToggleTracking}
            onRequestNotif={handleRequestNotif}
          />
        )}
        {tab === "shop"  && (
          <ShopTab coins={coins} inventory={inventory} onBuy={handleBuy} onUseItem={handleUseItem} />
        )}
        {tab === "game"  && <MiniGameTab onEarnCoins={handleEarnCoins} />}
        {tab === "zukan" && <ZukanTab currentStageId={stageId} />}
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-amber-100 flex safe-area-bottom">
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
