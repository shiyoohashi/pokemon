export type ItemEffect = {
  hunger?: number;
  hydration?: number;
  happiness?: number;
  vip?: number;
};

export type Item = {
  id: string;
  name: string;
  emoji: string;
  price: number;
  description: string;
  effect: ItemEffect;
  category: "food" | "drink" | "toy" | "accessory";
};

export const ITEMS: Record<string, Item> = {
  dogfood: {
    id: "dogfood", name: "ドッグフード", emoji: "🍖", price: 50,
    description: "おなかを満たす基本フード",
    effect: { hunger: -35 }, category: "food",
  },
  water: {
    id: "water", name: "お水", emoji: "💧", price: 30,
    description: "水分補給",
    effect: { hydration: -35 }, category: "drink",
  },
  bone: {
    id: "bone", name: "骨のおもちゃ", emoji: "🦴", price: 100,
    description: "ごきげんUP",
    effect: { happiness: 25 }, category: "toy",
  },
  frisbee: {
    id: "frisbee", name: "フリスビー", emoji: "🥏", price: 150,
    description: "ごきげん大幅UP",
    effect: { happiness: 40 }, category: "toy",
  },
  salmon: {
    id: "salmon", name: "高級サーモンフード", emoji: "🐟", price: 300,
    description: "おなか満足 + VIPアップ",
    effect: { hunger: -50, vip: 10 }, category: "food",
  },
  steak: {
    id: "steak", name: "特選ステーキ", emoji: "🥩", price: 500,
    description: "最高級フード + VIP大幅アップ",
    effect: { hunger: -60, vip: 20 }, category: "food",
  },
  sunglasses: {
    id: "sunglasses", name: "サングラス", emoji: "🕶️", price: 200,
    description: "クールなアクセサリー + VIPアップ",
    effect: { vip: 5 }, category: "accessory",
  },
  hat: {
    id: "hat", name: "おしゃれな帽子", emoji: "🎩", price: 250,
    description: "エレガントな帽子 + VIPアップ",
    effect: { vip: 8 }, category: "accessory",
  },
};

export const ITEM_CATEGORY_LABELS: Record<string, string> = {
  food: "🍖 フード",
  drink: "💧 ドリンク",
  toy: "🦴 おもちゃ",
  accessory: "✨ アクセサリー",
};
