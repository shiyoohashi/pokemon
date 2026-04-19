"use client";

import { useState } from "react";
import { STAGES, BRANCHES, BRANCH_INFO, type BranchId, type CollectionEntry } from "../data/dogStages";

type Props = { currentStageId: string; collection: CollectionEntry[] };

const YOUNG_IDS: Record<BranchId, [string, string]> = {
  active:  ["active_young_a",  "active_young_b"],
  sweet:   ["sweet_young_a",   "sweet_young_b"],
  vip:     ["vip_young_a",     "vip_young_b"],
  wild:    ["wild_young_a",    "wild_young_b"],
  balance: ["balance_young_a", "balance_young_b"],
};
const ADULT_IDS: Record<BranchId, [[string, string], [string, string]]> = {
  active:  [["active_adult_aa",  "active_adult_ab"],  ["active_adult_ba",  "active_adult_bb"]],
  sweet:   [["sweet_adult_aa",   "sweet_adult_ab"],   ["sweet_adult_ba",   "sweet_adult_bb"]],
  vip:     [["vip_adult_aa",     "vip_adult_ab"],     ["vip_adult_ba",     "vip_adult_bb"]],
  wild:    [["wild_adult_aa",    "wild_adult_ab"],     ["wild_adult_ba",    "wild_adult_bb"]],
  balance: [["balance_adult_aa", "balance_adult_ab"], ["balance_adult_ba", "balance_adult_bb"]],
};

function StageCard({ id, current, small }: { id: string; current: boolean; small?: boolean }) {
  const s = STAGES[id];
  if (!s) return null;
  return (
    <div className={`flex flex-col items-center gap-0.5 rounded-xl p-1.5 min-w-0 transition-all ${
      current ? "ring-2 bg-white" : "bg-gray-50"
    }`}
    style={current ? { outline: "2px solid #E1306C", outlineOffset: "1px" } : {}}>
      <span className={small ? "text-xl leading-none" : "text-2xl leading-none"}>{s.emoji}</span>
      <p className={`font-bold text-center text-gray-700 leading-tight ${small ? "text-[8px]" : "text-[9px]"}`}
         style={{ wordBreak: "keep-all" }}>
        {s.name.replace("ちくわ", "\nちくわ")}
      </p>
      {s.job && <p className="text-[7px] text-gray-400 bg-gray-100 rounded px-1">{s.job}</p>}
    </div>
  );
}

