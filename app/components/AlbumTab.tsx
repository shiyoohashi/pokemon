"use client";

export default function AlbumTab() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-5">
      <div className="text-6xl animate-float">📸</div>
      <h2 className="text-xl font-black text-gray-900">殿堂入りアルバム</h2>
      <p className="text-sm text-gray-500">旅立ったちくわたちの記録がここに残るよ。</p>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-sm border border-gray-100">
        <p className="text-gray-400 text-sm">まだ旅立ちを経験していないよ。</p>
        <p className="text-gray-300 text-xs mt-1">30日間育てると職業が決まり、<br/>思い出がここに残るよ🐾</p>
      </div>
    </div>
  );
}
