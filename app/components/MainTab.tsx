"use client";

import { useState, useCallback } from "react";
import { STAGES, EVO_AT_DAY, WEATHER_MAP, type Stage } from "../data/dogStages";
import { ITEMS } from "../data/items";

type TamaState = {
  hunger: number; hydration: number; happiness: number; vip: number;
  isSulking: boolean; poopCount: number;
  lastPettedAt: number; birthDate: number;
};

type Props = {
  dogName: string; stageId: string; tama: TamaState;
  weather: { temp: number; code: number } | null;
  weatherState: "idle" | "loading" | "denied";
  tamaAnim: "feed" | "water" | "pet" | "clean" | null;
  actionLocked: boolean;
  inventory: Record<string, number>;
  onFeed: () => void; onWater: () => void;
  onPet: () => void; onClean: () => void;
  onTapDog: () => void; onFetchWeather: () => void;
  onUseItem: (itemId: string) => void;
  onDebugAddDay: () => void;
};

// ── Scene theme: season × weather ────────────────────────────
type SceneTheme = {
  sky: string;        // CSS gradient
  ground: string;     // ground hex color
  treeL: string;      // left decoration emoji
  treeR: string;      // right decoration emoji
  skyDeco: string;    // sky decoration emoji
  light: boolean;     // true = use white text
};

const THEMES: Record<string, SceneTheme> = {
  spring_clear:  { sky: "linear-gradient(to bottom,#87CEEB 0%,#C5EAFB 60%,#B8E4A8 100%)", ground: "#6BCB5C", treeL: "🌸", treeR: "🌸", skyDeco: "☀️",  light: false },
  spring_cloudy: { sky: "linear-gradient(to bottom,#A8BCC8 0%,#C8D8E4 100%)",             ground: "#5A9E50", treeL: "🌸", treeR: "🌿", skyDeco: "⛅",  light: false },
  spring_rain:   { sky: "linear-gradient(to bottom,#5C7A8C 0%,#8EAAB8 100%)",             ground: "#4A8840", treeL: "🌧️",treeR: "🌿", skyDeco: "🌧️", light: true  },
  spring_snow:   { sky: "linear-gradient(to bottom,#B8D0DC 0%,#D8ECF4 100%)",             ground: "#E8F4EC", treeL: "🌸", treeR: "❄️", skyDeco: "🌨️", light: false },
  summer_clear:  { sky: "linear-gradient(to bottom,#1565C0 0%,#42A5F5 50%,#B3E5FC 100%)", ground: "#388E3C", treeL: "🌳", treeR: "🌳", skyDeco: "☀️",  light: true  },
  summer_cloudy: { sky: "linear-gradient(to bottom,#455A64 0%,#78909C 100%)",             ground: "#2E7D32", treeL: "🌳", treeR: "🌿", skyDeco: "⛅",  light: true  },
  summer_rain:   { sky: "linear-gradient(to bottom,#263238 0%,#455A64 100%)",             ground: "#1B5E20", treeL: "⛈️",treeR: "🌿", skyDeco: "⛈️", light: true  },
  summer_snow:   { sky: "linear-gradient(to bottom,#78909C 0%,#B0BEC5 100%)",             ground: "#E0E0E0", treeL: "🌳", treeR: "❄️", skyDeco: "❄️",  light: true  },
  autumn_clear:  { sky: "linear-gradient(to bottom,#5B8DB8 0%,#E8A87C 65%,#C8845C 100%)", ground: "#8D6E63", treeL: "🍂", treeR: "🍁", skyDeco: "☀️",  light: true  },
  autumn_cloudy: { sky: "linear-gradient(to bottom,#6B5B4E 0%,#9E8878 100%)",             ground: "#5D4037", treeL: "🍂", treeR: "🍁", skyDeco: "☁️",  light: true  },
  autumn_rain:   { sky: "linear-gradient(to bottom,#37474F 0%,#607D8B 100%)",             ground: "#4E342E", treeL: "🌧️",treeR: "🍂", skyDeco: "🌧️", light: true  },
  autumn_snow:   { sky: "linear-gradient(to bottom,#B0BEC5 0%,#D4E0E8 100%)",             ground: "#D7CCC8", treeL: "🍁", treeR: "❄️", skyDeco: "🌨️", light: false },
  winter_clear:  { sky: "linear-gradient(to bottom,#B3D9F5 0%,#E8F5FD 100%)",             ground: "#ECEFF1", treeL: "🌲", treeR: "⛄", skyDeco: "❄️",  light: false },
  winter_cloudy: { sky: "linear-gradient(to bottom,#78909C 0%,#B0BEC5 100%)",             ground: "#CFD8DC", treeL: "🌲", treeR: "🌲", skyDeco: "☁️",  light: true  },
  winter_rain:   { sky: "linear-gradient(to bottom,#455A64 0%,#607D8B 100%)",             ground: "#B0BEC5", treeL: "🌧️",treeR: "🌲", skyDeco: "🌧️", light: true  },
  winter_snow:   { sky: "linear-gradient(to bottom,#D4E8F8 0%,#F0F8FF 100%)",             ground: "#FFFFFF", treeL: "⛄", treeR: "❄️", skyDeco: "🌨️", light: false },
};

