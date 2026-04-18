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

export const STAGES: Record<string, Stage> = {
  egg: {
    id: "egg", branch: "egg", level: "egg",
    name: "たまご", emoji: "🥚", sizePx: 110,
    bgFrom: "#fef9c3", bgTo: "#fef08a",
    message: () => "なにかが孵化しそう...名前をつけてあげよう！",
  },

  // ── アクティブ (元気) ───────────────────────────────────────────
  active_pup: {
    id: "active_pup", branch: "active", level: "pup",
    name: "元気な幼犬ちくわ", emoji: "🐕", sizePx: 90,
    bgFrom: "#fed7aa", bgTo: "#fb923c",
    message: (n) => `${n}は元気いっぱいだワン！`,
  },
  active_young: {
    id: "active_young", branch: "active", level: "young",
    name: "やんちゃな子犬ちくわ", emoji: "🐕‍🦺", sizePx: 130,
    bgFrom: "#fcd34d", bgTo: "#f59e0b",
    message: (n) => `${n}はやんちゃで止まらないワン🏃`,
  },
  active_adult: {
    id: "active_adult", branch: "active", level: "adult",
    name: "アクティブなちくわ", emoji: "🦮", sizePx: 180,
    bgFrom: "#f59e0b", bgTo: "#b45309",
    job: "警察犬",
    message: (n) => `${n}は立派なアクティブちくわになったワン！🎉`,
  },

  // ── スウィート (甘えん坊) ──────────────────────────────────────
  sweet_pup: {
    id: "sweet_pup", branch: "sweet", level: "pup",
    name: "あまえんぼうな幼犬ちくわ", emoji: "🐶", sizePx: 90,
    bgFrom: "#fce7f3", bgTo: "#fbcfe8",
    message: (n) => `${n}はなでてほしいワン💝`,
  },
  sweet_young: {
    id: "sweet_young", branch: "sweet", level: "young",
    name: "ふわふわの子犬ちくわ", emoji: "🐩", sizePx: 130,
    bgFrom: "#f9a8d4", bgTo: "#ec4899",
    message: (n) => `${n}はふわふわでかわいいワン✨`,
  },
  sweet_adult: {
    id: "sweet_adult", branch: "sweet", level: "adult",
    name: "スウィートなちくわ", emoji: "🐩", sizePx: 180,
    bgFrom: "#ec4899", bgTo: "#be185d",
    job: "セラピー犬",
    message: (n) => `${n}は最高のスウィートちくわだワン👑`,
  },

  // ── VIP (おしゃれ) ─────────────────────────────────────────────
  vip_pup: {
    id: "vip_pup", branch: "vip", level: "pup",
    name: "おしゃれな幼犬ちくわ", emoji: "🐶", sizePx: 90,
    bgFrom: "#e9d5ff", bgTo: "#c084fc",
    message: (n) => `${n}はおしゃれが大好きだワン✨`,
  },
  vip_young: {
    id: "vip_young", branch: "vip", level: "young",
    name: "きらきらの子犬ちくわ", emoji: "🌸", sizePx: 130,
    bgFrom: "#c084fc", bgTo: "#9333ea",
    message: (n) => `${n}はどんどん輝いてるワン💫`,
  },
  vip_adult: {
    id: "vip_adult", branch: "vip", level: "adult",
    name: "スーパーアイドルちくわ", emoji: "🌟", sizePx: 180,
    bgFrom: "#9333ea", bgTo: "#6b21a8",
    job: "アイドル犬",
    message: (n) => `${n}はトップアイドルになったワン👑`,
  },

  // ── ワイルド (マイペース) ──────────────────────────────────────
  wild_pup: {
    id: "wild_pup", branch: "wild", level: "pup",
    name: "マイペースな幼犬ちくわ", emoji: "🐾", sizePx: 90,
    bgFrom: "#d1fae5", bgTo: "#6ee7b7",
    message: (n) => `${n}はマイペースだワン🌿`,
  },
  wild_young: {
    id: "wild_young", branch: "wild", level: "young",
    name: "じゆうな子犬ちくわ", emoji: "🦊", sizePx: 130,
    bgFrom: "#6ee7b7", bgTo: "#059669",
    message: (n) => `${n}は自由に生きてるワン🌲`,
  },
  wild_adult: {
    id: "wild_adult", branch: "wild", level: "adult",
    name: "ウルフちくわ", emoji: "🐺", sizePx: 180,
    bgFrom: "#059669", bgTo: "#065f46",
    job: "山岳救助犬",
    message: (n) => `${n}は伝説のウルフちくわになったワン🐺`,
  },

  // ── バランス (万能) ────────────────────────────────────────────
  balance_pup: {
    id: "balance_pup", branch: "balance", level: "pup",
    name: "やさしい幼犬ちくわ", emoji: "🐾", sizePx: 90,
    bgFrom: "#e0f2fe", bgTo: "#7dd3fc",
    message: (n) => `${n}はやさしい子だワン⭐`,
  },
  balance_young: {
    id: "balance_young", branch: "balance", level: "young",
    name: "おりこうな子犬ちくわ", emoji: "⭐", sizePx: 130,
    bgFrom: "#7dd3fc", bgTo: "#0ea5e9",
    message: (n) => `${n}はおりこうで万能だワン🌟`,
  },
  balance_adult: {
    id: "balance_adult", branch: "balance", level: "adult",
    name: "パーフェクトなちくわ", emoji: "👑", sizePx: 180,
    bgFrom: "#0ea5e9", bgTo: "#0369a1",
    job: "万能犬",
    message: (n) => `${n}はパーフェクトなちくわになったワン👑`,
  },
};

