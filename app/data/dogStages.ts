export type DogStage = {
  minSteps: number;
  name: string;
  emoji: string;
  sizePx: number;
  bgFrom: string;
  bgTo: string;
  message: string;
};

export const DOG_STAGES: DogStage[] = [
  {
    minSteps: 0,
    name: "赤ちゃんポメプー",
    emoji: "🐾",
    sizePx: 80,
    bgFrom: "#fef9c3",
    bgTo: "#fde68a",
    message: "生まれたばかり！一緒に散歩に行こう 🌱",
  },
  {
    minSteps: 1000,
    name: "子犬ポメプー",
    emoji: "🐶",
    sizePx: 100,
    bgFrom: "#fef3c7",
    bgTo: "#fcd34d",
    message: "元気いっぱい！毎日歩いてね 🐾",
  },
  {
    minSteps: 10000,
    name: "やんちゃポメプー",
    emoji: "🐕",
    sizePx: 120,
    bgFrom: "#fed7aa",
    bgTo: "#fb923c",
    message: "どんどん大きくなってるよ！もっと歩こう 🌟",
  },
  {
    minSteps: 30000,
    name: "成長中の犬",
    emoji: "🐩",
    sizePx: 144,
    bgFrom: "#fde68a",
    bgTo: "#f59e0b",
    message: "すごい！半分以上来たよ！続けて 💪",
  },
  {
    minSteps: 80000,
    name: "もうすぐゴールデン！",
    emoji: "🐕‍🦺",
    sizePx: 168,
    bgFrom: "#fcd34d",
    bgTo: "#d97706",
    message: "ゴールデンレトリバーまであと少し！頑張れ！🔥",
  },
  {
    minSteps: 200000,
    name: "ゴールデンレトリバー！",
    emoji: "🦮",
    sizePx: 200,
    bgFrom: "#f59e0b",
    bgTo: "#b45309",
    message: "立派なゴールデンレトリバーになったよ！おめでとう！🎉",
  },
];

export const DAILY_GOAL = 8000;

export type WeatherInfo = {
  emoji: string;
  label: string;
  walkAdvice: string;
};

export const WEATHER_MAP: Record<number, WeatherInfo> = {
  0:  { emoji: "☀️",  label: "快晴",       walkAdvice: "お散歩日和！" },
  1:  { emoji: "🌤️", label: "晴れ",       walkAdvice: "お散歩日和！" },
  2:  { emoji: "⛅",  label: "曇り時々晴れ", walkAdvice: "散歩に行けそう" },
  3:  { emoji: "☁️",  label: "曇り",       walkAdvice: "散歩に行けそう" },
  45: { emoji: "🌫️", label: "霧",         walkAdvice: "気をつけて散歩しよう" },
  48: { emoji: "🌫️", label: "霧氷",       walkAdvice: "気をつけて散歩しよう" },
  51: { emoji: "🌦️", label: "霧雨",       walkAdvice: "レインコートで散歩しよう" },
  53: { emoji: "🌦️", label: "小雨",       walkAdvice: "レインコートで散歩しよう" },
  55: { emoji: "🌧️", label: "雨",         walkAdvice: "今日はお家で遊ぼう" },
  61: { emoji: "🌧️", label: "小雨",       walkAdvice: "レインコートで散歩しよう" },
  63: { emoji: "🌧️", label: "雨",         walkAdvice: "今日はお家で遊ぼう" },
  65: { emoji: "🌧️", label: "大雨",       walkAdvice: "今日はお家で遊ぼう" },
  71: { emoji: "🌨️", label: "小雪",       walkAdvice: "雪の中も楽しいかも？" },
  73: { emoji: "🌨️", label: "雪",         walkAdvice: "暖かくして散歩しよう" },
  75: { emoji: "❄️",  label: "大雪",       walkAdvice: "今日はお家で遊ぼう" },
  80: { emoji: "🌧️", label: "にわか雨",   walkAdvice: "様子を見て散歩しよう" },
  81: { emoji: "🌧️", label: "雨",         walkAdvice: "今日はお家で遊ぼう" },
  82: { emoji: "⛈️",  label: "強い雨",    walkAdvice: "今日はお家で遊ぼう" },
  95: { emoji: "⛈️",  label: "雷雨",      walkAdvice: "今日はお家で遊ぼう" },
};
