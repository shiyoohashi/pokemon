"use client";

import { STAGES, BRANCHES, BRANCH_LABELS, type BranchId } from "../data/dogStages";

const LEVELS = ["pup", "young", "adult"] as const;
const LEVEL_LABELS: Record<string, string> = {
  pup:   "幼犬（3〜7日）",
  young: "子犬（7〜14日）",
  adult: "成犬（14〜30日）",
};

type Props = {
  currentStageId: string;
};

export default function ZukanTab({ currentStageId }: Props) {
  const currentStage = STAGES[currentStageId];
  const currentBranch = currentStage?.branch;
  const currentLevel  = currentStage?.level;

  function isUnlocked(branch: BranchId, level: string): boolean {
    const levelOrder = ["pup", "young", "adult"];
    const currentLevelIdx = levelOrder.indexOf(currentLevel ?? "");
    const targetLevelIdx  = levelOrder.indexOf(level);

    if (currentBranch === "egg") return false;
    if (currentBranch !== branch) return false;
    return targetLevelIdx <= currentLevelIdx;
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-black text-amber-900">📖 進化図鑑</h2>
        <p className="text-xs text-amber-600 mt-0.5">どんなちくわになれるか見てみよう！</p>
      </div>

      {/* Egg */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-4xl">🥚</span>
        <div>
          <p className="font-black text-amber-900">たまご</p>
          <p className="text-xs text-amber-600">すべてのちくわはここから始まる</p>
          <p className="text-[10px] text-amber-500 mt-0.5">→ 3日後に幼犬に進化！</p>
        </div>
      </div>

      {/* 5 branches */}
      {BRANCHES.map(branch => {
        const info = BRANCH_LABELS[branch];
        const isCurrentBranch = currentBranch === branch;
        return (
          <div
            key={branch}
            className={`rounded-2xl border-2 overflow-hidden ${
              isCurrentBranch ? "border-amber-400 shadow-md" : "border-gray-200"
            }`}
          >
            {/* Branch header */}
            <div className={`px-4 py-2.5 flex items-center justify-between ${info.colorClass}`}>
              <div>
                <span className="font-black text-sm text-gray-800">{info.label}なちくわ道</span>
                <p className="text-[10px] text-gray-600">{info.desc}</p>
              </div>
              {isCurrentBranch && (
                <span className="text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full">
                  いまここ！
                </span>
              )}
            </div>

            {/* Stages */}
            <div className="bg-white/80 flex items-center px-3 py-3 gap-1">
              {LEVELS.map((level, i) => {
                const stageId = `${branch}_${level}`;
                const stage   = STAGES[stageId];
                if (!stage) return null;
                const unlocked = isUnlocked(branch, level);
                const isCurrent = currentStageId === stageId;
                return (
                  <div key={stageId} className="flex items-center gap-1 flex-1 min-w-0">
                    <div className={`flex-1 flex flex-col items-center gap-0.5 rounded-xl p-2 transition-all ${
                      isCurrent ? "bg-amber-100 ring-2 ring-amber-400" :
                      unlocked  ? "bg-gray-50" : "bg-gray-100 opacity-50"
                    }`}>
                      <span className="text-2xl leading-none">{unlocked ? stage.emoji : "❓"}</span>
                      <p className="text-[9px] font-bold text-center text-gray-700 leading-tight line-clamp-2">
                        {unlocked ? stage.name : "？？？"}
                      </p>
                      <p className="text-[8px] text-gray-400">{LEVEL_LABELS[level].split("（")[0]}</p>
                    </div>
                    {i < LEVELS.length - 1 && (
                      <span className="text-gray-300 text-xs flex-shrink-0">→</span>
                    )}
                  </div>
                );
              })}

              {/* Job */}
              <span className="text-gray-300 text-xs flex-shrink-0">→</span>
              <div className={`flex flex-col items-center gap-0.5 rounded-xl p-2 bg-gray-100 ${
                isUnlocked(branch, "adult") ? "opacity-100" : "opacity-40"
              }`}>
                <span className="text-lg leading-none">🏆</span>
                <p className="text-[9px] font-bold text-center text-gray-600">
                  {isUnlocked(branch, "adult")
                    ? (STAGES[`${branch}_adult`]?.job ?? "？")
                    : "？？？"}
                </p>
                <p className="text-[8px] text-gray-400">30日</p>
              </div>
            </div>
          </div>
        );
      })}

      <p className="text-center text-xs text-amber-400 pb-2">
        毎日ケアして最高のちくわに育てよう🐾
      </p>
    </div>
  );
}