function ZukanView({ currentStageId }: { currentStageId: string }) {
  const [openBranch, setOpenBranch] = useState<BranchId | null>(null);
  const currentStage  = STAGES[currentStageId];
  const currentBranch = currentStage?.branch;

  return (
    <div className="flex flex-col gap-4">
      {/* Egg */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
        <span className="text-4xl">🥚</span>
        <div>
          <p className="font-black text-gray-900 text-sm">たまご（1種）</p>
          <p className="text-xs text-gray-500">すべてはここから始まる</p>
          <p className="text-[10px] text-gray-400 mt-0.5">→ Day 3 で幼犬（5種）に分岐</p>
        </div>
        {currentStageId === "egg" && (
          <div className="ml-auto text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
               style={{ background: "#E1306C" }}>いまここ</div>
        )}
      </div>

      {/* Branches */}
      {BRANCHES.map(branch => {
        const info     = BRANCH_INFO[branch];
        const pup      = STAGES[`${branch}_pup`];
        const isOpen   = openBranch === branch;
        const isCurrent = currentBranch === branch;

        return (
          <div key={branch} className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${
            isCurrent ? "border-[#E1306C]" : "border-gray-100"
          }`}>
            <button
              className="w-full flex items-center gap-3 px-4 py-3"
              onClick={() => setOpenBranch(isOpen ? null : branch)}
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${info.gradient} flex items-center justify-center text-white font-black text-xs`}>
                {pup?.emoji}
              </div>
              <div className="flex-1 text-left">
                <p className="font-black text-sm text-gray-900">{info.label}なちくわ道</p>
                <p className="text-[10px] text-gray-500">{info.desc}</p>
              </div>
              {isCurrent && (
                <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "#E1306C" }}>いまここ</span>
              )}
              <span className="text-gray-400 text-xs ml-1">{isOpen ? "▲" : "▼"}</span>
            </button>

            {!isOpen && (
              <div className="px-4 pb-3 flex items-center gap-2">
                <StageCard id={`${branch}_pup`} current={currentStageId === `${branch}_pup`} small />
                <span className="text-gray-200 text-xs">→</span>
                <p className="text-[10px] text-gray-400">子犬2種 → 成犬4種 → 職業</p>
              </div>
            )}

            {isOpen && (
              <div className="px-3 pb-4 flex flex-col gap-3">
                <div className="flex items-center gap-1">
                  <p className="text-[9px] font-bold text-gray-500 w-8 flex-shrink-0">幼犬</p>
                  <div className="flex-1">
                    <StageCard id={`${branch}_pup`} current={currentStageId === `${branch}_pup`} />
                  </div>
                  <span className="text-gray-300 text-xs">→</span>
                  <p className="text-[9px] text-gray-400 flex-shrink-0">2種に分岐</p>
                </div>

                {YOUNG_IDS[branch].map((youngId, yi) => {
                  const adults = ADULT_IDS[branch][yi];
                  return (
                    <div key={youngId} className="border-t border-gray-50 pt-2">
                      <div className="flex items-start gap-1">
                        <p className="text-[9px] font-bold text-gray-500 w-8 flex-shrink-0 mt-1">子犬{yi + 1}</p>
                        <div className="flex-shrink-0 w-20">
                          <StageCard id={youngId} current={currentStageId === youngId} small />
                        </div>
                        <span className="text-gray-300 text-xs mt-2">→</span>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex gap-1">
                            {adults.map(adultId => (
                              <div key={adultId} className="flex-1">
                                <StageCard id={adultId} current={currentStageId === adultId} small />
                              </div>
                            ))}
                          </div>
                          <p className="text-[8px] text-gray-400 text-center">
                            {adults.map(id => STAGES[id]?.job).filter(Boolean).join(" / ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <p className="text-center text-xs text-gray-400 pb-3">
        全20種の成犬 + 5職業を目指そう🐾
      </p>
    </div>
  );
}

function CollectionView({ collection }: { collection: CollectionEntry[] }) {
  if (collection.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
        <div className="text-5xl">📭</div>
        <p className="text-sm font-bold text-gray-600">まだ卒業したちくわがいないよ</p>
        <p className="text-xs text-gray-400">30日間育てると卒業してコレクションに残るよ🐾</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-3">
      <p className="text-xs text-gray-500">{collection.length}匹のちくわが旅立っていったよ🐾</p>
      {collection.map(entry => (
        <div key={entry.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{entry.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900">{entry.name}</p>
              <p className="text-xs text-gray-500">{entry.stageName}</p>
              {entry.job && (
                <p className="text-xs font-bold" style={{ color: "#833AB4" }}>💼 {entry.job}</p>
              )}
            </div>
            <p className="text-[10px] text-gray-400 text-right flex-shrink-0">
              {new Date(entry.graduatedAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
              <br/>卒業
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="bg-gray-50 rounded-xl py-1.5">
              <p className="text-gray-400">育成日数</p>
              <p className="font-black text-gray-700">{entry.totalDays}日</p>
            </div>
            <div className="bg-gray-50 rounded-xl py-1.5">
              <p className="text-gray-400">総歩数</p>
              <p className="font-black text-gray-700">{entry.totalSteps >= 1000 ? `${(entry.totalSteps / 1000).toFixed(1)}k` : entry.totalSteps}</p>
            </div>
            <div className="bg-gray-50 rounded-xl py-1.5">
              <p className="text-gray-400">ごはん</p>
              <p className="font-black text-gray-700">{entry.care.feedCount}回</p>
            </div>
            <div className="bg-gray-50 rounded-xl py-1.5">
              <p className="text-gray-400">なでた</p>
              <p className="font-black text-gray-700">{entry.care.petCount}回</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ZukanTab({ currentStageId, collection }: Props) {
  const [view, setView] = useState<"zukan" | "collection">("zukan");

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <div className="pt-2">
        <h2 className="text-lg font-black text-gray-900">
          {view === "zukan" ? "📖 進化図鑑" : "🏆 コレクション"}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {view === "zukan" ? "1 → 5 → 10 → 20 の進化ツリー" : "旅立ったちくわたちの記録"}
        </p>
      </div>

      {/* Sub-tab toggle */}
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
        {(["zukan", "collection"] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              view === v ? "bg-white shadow-sm" : "text-gray-400"
            }`}
            style={view === v ? { color: "#E1306C" } : {}}>
            {v === "zukan" ? "📖 進化図鑑" : `🏆 コレクション${collection.length > 0 ? ` (${collection.length})` : ""}`}
          </button>
        ))}
      </div>

      {view === "zukan"
        ? <ZukanView currentStageId={currentStageId} />
        : <CollectionView collection={collection} />
      }
    </div>
  );
}
