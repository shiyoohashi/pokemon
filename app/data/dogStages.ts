export type BranchId = "active" | "sweet" | "vip" | "wild" | "balance";
export type StageLevel = "egg" | "pup" | "young" | "adult";

export type Stage = {
  id: string;
  branch: BranchId | "egg";
  level: StageLevel;
  name: string;
  emoji: string;
  sizePx: number;
  bgFrom: string;
  bgTo: string;
  job?: string;
  message: (name: string) => string;
};

// ─────────────────────────────────────────────────────────
// 36 stages: 1 egg + 5 pup + 10 young + 20 adult
// ─────────────────────────────────────────────────────────
export const STAGES: Record<string, Stage> = {

  // ── EGG ──────────────────────────────────────────────────
  egg: {
    id: "egg", branch: "egg", level: "egg",
    name: "たまご", emoji: "🥚", sizePx: 100,
    bgFrom: "#fef9c3", bgTo: "#fde68a",
    message: () => "なにかが孵化しそう...名前をつけてあげよう！",
  },

  // ── PUP × 5 ──────────────────────────────────────────────
  active_pup: {
    id: "active_pup", branch: "active", level: "pup",
    name: "元気な幼犬ちくわ", emoji: "🐕", sizePx: 80,
    bgFrom: "#fed7aa", bgTo: "#fb923c",
    message: (n) => `${n}は元気いっぱいだワン！`,
  },
  sweet_pup: {
    id: "sweet_pup", branch: "sweet", level: "pup",
    name: "あまえんぼうな幼犬ちくわ", emoji: "🐶", sizePx: 80,
    bgFrom: "#fce7f3", bgTo: "#fbcfe8",
    message: (n) => `${n}はなでてほしいワン💝`,
  },
  vip_pup: {
    id: "vip_pup", branch: "vip", level: "pup",
    name: "おしゃれな幼犬ちくわ", emoji: "🌸", sizePx: 80,
    bgFrom: "#f3e8ff", bgTo: "#e9d5ff",
    message: (n) => `${n}はおしゃれが大好きだワン✨`,
  },
  wild_pup: {
    id: "wild_pup", branch: "wild", level: "pup",
    name: "マイペースな幼犬ちくわ", emoji: "🐾", sizePx: 80,
    bgFrom: "#d1fae5", bgTo: "#6ee7b7",
    message: (n) => `${n}はマイペースだワン🌿`,
  },
  balance_pup: {
    id: "balance_pup", branch: "balance", level: "pup",
    name: "やさしい幼犬ちくわ", emoji: "⭐", sizePx: 80,
    bgFrom: "#e0f2fe", bgTo: "#bae6fd",
    message: (n) => `${n}はやさしい子だワン⭐`,
  },

  // ── YOUNG × 10 ────────────────────────────────────────────
  active_young_a: {
    id: "active_young_a", branch: "active", level: "young",
    name: "マラソン子犬ちくわ", emoji: "🐕‍🦺", sizePx: 120,
    bgFrom: "#fcd34d", bgTo: "#f97316",
    message: (n) => `${n}は走るのが好きだワン🏃`,
  },
  active_young_b: {
    id: "active_young_b", branch: "active", level: "young",
    name: "スポーツ子犬ちくわ", emoji: "🐕", sizePx: 120,
    bgFrom: "#fbbf24", bgTo: "#ea580c",
    message: (n) => `${n}はスポーツが得意だワン🏋️`,
  },
  sweet_young_a: {
    id: "sweet_young_a", branch: "sweet", level: "young",
    name: "ふわふわの子犬ちくわ", emoji: "🐩", sizePx: 120,
    bgFrom: "#f9a8d4", bgTo: "#f472b6",
    message: (n) => `${n}はふわふわでかわいいワン✨`,
  },
  sweet_young_b: {
    id: "sweet_young_b", branch: "sweet", level: "young",
    name: "ハグ好き子犬ちくわ", emoji: "🐶", sizePx: 120,
    bgFrom: "#fda4af", bgTo: "#fb7185",
    message: (n) => `${n}はハグが大好きだワン💕`,
  },
  vip_young_a: {
    id: "vip_young_a", branch: "vip", level: "young",
    name: "きらきらの子犬ちくわ", emoji: "✨", sizePx: 120,
    bgFrom: "#d8b4fe", bgTo: "#a855f7",
    message: (n) => `${n}はキラキラ輝いてるワン💫`,
  },
  vip_young_b: {
    id: "vip_young_b", branch: "vip", level: "young",
    name: "グラマラス子犬ちくわ", emoji: "💎", sizePx: 120,
    bgFrom: "#c084fc", bgTo: "#9333ea",
    message: (n) => `${n}はグラマラスだワン💎`,
  },
  wild_young_a: {
    id: "wild_young_a", branch: "wild", level: "young",
    name: "じゆうな子犬ちくわ", emoji: "🦊", sizePx: 120,
    bgFrom: "#6ee7b7", bgTo: "#10b981",
    message: (n) => `${n}は自由に生きてるワン🌲`,
  },
  wild_young_b: {
    id: "wild_young_b", branch: "wild", level: "young",
    name: "タフな子犬ちくわ", emoji: "🐺", sizePx: 120,
    bgFrom: "#34d399", bgTo: "#059669",
    message: (n) => `${n}はタフで強いワン💪`,
  },
  balance_young_a: {
    id: "balance_young_a", branch: "balance", level: "young",
    name: "おりこうな子犬ちくわ", emoji: "🎓", sizePx: 120,
    bgFrom: "#7dd3fc", bgTo: "#38bdf8",
    message: (n) => `${n}はとてもおりこうだワン🎓`,
  },
  balance_young_b: {
    id: "balance_young_b", branch: "balance", level: "young",
    name: "おだやかな子犬ちくわ", emoji: "🌿", sizePx: 120,
    bgFrom: "#bae6fd", bgTo: "#0ea5e9",
    message: (n) => `${n}はおだやかで癒しだワン🌿`,
  },

  // ── ADULT × 20 ────────────────────────────────────────────
  // active × 4
  active_adult_aa: {
    id: "active_adult_aa", branch: "active", level: "adult",
    name: "アスリートちくわ", emoji: "🏆", sizePx: 170,
    bgFrom: "#f59e0b", bgTo: "#b45309", job: "警察犬",
    message: (n) => `${n}は最強のアスリートになったワン！🏆`,
  },
  active_adult_ab: {
    id: "active_adult_ab", branch: "active", level: "adult",
    name: "ランナーちくわ", emoji: "🦮", sizePx: 170,
    bgFrom: "#fb923c", bgTo: "#c2410c", job: "救助犬",
    message: (n) => `${n}は颯爽と走るランナーだワン🦮`,
  },
  active_adult_ba: {
    id: "active_adult_ba", branch: "active", level: "adult",
    name: "フィットネスちくわ", emoji: "🐕‍🦺", sizePx: 170,
    bgFrom: "#f97316", bgTo: "#9a3412", job: "消防犬",
    message: (n) => `${n}はフィットネス大好きだワン💪`,
  },
  active_adult_bb: {
    id: "active_adult_bb", branch: "active", level: "adult",
    name: "エクスプローラーちくわ", emoji: "🗺️", sizePx: 170,
    bgFrom: "#ea580c", bgTo: "#7c2d12", job: "山岳犬",
    message: (n) => `${n}は世界を探検するワン🗺️`,
  },
  // sweet × 4
  sweet_adult_aa: {
    id: "sweet_adult_aa", branch: "sweet", level: "adult",
    name: "セラピーちくわ", emoji: "💝", sizePx: 170,
    bgFrom: "#ec4899", bgTo: "#be185d", job: "セラピー犬",
    message: (n) => `${n}は人を癒すセラピーちくわだワン💝`,
  },
  sweet_adult_ab: {
    id: "sweet_adult_ab", branch: "sweet", level: "adult",
    name: "ナデナデちくわ", emoji: "🐩", sizePx: 170,
    bgFrom: "#f43f5e", bgTo: "#be123c", job: "盲導犬",
    message: (n) => `${n}はなでなでが大好きだワン🤗`,
  },
  sweet_adult_ba: {
    id: "sweet_adult_ba", branch: "sweet", level: "adult",
    name: "ラブリーちくわ", emoji: "💗", sizePx: 170,
    bgFrom: "#fb7185", bgTo: "#e11d48", job: "介護犬",
    message: (n) => `${n}はラブリーで最高だワン💗`,
  },
  sweet_adult_bb: {
    id: "sweet_adult_bb", branch: "sweet", level: "adult",
    name: "ファミリーちくわ", emoji: "🏠", sizePx: 170,
    bgFrom: "#fda4af", bgTo: "#fb7185", job: "家族犬",
    message: (n) => `${n}は家族みんなに愛されるワン🏠`,
  },
  // vip × 4
  vip_adult_aa: {
    id: "vip_adult_aa", branch: "vip", level: "adult",
    name: "スーパーアイドルちくわ", emoji: "🌟", sizePx: 170,
    bgFrom: "#9333ea", bgTo: "#6b21a8", job: "アイドル犬",
    message: (n) => `${n}はトップアイドルになったワン👑`,
  },
  vip_adult_ab: {
    id: "vip_adult_ab", branch: "vip", level: "adult",
    name: "セレブちくわ", emoji: "💎", sizePx: 170,
    bgFrom: "#7c3aed", bgTo: "#5b21b6", job: "モデル犬",
    message: (n) => `${n}はセレブで輝いてるワン💎`,
  },
  vip_adult_ba: {
    id: "vip_adult_ba", branch: "vip", level: "adult",
    name: "キラキラちくわ", emoji: "🔮", sizePx: 170,
    bgFrom: "#a855f7", bgTo: "#7e22ce", job: "芸能犬",
    message: (n) => `${n}はキラキラの芸能犬だワン🔮`,
  },
  vip_adult_bb: {
    id: "vip_adult_bb", branch: "vip", level: "adult",
    name: "エレガントちくわ", emoji: "🎀", sizePx: 170,
    bgFrom: "#c084fc", bgTo: "#9333ea", job: "ファッション犬",
    message: (n) => `${n}はエレガントなファッション犬だワン🎀`,
  },
  // wild × 4
  wild_adult_aa: {
    id: "wild_adult_aa", branch: "wild", level: "adult",
    name: "ウルフちくわ", emoji: "🐺", sizePx: 170,
    bgFrom: "#059669", bgTo: "#065f46", job: "山岳救助犬",
    message: (n) => `${n}は伝説のウルフちくわだワン🐺`,
  },
  wild_adult_ab: {
    id: "wild_adult_ab", branch: "wild", level: "adult",
    name: "ハンターちくわ", emoji: "🏹", sizePx: 170,
    bgFrom: "#047857", bgTo: "#064e3b", job: "猟犬",
    message: (n) => `${n}は最強のハンターだワン🏹`,
  },
  wild_adult_ba: {
    id: "wild_adult_ba", branch: "wild", level: "adult",
    name: "ワイルドちくわ", emoji: "🌿", sizePx: 170,
    bgFrom: "#10b981", bgTo: "#065f46", job: "牧場犬",
    message: (n) => `${n}はワイルドに生きるワン🌿`,
  },
  wild_adult_bb: {
    id: "wild_adult_bb", branch: "wild", level: "adult",
    name: "サバイバーちくわ", emoji: "🏕️", sizePx: 170,
    bgFrom: "#34d399", bgTo: "#047857", job: "野外犬",
    message: (n) => `${n}はサバイバーちくわだワン🏕️`,
  },
  // balance × 4
  balance_adult_aa: {
    id: "balance_adult_aa", branch: "balance", level: "adult",
    name: "パーフェクトちくわ", emoji: "👑", sizePx: 170,
    bgFrom: "#0ea5e9", bgTo: "#0369a1", job: "万能犬",
    message: (n) => `${n}はパーフェクトなちくわだワン👑`,
  },
  balance_adult_ab: {
    id: "balance_adult_ab", branch: "balance", level: "adult",
    name: "スーパーちくわ", emoji: "🌈", sizePx: 170,
    bgFrom: "#0284c7", bgTo: "#075985", job: "外交官犬",
    message: (n) => `${n}はスーパーな外交官だワン🌈`,
  },
  balance_adult_ba: {
    id: "balance_adult_ba", branch: "balance", level: "adult",
    name: "ジェントルちくわ", emoji: "🌸", sizePx: 170,
    bgFrom: "#38bdf8", bgTo: "#0284c7", job: "看板犬",
    message: (n) => `${n}はジェントルで優しいワン🌸`,
  },
  balance_adult_bb: {
    id: "balance_adult_bb", branch: "balance", level: "adult",
    name: "ナチュラルちくわ", emoji: "🍃", sizePx: 170,
    bgFrom: "#7dd3fc", bgTo: "#0369a1", job: "研究犬",
    message: (n) => `${n}はナチュラルな研究犬だワン🍃`,
  },
};

