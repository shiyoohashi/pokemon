"use client";

import { STAGES, EVOLUTION_AT, STAGE_START_STEPS, DAILY_GOAL, WEATHER_MAP, type Stage } from "../data/dogStages";

type TamaState = {
  hunger: number; hydration: number; happiness: number; vip: number;
  isSulking: boolean; poopCount: number;
  lastPettedAt: number; birthDate: number;
};

type Props = {
  dogName: string;
  stageId: string;
  tama: TamaState;
  totalSteps: number;
  todaySteps: number;
  isTracking: boolean;
  weather: { temp: number; code: number } | null;
  weatherState: "idle" | "loading" | "denied";
  tamaAnim: "feed" | "water" | "pet" | "clean" | null;
  onFeed: () => void;
  onWater: () => void;
  onPet: () => void;
  onClean: () => void;
  onAddSteps: (n: number) => void;
  onToggleTracking: () => void;
  onFetchWeather: () => void;
};

function sceneBg(code: number | null, scene: string | undefined) {
  if (!scene) return "from-sky-300 to-green-300";
  if (scene === "indoor_rain") return "from-slate-400 to-slate-500";
  if (scene === "indoor_snow") return "from-blue-100 to-slate-200";
  // outdoor — vary slightly by weather
  if (code !== null && code >= 3) return "from-slate-300 to-green-300";
  return "from-sky-400 to-green-400";
}

