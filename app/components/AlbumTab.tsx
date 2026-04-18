"use client";

export default function AlbumTab() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
      <div className="text-6xl">📸</div>
      <h2 className="text-xl font-black text-amber-900">殿堂入りアルバム</h2>
      <p className="text-sm text-amber-700">旅立ったちくわたちの記録がここに残るよ。</p>
      <div className="bg-white/60 rounded-2xl p-6 w-full max-w-sm">
        <p className="text-amber-500 text-sm">まだ旅立ちを経験していないよ。</p>
        <p className="text-amber-400 text-xs mt-1">30日間育てると職業が決まり、思い出がここに残るよ🐾</p>
      </div>
    </div>
  );
}