// ── Evolution day thresholds ────────────────────────────────
export const EVO_AT_DAY: Record<string, number> = {
  egg: 3,
  active_pup: 7,  sweet_pup: 7,  vip_pup: 7,  wild_pup: 7,  balance_pup: 7,
  active_young_a: 14, active_young_b: 14,
  sweet_young_a:  14, sweet_young_b:  14,
  vip_young_a:    14, vip_young_b:    14,
  wild_young_a:   14, wild_young_b:   14,
  balance_young_a:14, balance_young_b:14,
  // adult stages graduate at day 30 (handled separately)
};

// ── Branch metadata ──────────────────────────────────────────
export const BRANCHES: BranchId[] = ["active", "sweet", "vip", "wild", "balance"];

export const BRANCH_INFO: Record<BranchId, { label: string; desc: string; gradient: string }> = {
  active:  { label: "アクティブ", desc: "よく歩くと進む道",          gradient: "from-orange-400 to-amber-500" },
  sweet:   { label: "スウィート", desc: "よくなでると進む道",        gradient: "from-pink-400 to-rose-500" },
  vip:     { label: "VIP",       desc: "高級アイテムを使うと進む道", gradient: "from-purple-500 to-violet-600" },
  wild:    { label: "ワイルド",   desc: "マイペースに育つと進む道",  gradient: "from-green-400 to-emerald-600" },
  balance: { label: "バランス",   desc: "バランスよく育てると進む道",gradient: "from-sky-400 to-blue-500" },
};

