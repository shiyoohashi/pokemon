export type Answer = {
  text: string;
  score: number;
};

export type Question = {
  id: number;
  text: string;
  emoji: string;
  answers: Answer[];
};

export const questions: Question[] = [
  {
    id: 1,
    text: "休日はどう過ごすのが好き？",
    emoji: "🌟",
    answers: [
      { text: "家でのんびりゴロゴロ", score: 10 },
      { text: "外でアクティブに動く", score: 8 },
      { text: "友達とわいわい過ごす", score: 6 },
      { text: "一人でゆっくり過ごす", score: 7 },
    ],
  },
  {
    id: 2,
    text: "嬉しいことがあったときどうなる？",
    emoji: "🎉",
    answers: [
      { text: "飛び跳ねて喜ぶ！", score: 10 },
      { text: "笑顔が止まらない", score: 8 },
      { text: "誰かに話したくなる", score: 7 },
      { text: "静かにニヤニヤする", score: 6 },
    ],
  },
  {
    id: 3,
    text: "お腹が空いたときは？",
    emoji: "🍖",
    answers: [
      { text: "すぐに食べたい！待てない！", score: 10 },
      { text: "少し我慢できる", score: 7 },
      { text: "おやつで誤魔化せる", score: 8 },
      { text: "忘れてしまうこともある", score: 5 },
    ],
  },
  {
    id: 4,
    text: "初めて会う人に対して？",
    emoji: "👋",
    answers: [
      { text: "すぐに仲良くなれる！", score: 10 },
      { text: "少し様子を見てから", score: 7 },
      { text: "緊張するけど頑張る", score: 6 },
      { text: "なかなか心を開けない", score: 5 },
    ],
  },
  {
    id: 5,
    text: "好きな遊びといえば？",
    emoji: "🎾",
    answers: [
      { text: "追いかけっこや体を使う遊び", score: 10 },
      { text: "頭を使うゲームやパズル", score: 7 },
      { text: "のんびり散歩・お出かけ", score: 9 },
      { text: "ぬいぐるみや柔らかいもので遊ぶ", score: 8 },
    ],
  },
  {
    id: 6,
    text: "疲れたときはどうする？",
    emoji: "😴",
    answers: [
      { text: "誰かに甘えたくなる", score: 10 },
      { text: "とにかく寝る！", score: 9 },
      { text: "美味しいものを食べる", score: 8 },
      { text: "一人でぼーっとする", score: 6 },
    ],
  },
  {
    id: 7,
    text: "大切な人への愛情表現は？",
    emoji: "❤️",
    answers: [
      { text: "べったりくっついて離れない", score: 10 },
      { text: "そばにいるだけで安心", score: 9 },
      { text: "プレゼントや行動で伝える", score: 7 },
      { text: "言葉で素直に伝える", score: 8 },
    ],
  },
  {
    id: 8,
    text: "外に出るのは好き？",
    emoji: "🌿",
    answers: [
      { text: "毎日出たい！外が大好き！", score: 10 },
      { text: "天気が良ければ出たい", score: 8 },
      { text: "たまには出るけど家が落ち着く", score: 6 },
      { text: "できるだけ家にいたい", score: 4 },
    ],
  },
];

export type ResultLevel = {
  min: number;
  title: string;
  emoji: string;
  description: string;
  color: string;
};

export const resultLevels: ResultLevel[] = [
  {
    min: 90,
    title: "運命の相棒！",
    emoji: "💖",
    description: "あなたと愛犬はまさに運命共同体！同じリズムで生き、同じ喜びを分かち合える最高のパートナーです。愛犬もあなたのことが大好きに違いありません！",
    color: "from-pink-400 to-rose-500",
  },
  {
    min: 70,
    title: "最高のバディ！",
    emoji: "🐾",
    description: "あなたと愛犬の相性はバツグン！一緒にいると自然に笑顔になれる、かけがえないパートナーです。これからもたくさんの思い出を作っていきましょう！",
    color: "from-amber-400 to-orange-500",
  },
  {
    min: 50,
    title: "仲良し友達！",
    emoji: "🌸",
    description: "あなたと愛犬はいい友達！お互いの個性を尊重しながら、居心地のよい関係を築いています。さらに一緒に過ごす時間を増やすともっと仲良くなれるかも！",
    color: "from-green-400 to-teal-500",
  },
  {
    min: 0,
    title: "これから仲良し！",
    emoji: "🌱",
    description: "まだ出会ったばかり？これから一緒に過ごすことで、きっと素敵な絆が生まれます。愛情を持って接することで、どんどん相性が上がっていきますよ！",
    color: "from-blue-400 to-indigo-500",
  },
];