function getTheme(month: number, code: number | null): SceneTheme {
  const season = month <= 2 || month === 12 ? "winter"
               : month <= 5 ? "spring"
               : month <= 8 ? "summer" : "autumn";
  const w = code === null        ? "clear"
          : code <= 2            ? "clear"
          : code >= 71 && code <= 77 ? "snow"
          : code >= 51           ? "rain" : "cloudy";
  return THEMES[`${season}_${w}`] ?? THEMES["summer_clear"];
}

function speechMsg(tama: TamaState, dogName: string): string {
  const h = new Date().getHours();
  if (tama.isSulking)        return "いじけてるワン…ケアして💢";
  if (tama.hunger > 85)      return "おなかペコペコだワン🍖";
  if (tama.hunger > 65)      return "ちょっとおなかすいたワン";
  if (tama.hydration > 85)   return "のどカラカラだワン💧";
  if (tama.hydration > 65)   return "お水飲みたいワン";
  if (tama.poopCount >= 3)   return "くさいワン！きれいにして😷";
  if (tama.poopCount > 0)    return "うんちしたワン💩";
  if (tama.happiness < 25)   return "さみしいワン…なでてほしい😢";
  if (tama.happiness < 50)   return "もうちょっとかまってワン";
  if (h >= 22 || h < 5)      return "ねむいワン…😴zzz";
  if (h >= 5  && h < 9)      return "おはようワン！☀️";
  if (h >= 12 && h < 13)     return "お昼ねしたいワン🌙";
  if (tama.happiness > 85)   return "たのしいワン！✨";
  if (tama.vip >= 60)        return "VIPな気分だワン👑";
  return `${dogName}だワン🐾`;
}