export type CareProfile = {
  feedCount: number;
  waterCount: number;
  petCount: number;
  cleanCount: number;
  neglectEvents: number;
  vipItemsUsed: number;
};

// ── Branch determination functions ──────────────────────────

export function determineBranch(care: CareProfile, totalSteps: number, vip: number): BranchId {
  const stepScore    = totalSteps / 10;
  const careScore    = care.feedCount * 3 + care.waterCount * 3 + care.petCount * 2;
  const vipScore     = vip * 2 + care.vipItemsUsed * 10;
  const neglectScore = care.neglectEvents * 10;

  if (vipScore >= 30 && vipScore >= stepScore && vipScore >= careScore && vipScore >= neglectScore) return "vip";

  const max = Math.max(stepScore, careScore, neglectScore);
  if (max < 5) return "balance";

  const topCount = [stepScore, careScore, neglectScore].filter(s => s >= max * 0.65).length;
  if (topCount >= 2) return "balance";

  if (max === neglectScore && neglectScore > 0) return "wild";
  if (max === careScore    && careScore > 0)    return "sweet";
  if (max === stepScore    && stepScore > 0)    return "active";
  return "balance";
}

function determineYoungVariant(branch: BranchId, care: CareProfile, totalSteps: number, vip: number): "a" | "b" {
  switch (branch) {
    case "active":  return totalSteps > 1000                                ? "a" : "b";
    case "sweet":   return care.petCount > 10                               ? "a" : "b";
    case "vip":     return vip > 20 || care.vipItemsUsed > 2               ? "a" : "b";
    case "wild":    return care.neglectEvents > 1                           ? "a" : "b";
    case "balance": return (care.feedCount + care.waterCount) > 15          ? "a" : "b";
  }
}