export default function MainTab({
  dogName, stageId, tama, totalSteps, todaySteps, isTracking,
  weather, weatherState, tamaAnim,
  onFeed, onWater, onPet, onClean, onAddSteps, onToggleTracking, onFetchWeather,
}: Props) {
  const stage: Stage = STAGES[stageId] ?? STAGES["egg"];
  const evoAt    = EVOLUTION_AT[stageId];
  const stStart  = STAGE_START_STEPS[stageId] ?? 0;
  const growthPct = evoAt !== undefined
    ? Math.min(((totalSteps - stStart) / (evoAt - stStart)) * 100, 100)
    : 100;
  const dailyPct = Math.min((todaySteps / DAILY_GOAL) * 100, 100);
  const canPet   = Date.now() - tama.lastPettedAt >= 60_000;

  const wInfo = weather ? (WEATHER_MAP[weather.code] ?? null) : null;
  const bgGradient = sceneBg(weather?.code ?? null, wInfo?.scene);
  const dateLabel  = new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });
  const dayAlive   = Math.floor((Date.now() - tama.birthDate) / 86_400_000) + 1;

  function statusMsg(): string {
    if (tama.isSulking)       return `${dogName}いじけてるよ...ケアしてあげて😢`;
    if (tama.hunger > 80)     return `${dogName}おなかペコペコ...ご飯ちょうだい🍖`;
    if (tama.hydration > 80)  return `${dogName}のどかわいた...お水ちょうだい💧`;
    if (tama.poopCount >= 3)  return "くさい！うんちがいっぱい...😷";
    if (tama.poopCount > 0)   return "うんちしたよ！きれいにしてね💩";
    if (tama.happiness < 30)  return `${dogName}さみしいよ...なでてほしいな😞`;
    return stage.message(dogName);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-lg font-black text-amber-900">🐾 {dogName}の成長日記</h1>
          <p className="text-xs text-amber-700">{dateLabel}　Day {dayAlive} / 30</p>
        </div>
        <div className="bg-white/60 rounded-2xl px-3 py-2 min-w-[68px] text-center">
          {weatherState === "loading" && <p className="text-xs text-gray-400">取得中...</p>}
          {weatherState === "denied"  && <button onClick={onFetchWeather} className="text-xs text-amber-600">📍 位置情報</button>}
          {weatherState === "idle" && wInfo && weather ? (
            <>
              <div className="text-2xl leading-none">{wInfo.emoji}</div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">{weather.temp}°C</div>
              <div className="text-[10px] text-gray-500">{wInfo.label}</div>
            </>
          ) : weatherState === "idle" ? (
            <button onClick={onFetchWeather} className="text-xs text-amber-600">天気を取得</button>
          ) : null}
        </div>
      </div>

      {wInfo && <p className="text-center text-sm font-semibold text-amber-800">{wInfo.walkAdvice}</p>}

      {/* Dog scene */}
      <div className={`w-full rounded-3xl bg-gradient-to-b ${bgGradient} p-4 relative overflow-hidden min-h-[180px] flex flex-col items-center justify-center`}>
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

        {/* Sulking: dog in corner */}
        {tama.isSulking ? (
          <>
            <div className="absolute bottom-3 right-3" style={{ fontSize: 60, lineHeight: 1 }}>{stage.emoji}</div>
            <div className="text-center">
              <p className="text-base font-black text-gray-700">いじけ中...</p>
              <p className="text-xs text-gray-600">ご飯とお水でケアしてあげよう</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            {tamaAnim && (
              <div className="text-xl font-bold animate-bounce whitespace-nowrap">
                {tamaAnim === "feed"  && "🍖 もぐもぐ"}
                {tamaAnim === "water" && "💧 ごくごく"}
                {tamaAnim === "pet"   && "❤️"}
                {tamaAnim === "clean" && "✨ きれい！"}
              </div>
            )}
            <div className="transition-all duration-700 select-none" style={{ fontSize: stage.sizePx, lineHeight: 1 }}>
              {stage.emoji}
            </div>
            {tama.poopCount > 0 && (
              <div className="text-xl tracking-widest">{"💩".repeat(Math.min(tama.poopCount, 5))}</div>
            )}
          </div>
        )}
      </div>
      <div className="text-center -mt-1">
        <p className="text-base font-black text-amber-900">{stage.name}</p>
        <p className="text-xs text-amber-700 mt-0.5">{statusMsg()}</p>
      </div>

      {/* Status bars */}
      <div className="bg-white/60 rounded-2xl p-4 space-y-2.5">
        <p className="text-xs font-black text-amber-900 mb-1">📊 ステータス</p>

        {([
          { label: "🍖 おなか",   val: tama.hunger,     bar: "from-orange-300 to-red-400",    bg: "bg-orange-100",   text: tama.hunger > 80 ? "ペコペコ😢" : tama.hunger > 50 ? "すいてきた" : "満足😊",             invert: false },
          { label: "💧 水分",     val: tama.hydration,  bar: "from-blue-300 to-sky-400",      bg: "bg-blue-100",     text: tama.hydration > 80 ? "のどかわいた😢" : tama.hydration > 50 ? "ちょっと乾燥" : "潤ってる😊", invert: false },
          { label: "💗 ごきげん", val: tama.happiness,  bar: "from-pink-400 to-rose-500",     bg: "bg-pink-100",     text: tama.happiness > 70 ? "ルンルン🎵" : tama.happiness > 40 ? "まあまあ" : "しょんぼり😞",      invert: true },
          { label: "✨ VIP度",    val: tama.vip,        bar: "from-purple-400 to-violet-600", bg: "bg-purple-100",   text: tama.vip >= 80 ? "超VIP👑" : tama.vip >= 40 ? "VIPメンバー" : "一般犬🐾",                    invert: true },
        ]).map(({ label, val, bar, bg, text }) => (
          <div key={label}>
            <div className="flex justify-between text-xs text-amber-800 mb-0.5">
              <span>{label}</span><span>{text}</span>
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
          { icon: "✋", label: canPet ? "なでる" : "待って", onClick: onPet, disabled: !canPet || tama.isSulking },
          { icon: "🧹", label: "そうじ", onClick: onClean, disabled: tama.poopCount === 0 },
        ].map(({ icon, label, onClick, disabled }) => (
          <button key={label} onClick={onClick} disabled={disabled}
            className={`rounded-2xl py-3.5 flex flex-col items-center gap-1 font-bold text-xs shadow-sm transition-opacity ${
              disabled ? "bg-white/30 text-amber-400 opacity-60" : "bg-white/70 active:bg-white/90 text-amber-800"
            }`}
          >
            <span className="text-2xl">{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* Growth bar */}
      <div>
        <div className="flex justify-between text-xs text-amber-800 mb-1 font-medium">
          <span>🌱 成長度</span>
          <span>{evoAt !== undefined ? `あと ${Math.max(0, evoAt - totalSteps).toLocaleString()}歩` : "MAX！"}</span>
        </div>
        <div className="w-full bg-white/40 rounded-full h-3.5 overflow-hidden">
          <div className="h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
               style={{ width: `${growthPct}%` }} />
        </div>
        {stageId === "baby" && (
          <div className="grid grid-cols-4 gap-1 mt-2 text-[10px] text-center font-bold text-amber-800">
            <div className="bg-orange-100/80 rounded-xl py-1">🏃 歩く<br/><span className="font-normal text-[9px]">→ ゴールデン🦮</span></div>
            <div className="bg-pink-100/80   rounded-xl py-1">💝 なでる<br/><span className="font-normal text-[9px]">→ プードル🐩</span></div>
            <div className="bg-purple-100/80 rounded-xl py-1">✨ VIP<br/><span className="font-normal text-[9px]">→ アイドル🌟</span></div>
            <div className="bg-green-100/80  rounded-xl py-1">🌿 放任<br/><span className="font-normal text-[9px]">→ ウルフ🐺</span></div>
          </div>
        )}
      </div>

      {/* Today steps */}
      <div className="bg-white/60 rounded-2xl p-4">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-sm font-bold text-amber-900">今日の歩数</span>
          <span className="text-xs text-amber-600">目標 {DAILY_GOAL.toLocaleString()}歩</span>
        </div>
        <div className="text-3xl font-black text-amber-800 tabular-nums mb-2">
          {todaySteps.toLocaleString()}<span className="text-sm font-normal ml-1">歩</span>
        </div>
        <div className="w-full bg-amber-100 rounded-full h-2.5 overflow-hidden">
          <div className="h-2.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
               style={{ width: `${dailyPct}%` }} />
        </div>
        {todaySteps >= DAILY_GOAL && (
          <p className="text-center text-sm font-bold text-emerald-600 mt-1.5">🎉 今日の目標達成！</p>
        )}
      </div>

      <p className="text-center text-xs text-amber-700">
        累計 <span className="font-bold">{totalSteps.toLocaleString()}</span> 歩
      </p>

      {/* Step controls */}
      <div className="flex flex-col gap-2">
        <button onClick={onToggleTracking}
          className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-md ${isTracking ? "bg-red-400 active:bg-red-500" : "bg-amber-500 active:bg-amber-600"}`}>
          {isTracking ? "⏹ 計測停止" : "▶ 歩数計測スタート"}
        </button>
        <div className="flex gap-2">
          <button onClick={() => onAddSteps(100)}   className="flex-1 py-3 bg-white/60 active:bg-white/80 rounded-2xl text-sm font-bold text-amber-800">+100歩</button>
          <button onClick={() => onAddSteps(1000)}  className="flex-1 py-3 bg-white/60 active:bg-white/80 rounded-2xl text-sm font-bold text-amber-800">+1,000歩</button>
        </div>
      </div>
    </div>
  );
}
