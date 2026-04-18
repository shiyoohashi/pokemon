"use client";

import { DAILY_GOAL } from "../data/dogStages";

type Props = {
  totalSteps: number;
  todaySteps: number;
  isTracking: boolean;
  notifPermission: NotificationPermission | "unsupported";
  onAddSteps: (n: number) => void;
  onToggleTracking: () => void;
  onRequestNotif: () => void;
};

export default function StepsTab({
  totalSteps, todaySteps, isTracking,
  notifPermission,
  onAddSteps, onToggleTracking, onRequestNotif,
}: Props) {
  const dailyPct = Math.min((todaySteps / DAILY_GOAL) * 100, 100);

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Today steps */}
      <div className="bg-white/70 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-sm font-bold text-amber-900">今日の歩数</span>
          <span className="text-xs text-amber-600">目標 {DAILY_GOAL.toLocaleString()}歩</span>
        </div>
        <div className="text-4xl font-black text-amber-800 tabular-nums mb-3">
          {todaySteps.toLocaleString()}<span className="text-base font-normal ml-1">歩</span>
        </div>
        <div className="w-full bg-amber-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${dailyPct}%` }}
          />
        </div>
        {todaySteps >= DAILY_GOAL && (
          <p className="text-center text-sm font-bold text-emerald-600 mt-2">🎉 今日の目標達成！</p>
        )}
      </div>

      {/* Total steps */}
      <div className="bg-white/60 rounded-2xl px-5 py-3 flex items-center justify-between">
        <span className="text-sm text-amber-800 font-medium">累計歩数</span>
        <span className="text-xl font-black text-amber-700 tabular-nums">
          {totalSteps.toLocaleString()}<span className="text-xs font-normal ml-1">歩</span>
        </span>
      </div>

      {/* Tracking button */}
      <button
        onClick={onToggleTracking}
        className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-md ${
          isTracking ? "bg-red-400 active:bg-red-500" : "bg-amber-500 active:bg-amber-600"
        }`}
      >
        {isTracking ? "⏹ 計測停止" : "▶ 歩数計測スタート"}
      </button>
      <p className="text-center text-xs text-amber-500 -mt-2">
        ※ ブラウザが前面にある間のみ計測されます
      </p>

      {/* Manual step buttons */}
      <div>
        <p className="text-xs font-bold text-amber-800 mb-2">手動で歩数を追加</p>
        <div className="grid grid-cols-3 gap-2">
          {[100, 500, 1000].map(n => (
            <button
              key={n}
              onClick={() => onAddSteps(n)}
              className="py-3 bg-white/70 active:bg-white/90 rounded-2xl text-sm font-bold text-amber-800 shadow-sm"
            >
              +{n.toLocaleString()}歩
            </button>
          ))}
        </div>
      </div>

      {/* Notification section */}
      <div className="bg-white/60 rounded-2xl p-4">
        <p className="text-sm font-bold text-amber-900 mb-2">🔔 プッシュ通知</p>
        {notifPermission === "unsupported" ? (
          <p className="text-xs text-gray-400">このブラウザは通知に対応していません</p>
        ) : notifPermission === "granted" ? (
          <p className="text-xs text-emerald-600 font-bold">✅ 通知が有効です</p>
        ) : notifPermission === "denied" ? (
          <p className="text-xs text-red-500">通知がブロックされています。ブラウザの設定から許可してください。</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-amber-600">うんちやお腹すいた通知を受け取れます</p>
            <button
              onClick={onRequestNotif}
              className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold active:bg-amber-600"
            >
              通知を許可する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