function determineAdultVariant(branch: BranchId, care: CareProfile, totalSteps: number, vip: number): "a" | "b" {
  switch (branch) {
    case "active":  return totalSteps > 5000                                          ? "a" : "b";
    case "sweet":   return care.petCount > 30                                         ? "a" : "b";
    case "vip":     return vip > 50                                                   ? "a" : "b";
    case "wild":    return care.neglectEvents > 3                                     ? "a" : "b";
    case "balance": return (care.feedCount + care.waterCount + care.petCount) > 50   ? "a" : "b";
  }
}

export function getEvolutionTarget(
  stageId: string,
  care: CareProfile,
  totalSteps: number,
  vip: number
): string | null {
  if (stageId === "egg") {
    return `${determineBranch(care, totalSteps, vip)}_pup`;
  }
  if (stageId.endsWith("_pup")) {
    const branch = stageId.replace("_pup", "") as BranchId;
    const v = determineYoungVariant(branch, care, totalSteps, vip);
    return `${branch}_young_${v}`;
  }
  if (stageId.includes("_young_")) {
    const parts = stageId.split("_"); // ["active","young","a"]
    const branch   = parts[0] as BranchId;
    const prevV    = parts[2] as "a" | "b";
    const newV     = determineAdultVariant(branch, care, totalSteps, vip);
    return `${branch}_adult_${prevV}${newV}`;
  }
  return null; // adult stages handled separately (day-30 graduation)
}