export default function MainTab({
  dogName, stageId, tama, weather, weatherState, tamaAnim, actionLocked,
  inventory, onFeed, onWater, onPet, onClean, onTapDog, onFetchWeather,
  onUseItem, onDebugAddDay,
}: Props) {
  const [petAnim, setPetAnim]     = useState<"happy" | "shake" | null>(null);
  const [speechKey, setSpeechKey] = useState(0);
  const [imgError, setImgError]   = useState(false);

  const stage: Stage  = STAGES[stageId] ?? STAGES["egg"];
  const dayAlive      = Math.floor((Date.now() - tama.birthDate) / 86_400_000) + 1;
  const evoAtDay      = EVO_AT_DAY[stageId];
  const canPet        = Date.now() - tama.lastPettedAt >= 60_000;
  const wInfo         = weather ? (WEATHER_MAP[weather.code] ?? null) : null;
  const dateLabel     = new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });
  const month         = new Date().getMonth() + 1;
  const theme         = getTheme(month, weather?.code ?? null);
  const tc            = theme.light ? "text-white/80" : "text-gray-700/80";
  const useRealImg    = stageId !== "egg" && !imgError;

  const handleTap = useCallback(() => {
    const canAct = canPet && !tama.isSulking && !actionLocked;
    setPetAnim(canAct ? "happy" : "shake");
    setSpeechKey(k => k + 1);
    onTapDog();
  }, [canPet, tama.isSulking, actionLocked, onTapDog]);

  const satiety  = 100 - tama.hunger;
  const hydrated = 100 - tama.hydration;

  const meters = [
    { label: "🍖 満腹度",  val: satiety,         bar: "from-orange-400 to-amber-400",   bg: "bg-orange-50", text: satiety > 80 ? "おなかいっぱい😊" : satiety > 40 ? "ちょっとすいてきた" : "ペコペコ😢" },
    { label: "💧 水分量",  val: hydrated,         bar: "from-sky-400 to-blue-500",       bg: "bg-sky-50",    text: hydrated > 80 ? "うるおってる💧" : hydrated > 40 ? "ちょっと乾燥" : "カラカラ😢" },
    { label: "💗 ごきげん", val: tama.happiness,  bar: "from-pink-400 to-rose-500",      bg: "bg-pink-50",   text: tama.happiness > 70 ? "ルンルン🎵" : tama.happiness > 40 ? "まあまあ" : "しょんぼり😞" },
    { label: "✨ VIP度",   val: tama.vip,         bar: "from-purple-400 to-violet-600",  bg: "bg-purple-50", text: tama.vip >= 80 ? "超VIP👑" : tama.vip >= 40 ? "VIPメンバー" : "一般犬🐾" },
  ];

  const heldItems = Object.entries(inventory).filter(([, c]) => c > 0);

  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-lg font-black text-gray-900">🐾 {dogName}の育成日記</h1>
          <p className="text-xs text-gray-500">{dateLabel}　Day {dayAlive} / 30</p>
          {evoAtDay !== undefined && (
            <p className="text-[10px] text-gray-400">次の進化まで あと {Math.max(0, evoAtDay - dayAlive)} 日</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onDebugAddDay}
            className="bg-gray-100 border border-dashed border-gray-300 rounded-xl px-2 py-1.5 text-[10px] font-bold text-gray-500 active:bg-gray-200">
            🛠+1日
          </button>
          <div className="bg-white rounded-2xl px-3 py-2 min-w-[60px] text-center shadow-sm border border-gray-100">
            {weatherState === "loading" && <p className="text-xs text-gray-400">取得中</p>}
            {weatherState === "denied"  && (
              <button onClick={onFetchWeather} className="text-xs ig-text font-bold">📍 天気</button>
            )}
            {weatherState === "idle" && wInfo && weather ? (
              <>
                <div className="text-2xl leading-none">{wInfo.emoji}</div>
                <div className="text-xs font-bold text-gray-700 mt-0.5">{weather.temp}°C</div>
              </>
            ) : weatherState === "idle" ? (
              <button onClick={onFetchWeather} className="text-[10px] ig-text font-bold">天気取得</button>
            ) : null}
          </div>
        </div>
      </div>

      {wInfo && <p className="text-center text-xs font-semibold text-gray-500 -mt-1">{wInfo.walkAdvice}</p>}

      {/* ── Outdoor scene ── */}
      <div className="w-full rounded-3xl relative overflow-hidden"
           style={{ background: theme.sky, minHeight: 270 }}>

        {/* Sky decoration */}
        <div className="absolute top-3 right-3 text-2xl opacity-80 pointer-events-none select-none">
          {theme.skyDeco}
        </div>
        {weather && (
          <p className={`absolute top-3 left-3 text-xs font-bold ${tc}`}>{weather.temp}°C</p>
        )}

        {/* Ground layer — trees sit on it and extend upward */}
        <div className="absolute bottom-0 left-0 right-0 h-12 flex items-start justify-between px-4"
             style={{ backgroundColor: theme.ground }}>
          <span className="text-2xl select-none" style={{ marginTop: -18 }}>{theme.treeL}</span>
          <span className="text-2xl select-none" style={{ marginTop: -18 }}>{theme.treeR}</span>
        </div>

        {/* Character content — z-10 so it renders above ground layer */}
        <div className="relative z-10 flex flex-col items-center px-4 pt-4 pb-16">

          {/* Speech bubble */}
          <div key={speechKey} className="animate-speech mb-2 max-w-[85%] relative">
            <div className="bg-white/95 rounded-2xl px-4 py-2 shadow-sm">
              <p className="text-sm font-bold text-gray-800 whitespace-nowrap">{speechMsg(tama, dogName)}</p>
            </div>
            <div className="absolute left-6 -bottom-2 w-0 h-0
              border-l-[8px] border-r-[8px] border-t-[10px]
              border-l-transparent border-r-transparent border-t-white/95" />
          </div>

          {tama.isSulking ? (
            <div className="flex-1 flex items-center justify-end w-full pr-2">
              {useRealImg ? (
                <img src="/pokemon/chikuwa.jpg" alt={dogName} onError={() => setImgError(true)}
                     style={{ width: stage.sizePx * 0.7, height: stage.sizePx * 0.7, objectFit: "cover",
                              borderRadius: "50%", opacity: 0.6, filter: "grayscale(60%)",
                              border: "3px solid rgba(255,255,255,0.7)" }} />
              ) : (
                <div style={{ fontSize: stage.sizePx * 0.7, lineHeight: 1 }}>{stage.emoji}</div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 mt-1">
              {/* Fixed-height animation text — prevents layout shift */}
              <div className="h-7 flex items-center justify-center">
                {tamaAnim && (
                  <div className={`text-base font-black drop-shadow animate-bounce whitespace-nowrap ${theme.light ? "text-white" : "text-gray-800"}`}>
                    {tamaAnim === "feed"  && "🍖 もぐもぐ"}
                    {tamaAnim === "water" && "💧 ごくごく"}
                    {tamaAnim === "pet"   && "❤️ きもちいい"}
                    {tamaAnim === "clean" && "✨ きれい！"}
                  </div>
                )}
              </div>

              {/* Dog character */}
              <button onClick={handleTap} className="select-none focus:outline-none cursor-pointer">
                <span
                  className={petAnim === "happy" ? "animate-pet-happy inline-block"
                           : petAnim === "shake" ? "animate-pet-shake inline-block"
                           : "inline-block animate-float"}
                  onAnimationEnd={() => { if (petAnim) setPetAnim(null); }}
                >
                  {useRealImg ? (
                    <img src="/pokemon/chikuwa.jpg" alt={dogName} onError={() => setImgError(true)}
                         style={{ width: stage.sizePx, height: stage.sizePx, objectFit: "cover",
                                  borderRadius: "50%", display: "block",
                                  border: "3px solid rgba(255,255,255,0.9)",
                                  boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }} />
                  ) : (
                    <span style={{ fontSize: stage.sizePx, lineHeight: 1 }}>{stage.emoji}</span>
                  )}
                </span>
              </button>

              {tama.poopCount > 0 && (
                <div className="text-xl tracking-widest">{"💩".repeat(Math.min(tama.poopCount, 5))}</div>
              )}
              <p className={`text-[10px] mt-0.5 ${tc}`}>
                {canPet ? "タップでなでる 🤍" : "少し待ってね... 🤍"}
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-sm font-black text-gray-900 -mt-1">{stage.name}</p>

      {/* Status bars */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <p className="text-xs font-black text-gray-700">📊 ステータス</p>
        {meters.map(({ label, val, bar, bg, text }) => (
          <div key={label}>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span className="font-medium">{label}</span>
              <span className="text-gray-500">{text}</span>
            </div>
            <div className={`w-full ${bg} rounded-full h-2.5 overflow-hidden`}>
              <div className={`h-2.5 rounded-full bg-gradient-to-r ${bar} transition-all duration-500`}
                   style={{ width: `${val}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Inventory quick-use strip */}
      {heldItems.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2">🎒 もちものを使う</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {heldItems.map(([id, count]) => {
              const item = ITEMS[id];
              if (!item) return null;
              return (
                <button key={id} onClick={() => onUseItem(id)} disabled={actionLocked}
                  className={`flex-shrink-0 bg-white border border-gray-100 rounded-2xl px-3 py-2 flex flex-col items-center gap-0.5 shadow-sm min-w-[64px] transition-all ${
                    actionLocked ? "opacity-50" : "active:scale-95"
                  }`}>
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">{item.name}</span>
                  <span className="text-[10px] text-gray-400">×{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: "🍖", label: "ご飯",   onClick: onFeed,  disabled: false },
          { icon: "💧", label: "お水",   onClick: onWater, disabled: false },
          { icon: "✋", label: canPet ? "なでる" : "待って", onClick: onPet, disabled: !canPet || tama.isSulking },
          { icon: "🧹", label: "そうじ", onClick: onClean, disabled: tama.poopCount === 0 },
        ].map(({ icon, label, onClick, disabled }) => {
          const isDisabled = disabled || actionLocked;
          return (
            <button key={label} onClick={onClick} disabled={isDisabled}
              className={`rounded-2xl py-3.5 flex flex-col items-center gap-1 font-bold text-xs transition-all shadow-sm ${
                isDisabled
                  ? "bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed"
                  : "bg-white text-gray-700 active:scale-95 border border-gray-100"
              }`}>
              <span className="text-2xl">{icon}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* Branch hint for pup stage */}
      {STAGES[stageId]?.level === "pup" && (
        <div className="grid grid-cols-5 gap-1.5 text-[9px] text-center font-bold">
          {[
            { icon: "🏃", name: "アクティブ", color: "bg-orange-50 text-orange-600 border-orange-200" },
            { icon: "💝", name: "スウィート",  color: "bg-pink-50 text-pink-600 border-pink-200" },
            { icon: "✨", name: "VIP",         color: "bg-purple-50 text-purple-600 border-purple-200" },
            { icon: "🌿", name: "ワイルド",    color: "bg-green-50 text-green-600 border-green-200" },
            { icon: "⭐", name: "バランス",    color: "bg-sky-50 text-sky-600 border-sky-200" },
          ].map(b => (
            <div key={b.name} className={`${b.color} border rounded-xl py-1.5 leading-tight`}>
              {b.icon}<br/>{b.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
