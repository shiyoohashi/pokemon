"use client";

import { useState, useCallback } from "react";
import { STAGES, EVO_AT_DAY, WEATHER_MAP, type Stage } from "../data/dogStages";

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
  onFeed: () => void; onWater: () => void;
  onPet: () => void; onClean: () => void;
  onTapDog: () => void; onFetchWeather: () => void;
};

function sceneBg(code: number | null, scene?: string) {
  if (scene === "indoor_rain") return "from-slate-400 to-slate-600";
  if (scene === "indoor_snow") return "from-blue-200 to-indigo-300";
  if (code !== null && code !== undefined && code >= 3) return "from-slate-300 to-teal-400";
  return "from-sky-400 via-blue-400 to-indigo-400";
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
  onFeed, onWater, onPet, onClean, onTapDog, onFetchWeather,
}: Props) {
  const [petAnim, setPetAnim]   = useState<"happy" | "shake" | null>(null);
  const [speechKey, setSpeechKey] = useState(0);

  const stage: Stage = STAGES[stageId] ?? STAGES["egg"];
  const dayAlive = Math.floor((Date.now() - tama.birthDate) / 86_400_000) + 1;
  const evoAtDay = EVO_AT_DAY[stageId];
  const canPet   = Date.now() - tama.lastPettedAt >= 60_000;

  const wInfo    = weather ? (WEATHER_MAP[weather.code] ?? null) : null;
  const bgGrad   = sceneBg(weather?.code ?? null, wInfo?.scene);
  const dateLabel = new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });

  const handleTap = useCallback(() => {
    const canAct = canPet && !tama.isSulking && !actionLocked;
    setPetAnim(canAct ? "happy" : "shake");
    setSpeechKey(k => k + 1);
    onTapDog();
  }, [canPet, tama.isSulking, actionLocked, onTapDog]);

  // Positive bar values: right = MAX = GOOD
  const satiety   = 100 - tama.hunger;     // high = well-fed
  const hydrated  = 100 - tama.hydration;  // high = well-hydrated

  const meters = [
    {
      label: "🍖 満腹度",
      val: satiety,
      bar: "from-orange-400 to-amber-400",
      bg: "bg-orange-50",
      text: satiety > 80 ? "おなかいっぱい😊" : satiety > 40 ? "ちょっとすいてきた" : "ペコペコ😢",
    },
    {
      label: "💧 水分量",
      val: hydrated,
      bar: "from-sky-400 to-blue-500",
      bg: "bg-sky-50",
      text: hydrated > 80 ? "うるおってる💧" : hydrated > 40 ? "ちょっと乾燥" : "カラカラ😢",
    },
    {
      label: "💗 ごきげん",
      val: tama.happiness,
      bar: "from-pink-400 to-rose-500",
      bg: "bg-pink-50",
      text: tama.happiness > 70 ? "ルンルン🎵" : tama.happiness > 40 ? "まあまあ" : "しょんぼり😞",
    },
    {
      label: "✨ VIP度",
      val: tama.vip,
      bar: "from-purple-400 to-violet-600",
      bg: "bg-purple-50",
      text: tama.vip >= 80 ? "超VIP👑" : tama.vip >= 40 ? "VIPメンバー" : "一般犬🐾",
    },
  ];

  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-lg font-black text-gray-900">🐾 {dogName}の育成日記</h1>
          <p className="text-xs text-gray-500">{dateLabel}　Day {dayAlive} / 30</p>
          {evoAtDay !== undefined && (
            <p className="text-[10px] text-gray-400">
              次の進化まで あと {Math.max(0, evoAtDay - dayAlive)} 日
            </p>
          )}
        </div>
        {/* Weather widget */}
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

      {wInfo && <p className="text-center text-xs font-semibold text-gray-500">{wInfo.walkAdvice}</p>}

      {/* Scene + character */}
      <div className={`w-full rounded-3xl bg-gradient-to-b ${bgGrad} px-4 pt-4 pb-5 relative overflow-hidden min-h-[210px] flex flex-col items-center`}>
        {wInfo?.scene === "outdoor" && (
          <div className="absolute top-3 right-3 text-2xl opacity-70">
            {(weather?.code ?? 0) <= 1 ? "☀️" : "⛅"}
          </div>
        )}
        {wInfo?.scene === "indoor_rain" && <div className="absolute top-2 right-2 text-xl opacity-60">🌧️ 🏠</div>}
        {wInfo?.scene === "indoor_snow" && (
          <>
            <div className="absolute top-2 right-2 text-xl opacity-60">❄️ 🏠</div>
            <div className="absolute bottom-2 right-3 text-3xl opacity-80">🍲</div>
          </>
        )}

        {/* Speech bubble */}
        <div key={speechKey} className="animate-speech mb-2 max-w-[85%] relative">
          <div className="bg-white/95 rounded-2xl px-4 py-2 shadow-sm">
            <p className="text-sm font-bold text-gray-800 whitespace-nowrap">{speechMsg(tama, dogName)}</p>
          </div>
          <div className="absolute left-6 -bottom-2 w-0 h-0
            border-l-[8px] border-r-[8px] border-t-[10px]
            border-l-transparent border-r-transparent border-t-white/95" />
        </div>

        {/* Character */}
        {tama.isSulking ? (
          <div className="flex-1 flex items-end justify-end w-full pr-2">
            <div style={{ fontSize: stage.sizePx * 0.7, lineHeight: 1 }}>{stage.emoji}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 mt-1">
            {tamaAnim && (
              <div className="text-lg font-black text-white drop-shadow animate-bounce whitespace-nowrap">
                {tamaAnim === "feed"  && "🍖 もぐもぐ"}
                {tamaAnim === "water" && "💧 ごくごく"}
                {tamaAnim === "pet"   && "❤️ きもちいい"}
                {tamaAnim === "clean" && "✨ きれい！"}
              </div>
            )}
            <button onClick={handleTap}
              className="select-none focus:outline-none cursor-pointer"
              style={{ fontSize: stage.sizePx, lineHeight: 1 }}>
              <span
                className={petAnim === "happy" ? "animate-pet-happy inline-block"
                         : petAnim === "shake" ? "animate-pet-shake inline-block"
                         : "inline-block animate-float"}
                onAnimationEnd={() => { if (petAnim) setPetAnim(null); }}
              >{stage.emoji}</span>
            </button>
            {tama.poopCount > 0 && (
              <div className="text-xl tracking-widest">{"💩".repeat(Math.min(tama.poopCount, 5))}</div>
            )}
            <p className="text-[10px] text-white/70 mt-0.5">タップでなでる 🤍</p>
          </div>
        )}
      </div>

      <p className="text-center text-sm font-black text-gray-900 -mt-1">{stage.name}</p>

      {/* Status bars — positive direction (right = MAX) */}
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

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: "🍖", label: "ご飯",   onClick: onFeed,  disabled: false },
          { icon: "💧", label: "お水",   onClick: onWater, disabled: false },
          { icon: "✋", label: canPet ? "なでる" : "待って",
            onClick: onPet, disabled: !canPet || tama.isSulking },
          { icon: "🧹", label: "そうじ", onClick: onClean, disabled: tama.poopCount === 0 },
        ].map(({ icon, label, onClick, disabled }) => {
          const isDisabled = disabled || actionLocked;
          return (
            <button key={label} onClick={onClick} disabled={isDisabled}
              className={`rounded-2xl py-3.5 flex flex-col items-center gap-1 font-bold text-xs transition-all shadow-sm ${
                isDisabled
                  ? "bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed"
                  : "bg-white text-gray-700 active:scale-95 border border-gray-100"
              }`}
            >
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