// Migrate old stage IDs to new format
export function migrateStageId(id: string): string {
  const map: Record<string, string> = {
    baby: "egg",
    active_1: "active_pup",  active_2: "active_young_a",  active_3: "active_adult_aa",
    sweet_1:  "sweet_pup",   sweet_2:  "sweet_young_a",   sweet_3:  "sweet_adult_aa",
    idol_1:   "vip_pup",     idol_2:   "vip_young_a",     idol_3:   "vip_adult_aa",
    wild_1:   "wild_pup",    wild_2:   "wild_young_a",    wild_3:   "wild_adult_aa",
    balance_1:"balance_pup", balance_2:"balance_young_a", balance_3:"balance_adult_aa",
  };
  const migrated = map[id] ?? id;
  return STAGES[migrated] ? migrated : "egg";
}

export const DAILY_GOAL = 8_000;

export type WeatherInfo = {
  emoji: string; label: string; walkAdvice: string;
  scene: "outdoor" | "indoor_rain" | "indoor_snow";
};

export const WEATHER_MAP: Record<number, WeatherInfo> = {
  0:  { emoji: "☀️",  label: "快晴",          walkAdvice: "お散歩日和！",             scene: "outdoor" },
  1:  { emoji: "🌤️", label: "晴れ",          walkAdvice: "お散歩日和！",             scene: "outdoor" },
  2:  { emoji: "⛅",  label: "曇り時々晴れ",  walkAdvice: "散歩に行けそう",           scene: "outdoor" },
  3:  { emoji: "☁️",  label: "曇り",          walkAdvice: "散歩に行けそう",           scene: "outdoor" },
  45: { emoji: "🌫️", label: "霧",            walkAdvice: "気をつけて散歩しよう",     scene: "outdoor" },
  48: { emoji: "🌫️", label: "霧氷",          walkAdvice: "気をつけて散歩しよう",     scene: "outdoor" },
  51: { emoji: "🌦️", label: "霧雨",          walkAdvice: "レインコートで散歩しよう", scene: "indoor_rain" },
  53: { emoji: "🌦️", label: "小雨",          walkAdvice: "レインコートで散歩しよう", scene: "indoor_rain" },
  55: { emoji: "🌧️", label: "雨",            walkAdvice: "今日はお家で遊ぼう",       scene: "indoor_rain" },
  61: { emoji: "🌧️", label: "小雨",          walkAdvice: "レインコートで散歩しよう", scene: "indoor_rain" },
  63: { emoji: "🌧️", label: "雨",            walkAdvice: "今日はお家で遊ぼう",       scene: "indoor_rain" },
  65: { emoji: "🌧️", label: "大雨",          walkAdvice: "今日はお家で遊ぼう",       scene: "indoor_rain" },
  71: { emoji: "🌨️", label: "小雪",          walkAdvice: "雪の中も楽しいかも？",     scene: "indoor_snow" },
  73: { emoji: "🌨️", label: "雪",            walkAdvice: "暖かくして散歩しよう",     scene: "indoor_snow" },
  75: { emoji: "❄️",  label: "大雪",          walkAdvice: "今日はお家でぬくぬく",     scene: "indoor_snow" },
  80: { emoji: "🌧️", label: "にわか雨",      walkAdvice: "様子を見て散歩しよう",     scene: "indoor_rain" },
  81: { emoji: "🌧️", label: "雨",            walkAdvice: "今日はお家で遊ぼう",       scene: "indoor_rain" },
  82: { emoji: "⛈️",  label: "強い雨",       walkAdvice: "今日はお家で遊ぼう",       scene: "indoor_rain" },
  95: { emoji: "⛈️",  label: "雷雨",         walkAdvice: "今日はお家で遊ぼう",       scene: "indoor_rain" },
};
