"use client";

import { useState, useCallback } from "react";
import { STAGES, EVO_AT_DAY, WEATHER_MAP, type Stage } from "../data/dogStages";

type TamaState = {
  hunger: number; hydration: number; happiness: number; vip: number;
  isSulking: boolean; poopCount: number;
  lastPettedAt: number; birthDate: number;
};

type Props = {
  dogName: string;
  stageId: string;
  tama: TamaState;
  weather: { temp: number; code: number } | null;
  weatherState: "idle" | "loading" | "denied";
  tamaAnim: "feed" | "water" | "pet" | "clean" | null;
  onFeed: () => void;
  onWater: () => void;
  onPet: () => void;
  onClean: () => void;
  onTapDog: () => void;
  onFetchWeather: () => void;
};

function sceneBg(code: number | null, scene: string | undefined) {
  if (!scene) return "from-sky-300 to-green-300";
  if (scene === "indoor_rain") return "from-slate-400 to-slate-500";
  if (scene === "indoor_snow") return "from-blue-100 to-slate-200";
  if (code !== null && code >= 3) return "from-slate-300 to-green-300";
  return "from-sky-400 to-green-400";
}

function speechMsg(tama: TamaState, dogName: string): string {
  const h = new Date().getHours();
  if (tama.isSulking)          return "いじけてるワン…ケアして💢";
  if (tama.hunger > 85)        return "おなかペコペコだワン🍖";
  if (tama.hunger > 65)        return "ちょっとおなかすいたワン";
  if (tama.hydration > 85)     return "のどカラカラだワン💧";
  if (tama.hydration > 65)     return "お水飲みたいワン";
  if (tama.poopCount >= 3)     return "くさいワン！きれいにして😷";
  if (tama.poopCount > 0)      return "うんちしたワン💩";
  if (tama.happiness < 25)     return "さみしいワン…なでてほしい😢";
  if (tama.happiness < 50)     return "もうちょっとかまってワン";
  if (h >= 22 || h < 5)        return "ねむいワン…😴zzz";
  if (h >= 5  && h < 9)        return `おはようワン！☀️`;
  if (h >= 12 && h < 13)       return "お昼ねしたいワン🌙";
  if (tama.happiness > 85)     return "たのしいワン！✨";
  if (tama.vip >= 60)          return "VIPな気分だワン👑";
  return `${dogName}だワン🐾`;
}

