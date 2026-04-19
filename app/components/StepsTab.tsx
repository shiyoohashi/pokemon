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
      <h2 className="text-lg font-black text-gray-900 pt-2">🦶 歩数</h2>

      {/* Today card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-sm font-bold text-gray-700">今日の歩数</span>
          <span className="text-xs text-gray-400">目標 {DAILY_GOAL.toLocaleString()}歩</span>
        </div>
        <div className="text-4xl font-black text-gray-900 tabular-nums mb-3">
          {todaySteps.toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-1">歩</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${dailyPct}%`,
              background: "linear-gradient(90deg, #833AB4, #E1306C, #F77737)",
            }}
          />
        </div>
        {todaySteps >= DAILY_GOAL && (
          <p className="text-center text-sm font-bold mt-2" style={{ color: "#E1306C" }}>
            🎉 今日の目標達成！
          </p>
        )}
      </div>

      {/* Total */}
      <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">累計歩数</span>
        <span className="text-xl font-black text-gray-900 tabular-nums">
          {totalSteps.toLocaleString()}<span className="text-xs font-normal text-gray-400 ml-1">歩</span>
        </span>
      </div>

      {/* Tracking */}
      <button onClick={onToggleTracking}
        className="w-full py-4 rounded-2xl font-black text-white text-base shadow-sm"
        style={{
          background: isTracking
            ? "#ef4444"
            : "linear-gradient(135deg, #833AB4, #E1306C, #F77737)",
        }}>
        {isTracking ? "⏹ 計測停止" : "▶ 歩数計測スタート"}
      </button>
      <p className="text-center text-xs text-gray-400 -mt-2">
        ※ ブラウザが前面にある間のみ計測されます
      </p>

      {/* Manual */}
      <div>
        <p className="text-xs font-bold text-gray-600 mb-2">手動で歩数を追加</p>
        <div className="grid grid-cols-3 gap-2">
          {[100, 500, 1000].map(n => (
            <button key={n} onClick={() => onAddSteps(n)}
              className="py-3 bg-white border border-gray-100 active:bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 shadow-sm">
              +{n.toLocaleString()}歩
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-900 mb-2">🔔 プッシュ通知</p>
        {notifPermission === "unsupported" && (
          <p className="text-xs text-gray-400">このブラウザは通知に対応していません</p>
        )}
        {notifPermission === "granted" && (
          <p className="text-xs font-bold" style={{ color: "#059669" }}>✅ 通知が有効です</p>
        )}
        {notifPermission === "denied" && (
          <p className="text-xs text-red-500">通知がブロックされています。ブラウザ設定から許可してください。</p>
        )}
        {notifPermission === "default" && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">うんちやお腹すいた通知を受け取れます</p>
            <button onClick={onRequestNotif}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #833AB4, #E1306C)" }}>
              通知を許可する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