// Days-alive at which to evolve out of each stage
export const EVO_AT_DAY: Record<string, number> = {
  egg:           3,
  active_pup:    7,  sweet_pup:    7,  vip_pup:    7,  wild_pup:    7,  balance_pup:    7,
  active_young: 14,  sweet_young: 14,  vip_young: 14,  wild_young: 14,  balance_young: 14,
  // adult stages "graduate" at day 30 (handled separately in ChikuwaApp)
};

export const NEXT_STAGE: Record<string, string> = {
  active_pup:   "active_young",   sweet_pup:   "sweet_young",   vip_pup:   "vip_young",
  wild_pup:     "wild_young",     balance_pup: "balance_young",
  active_young: "active_adult",   sweet_young: "sweet_adult",   vip_young: "vip_adult",
  wild_young:   "wild_adult",     balance_young: "balance_adult",
};

export const BRANCHES: BranchId[] = ["active", "sweet", "vip", "wild", "balance"];

export const BRANCH_LABELS: Record<BranchId, { label: string; desc: string; colorClass: string }> = {
  active:  { label: "アクティブ", desc: "よく歩くと進む道",          colorClass: "bg-orange-100 border-orange-300" },
  sweet:   { label: "スウィート", desc: "よくなでると進む道",        colorClass: "bg-pink-100 border-pink-300" },
  vip:     { label: "VIP",       desc: "高級アイテムを使うと進む道", colorClass: "bg-purple-100 border-purple-300" },
  wild:    { label: "ワイルド",   desc: "マイペースに育つと進む道",  colorClass: "bg-green-100 border-green-300" },
  balance: { label: "バランス",   desc: "バランスよく育てると進む道",colorClass: "bg-sky-100 border-sky-300" },
};

export type CareProfile = {
  feedCount: number;
  waterCount: number;
  petCount: number;
  cleanCount: number;
  neglectEvents: number;
  vipItemsUsed: number;
};

export function determineBranch(
  care: CareProfile,
  totalSteps: number,
  vip: number
): BranchId {
  const stepScore    = totalSteps / 10;
  const careScore    = care.feedCount * 3 + care.waterCount * 3 + care.petCount * 2;
  const vipScore     = vip * 2 + care.vipItemsUsed * 10;
  const neglectScore = care.neglectEvents * 10;

  // VIP requires a clear threshold AND dominance
  if (vipScore >= 30 && vipScore >= stepScore && vipScore >= careScore && vipScore >= neglectScore) return "vip";

  const max = Math.max(stepScore, careScore, neglectScore);
  if (max < 5) return "balance";

  // Two top scores within 65% of max → balanced
  const topCount = [stepScore, careScore, neglectScore].filter(s => s >= max * 0.65).length;
  if (topCount >= 2) return "balance";

  if (max === neglectScore && neglectScore > 0) return "wild";
  if (max === careScore    && careScore > 0)    return "sweet";
  if (max === stepScore    && stepScore > 0)    return "active";
  return "balance";
}

export const DAILY_GOAL = 8_000;

export type WeatherInfo = {
  emoji: string;
  label: string;
  walkAdvice: string;
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
