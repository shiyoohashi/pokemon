export type EvolutionPath = "egg" | "baby" | "active" | "sweet" | "wild";

export type Stage = {
  id: string;
  path: EvolutionPath;
  name: string;
  emoji: string;
  sizePx: number;
  bgFrom: string;
  bgTo: string;
  message: (name: string) => string;
};

export const STAGES: Record<string, Stage> = {
  egg: {
    id: "egg", path: "egg",
    name: "たまご",
    emoji: "🥚", sizePx: 120,
    bgFrom: "#fef9c3", bgTo: "#fef08a",
    message: () => "なにかが孵化しそう...名前をつけてあげよう！",
  },
  baby: {
    id: "baby", path: "baby",
    name: "赤ちゃんポメプー",
    emoji: "🐾", sizePx: 90,
    bgFrom: "#fef3c7", bgTo: "#fde68a",
    message: (name) => `${name}、生まれたよ！よろしくね🌱`,
  },
  // ── アクティブ（よく歩く）→ ゴールデンレトリバー ──────────────
  active_1: {
    id: "active_1", path: "active",
    name: "元気な子犬",
    emoji: "🐕", sizePx: 110,
    bgFrom: "#fed7aa", bgTo: "#fb923c",
    message: (name) => `${name}は走るのが大好き！もっと歩こう🏃`,
  },
  active_2: {
    id: "active_2", path: "active",
    name: "アクティブ犬",
    emoji: "🐕‍🦺", sizePx: 145,
    bgFrom: "#fcd34d", bgTo: "#f59e0b",
    message: (name) => `${name}はどんどん逞しくなってる！💪`,
  },
  active_3: {
    id: "active_3", path: "active",
    name: "ゴールデンレトリバー！",
    emoji: "🦮", sizePx: 185,
    bgFrom: "#f59e0b", bgTo: "#b45309",
    message: (name) => `${name}は立派なゴールデンレトリバーに！たくさん歩いたね🎉`,
  },
  // ── スウィート（よくなでる）→ ロイヤルプードル ───────────────
  sweet_1: {
    id: "sweet_1", path: "sweet",
    name: "甘えん坊子犬",
    emoji: "🐶", sizePx: 110,
    bgFrom: "#fce7f3", bgTo: "#fbcfe8",
    message: (name) => `${name}はなでなでが大好き！もっとかまって💝`,
  },
  sweet_2: {
    id: "sweet_2", path: "sweet",
    name: "ふわふわ犬",
    emoji: "🐩", sizePx: 145,
    bgFrom: "#f9a8d4", bgTo: "#ec4899",
    message: (name) => `${name}はふわふわでとってもかわいい！✨`,
  },
  sweet_3: {
    id: "sweet_3", path: "sweet",
    name: "ロイヤルプードル！",
    emoji: "🐩", sizePx: 185,
    bgFrom: "#ec4899", bgTo: "#be185d",
    message: (name) => `${name}は最高のロイヤルプードルに！愛情たっぷりで育ったね👑`,
  },
  // ── ワイルド（放任）→ ウルフドッグ ─────────────────────────
  wild_1: {
    id: "wild_1", path: "wild",
    name: "ワイルド子犬",
    emoji: "🐕", sizePx: 110,
    bgFrom: "#d1fae5", bgTo: "#6ee7b7",
    message: (name) => `${name}はマイペースにのびのびしてる🌿`,
  },
  wild_2: {
    id: "wild_2", path: "wild",
    name: "自由な犬",
    emoji: "🦊", sizePx: 145,
    bgFrom: "#6ee7b7", bgTo: "#059669",
    message: (name) => `${name}は誰にも縛られないワイルドな犬に！🌲`,
  },
  wild_3: {
    id: "wild_3", path: "wild",
    name: "ウルフドッグ！",
    emoji: "🐺", sizePx: 185,
    bgFrom: "#059669", bgTo: "#065f46",
    message: (name) => `${name}は伝説のウルフドッグ！自由に生き抜いたね🐺`,
  },
};