export default function MainTab({
  dogName, stageId, tama,
  weather, weatherState, tamaAnim,
  onFeed, onWater, onPet, onClean, onTapDog, onFetchWeather,
}: Props) {
  const [petAnim, setPetAnim]   = useState<"happy" | "shake" | null>(null);
  const [speechKey, setSpeechKey] = useState(0);

  const stage: Stage = STAGES[stageId] ?? STAGES["egg"];
  const dayAlive  = Math.floor((Date.now() - tama.birthDate) / 86_400_000) + 1;
  const evoAtDay  = EVO_AT_DAY[stageId];
  const canPet    = Date.now() - tama.lastPettedAt >= 60_000;

  const wInfo     = weather ? (WEATHER_MAP[weather.code] ?? null) : null;
  const bgGrad    = sceneBg(weather?.code ?? null, wInfo?.scene);
  const dateLabel = new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });

  const handleTap = useCallback(() => {
    const canAct = canPet && !tama.isSulking;
    setPetAnim(canAct ? "happy" : "shake");
    setSpeechKey(k => k + 1);
    onTapDog();
  }, [canPet, tama.isSulking, onTapDog]);

  return (
    <div className="flex flex-col gap-3 px-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-lg font-black text-amber-900">🐾 {dogName}の育成日記</h1>
          <p className="text-xs text-amber-700">{dateLabel}　Day {dayAlive} / 30</p>
          {evoAtDay !== undefined && (
            <p className="text-[10px] text-amber-500">
              次の進化まで あと {Math.max(0, evoAtDay - dayAlive)} 日
            </p>
          )}
        </div>
        {/* Weather widget */}
        <div className="bg-white/60 rounded-2xl px-3 py-2 min-w-[64px] text-center">
          {weatherState === "loading" && <p className="text-xs text-gray-400">取得中...</p>}
          {weatherState === "denied"  && (
            <button onClick={onFetchWeather} className="text-xs text-amber-600">📍 天気</button>
          )}
          {weatherState === "idle" && wInfo && weather ? (
            <>
              <div className="text-2xl leading-none">{wInfo.emoji}</div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">{weather.temp}°C</div>
            </>
          ) : weatherState === "idle" ? (
            <button onClick={onFetchWeather} className="text-xs text-amber-600">天気を取得</button>
          ) : null}
        </div>
      </div>

      {wInfo && <p className="text-center text-xs font-semibold text-amber-700">{wInfo.walkAdvice}</p>}

      {/* Dog scene + speech bubble */}
      <div className={`w-full rounded-3xl bg-gradient-to-b ${bgGrad} px-4 pt-3 pb-4 relative overflow-hidden min-h-[200px] flex flex-col items-center`}>
        {/* Scene decorations */}
        {wInfo?.scene === "outdoor" && (
          <div className="absolute top-2 right-3 text-2xl opacity-70">
            {(weather?.code ?? 0) <= 1 ? "☀️" : "⛅"}
          </div>
        )}
        {wInfo?.scene === "indoor_rain" && (
          <div className="absolute top-2 right-2 text-xl opacity-60">🌧️ 🏠</div>
        )}
        {wInfo?.scene === "indoor_snow" && (
          <>
            <div className="absolute top-2 right-2 text-xl opacity-60">❄️ 🏠</div>
            <div className="absolute bottom-2 right-3 text-3xl opacity-80">🍲</div>
          </>
        )}

        {/* Speech bubble */}
        <div key={speechKey} className="animate-speech relative mb-1 max-w-[80%]">
          <div className="bg-white/90 rounded-2xl px-4 py-2 shadow-sm">
            <p className="text-sm font-bold text-gray-700 whitespace-nowrap">{speechMsg(tama, dogName)}</p>
          </div>
          {/* bubble tail */}
          <div className="absolute left-8 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/90" />
        </div>

        {/* Sulking: dog in corner */}
        {tama.isSulking ? (
          <div className="flex-1 flex items-end justify-end w-full">
            <div style={{ fontSize: 64, lineHeight: 1 }}>{stage.emoji}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 mt-2">
            {tamaAnim && (
              <div className="text-xl font-bold animate-bounce whitespace-nowrap">
                {tamaAnim === "feed"  && "🍖 もぐもぐ"}
                {tamaAnim === "water" && "💧 ごくごく"}
                {tamaAnim === "pet"   && "❤️ きもちいい"}
                {tamaAnim === "clean" && "✨ きれい！"}
              </div>
            )}
            {/* Tappable character */}
            <button
              onClick={handleTap}
              className="select-none focus:outline-none active:scale-95 transition-transform"
              style={{ fontSize: stage.sizePx, lineHeight: 1 }}
            >
              <span
                className={
                  petAnim === "happy" ? "animate-pet-happy inline-block" :
                  petAnim === "shake" ? "animate-pet-shake inline-block" :
                  "inline-block"
                }
                onAnimationEnd={() => setPetAnim(null)}
              >
                {stage.emoji}
              </span>
            </button>
            {tama.poopCount > 0 && (
              <div className="text-xl tracking-widest">{"💩".repeat(Math.min(tama.poopCount, 5))}</div>
            )}
            <p className="text-[10px] text-white/80 mt-1">タップでなでる</p>
          </div>
        )}
      </div>

      <div className="text-center -mt-1">
        <p className="text-base font-black text-amber-900">{stage.name}</p>
      </div>

      {/* Status bars */}
      <div className="bg-white/60 rounded-2xl p-4 space-y-2.5">
        <p className="text-xs font-black text-amber-900 mb-1">📊 ステータス</p>
        {([
          { label: "🍖 おなか",   val: tama.hunger,    bar: "from-orange-300 to-red-400",    bg: "bg-orange-100",  text: tama.hunger > 80    ? "ペコペコ😢"     : tama.hunger > 50    ? "すいてきた" : "満足😊"      },
          { label: "💧 水分",     val: tama.hydration, bar: "from-blue-300 to-sky-400",      bg: "bg-blue-100",    text: tama.hydration > 80 ? "のどかわいた😢" : tama.hydration > 50 ? "ちょっと乾燥" : "潤ってる😊"  },
          { label: "💗 ごきげん", val: tama.happiness, bar: "from-pink-400 to-rose-500",     bg: "bg-pink-100",    text: tama.happiness > 70 ? "ルンルン🎵"    : tama.happiness > 40 ? "まあまあ"   : "しょんぼり😞" },
          { label: "✨ VIP度",    val: tama.vip,       bar: "from-purple-400 to-violet-600", bg: "bg-purple-100",  text: tama.vip >= 80      ? "超VIP👑"        : tama.vip >= 40      ? "VIPメンバー" : "一般犬🐾"     },
        ]).map(({ label, val, bar, bg, text }) => (
          <div key={label}>
            <div className="flex justify-between text-xs text-amber-800 mb-0.5">
              <span>{label}</span><span>{text}</span>
            </div>
            <div className={`w-full ${bg} rounded-full h-2.5 overflow-hidden`}>
              <div
                className={`h-2.5 rounded-full bg-gradient-to-r ${bar} transition-all duration-500`}
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: "🍖", label: "ご飯",   onClick: onFeed,  disabled: false },
          { icon: "💧", label: "お水",   onClick: onWater, disabled: false },
          { icon: "✋", label: canPet ? "なでる" : "待って", onClick: onPet, disabled: !canPet || tama.isSulking },
          { icon: "🧹", label: "そうじ", onClick: onClean, disabled: tama.poopCount === 0 },
        ].map(({ icon, label, onClick, disabled }) => (
          <button
            key={label}
            onClick={onClick}
            disabled={disabled}
            className={`rounded-2xl py-3.5 flex flex-col items-center gap-1 font-bold text-xs shadow-sm transition-opacity ${
              disabled ? "bg-white/30 text-amber-400 opacity-60" : "bg-white/70 active:bg-white/90 text-amber-800"
            }`}
          >
            <span className="text-2xl">{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* Branch hint during pup stage */}
      {(STAGES[stageId]?.level === "pup" || stageId === "baby") && (
        <div className="grid grid-cols-5 gap-1 text-[9px] text-center font-bold text-amber-800">
          <div className="bg-orange-100/80 rounded-xl py-1.5">🏃<br/>アクティブ</div>
          <div className="bg-pink-100/80   rounded-xl py-1.5">💝<br/>スウィート</div>
          <div className="bg-purple-100/80 rounded-xl py-1.5">✨<br/>VIP</div>
          <div className="bg-green-100/80  rounded-xl py-1.5">🌿<br/>ワイルド</div>
          <div className="bg-sky-100/80    rounded-xl py-1.5">⭐<br/>バランス</div>
        </div>
      )}
    </div>
  );
}