// 進化に必要な累計歩数
export const EVOLUTION_AT: Record<string, number> = {
  baby:     300,
  active_1: 5_000,
  sweet_1:  5_000,
  wild_1:   5_000,
  active_2: 50_000,
  sweet_2:  50_000,
  wild_2:   50_000,
};

// 各ステージの開始歩数（成長バー計算用）
export const STAGE_START_STEPS: Record<string, number> = {
  egg: 0, baby: 0,
  active_1: 300,  sweet_1: 300,  wild_1: 300,
  active_2: 5_000, sweet_2: 5_000, wild_2: 5_000,
  active_3: 50_000, sweet_3: 50_000, wild_3: 50_000,
};

// 直線進化（分岐なし）
export const NEXT_STAGE: Record<string, string> = {
  active_1: "active_2", active_2: "active_3",
  sweet_1:  "sweet_2",  sweet_2:  "sweet_3",
  wild_1:   "wild_2",   wild_2:   "wild_3",
};

export type CareProfile = {
  feedCount: number;
  petCount: number;
  cleanCount: number;
  neglectEvents: number;
};

export function determineBranch(
  care: CareProfile,
  totalSteps: number
): "active" | "sweet" | "wild" {
  const stepScore    = totalSteps / 30;
  const careScore    = care.feedCount * 5 + care.petCount * 3 + care.cleanCount * 4;
  const neglectScore = care.neglectEvents * 8;
  const max = Math.max(stepScore, careScore, neglectScore);
  if (neglectScore > 0 && max === neglectScore) return "wild";
  if (careScore   > 0 && max === careScore)    return "sweet";
  return "active";
}

export const DAILY_GOAL = 8_000;

export type WeatherInfo = {
  emoji: string;
  label: string;
  walkAdvice: string;
};

export const WEATHER_MAP: Record<number, WeatherInfo> = {
  0:  { emoji: "☀️",  label: "快晴",        walkAdvice: "お散歩日和！" },
  1:  { emoji: "🌤️", label: "晴れ",        walkAdvice: "お散歩日和！" },
  2:  { emoji: "⛅",  label: "曇り時々晴れ", walkAdvice: "散歩に行けそう" },
  3:  { emoji: "☁️",  label: "曇り",        walkAdvice: "散歩に行けそう" },
  45: { emoji: "🌫️", label: "霧",          walkAdvice: "気をつけて散歩しよう" },
  48: { emoji: "🌫️", label: "霧氷",        walkAdvice: "気をつけて散歩しよう" },
  51: { emoji: "🌦️", label: "霧雨",        walkAdvice: "レインコートで散歩しよう" },
  53: { emoji: "🌦️", label: "小雨",        walkAdvice: "レインコートで散歩しよう" },
  55: { emoji: "🌧️", label: "雨",          walkAdvice: "今日はお家で遊ぼう" },
  61: { emoji: "🌧️", label: "小雨",        walkAdvice: "レインコートで散歩しよう" },
  63: { emoji: "🌧️", label: "雨",          walkAdvice: "今日はお家で遊ぼう" },
  65: { emoji: "🌧️", label: "大雨",        walkAdvice: "今日はお家で遊ぼう" },
  71: { emoji: "🌨️", label: "小雪",        walkAdvice: "雪の中も楽しいかも？" },
  73: { emoji: "🌨️", label: "雪",          walkAdvice: "暖かくして散歩しよう" },
  75: { emoji: "❄️",  label: "大雪",        walkAdvice: "今日はお家で遊ぼう" },
  80: { emoji: "🌧️", label: "にわか雨",    walkAdvice: "様子を見て散歩しよう" },
  81: { emoji: "🌧️", label: "雨",          walkAdvice: "今日はお家で遊ぼう" },
  82: { emoji: "⛈️",  label: "強い雨",     walkAdvice: "今日はお家で遊ぼう" },
  95: { emoji: "⛈️",  label: "雷雨",       walkAdvice: "今日はお家で遊ぼう" },
};
