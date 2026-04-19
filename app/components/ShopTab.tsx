"use client";

import { ITEMS, ITEM_CATEGORY_LABELS } from "../data/items";

type Props = {
  coins: number;
  inventory: Record<string, number>;
  onBuy: (itemId: string) => void;
  onUseItem: (itemId: string) => void;
};

export default function ShopTab({ coins, inventory, onBuy, onUseItem }: Props) {
  const categories = ["food", "drink", "toy", "accessory"] as const;
  const itemsByCategory = Object.values(ITEMS).reduce<Record<string, typeof ITEMS[string][]>>(
    (acc, item) => { (acc[item.category] ??= []).push(item); return acc; },
    {}
  );

  return (
    <div className="px-4 py-4 flex flex-col gap-5">
      <h2 className="text-lg font-black text-gray-900 pt-2">🛍️ ショップ</h2>

      {/* Wallet */}
      <div className="rounded-2xl px-5 py-4 flex items-center justify-between"
           style={{ background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)" }}>
        <div>
          <p className="text-xs text-white/80 font-medium">ちくわ券</p>
          <p className="text-3xl font-black text-white tabular-nums mt-0.5">
            {coins.toLocaleString()}<span className="text-sm font-normal ml-1">🎟️</span>
          </p>
        </div>
        <span className="text-4xl opacity-80">💳</span>
      </div>

      {/* Inventory */}
      {Object.keys(inventory).some(id => (inventory[id] ?? 0) > 0) && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">🎒 もちもの</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(inventory).map(([id, count]) => {
              const item = ITEMS[id];
              if (!item || count <= 0) return null;
              return (
                <button key={id} onClick={() => onUseItem(id)}
                  className="bg-white border border-gray-100 active:bg-gray-50 rounded-xl px-3 py-2 flex flex-col items-center gap-0.5 shadow-sm min-w-[60px]">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[10px] text-gray-700 font-bold">{item.name}</span>
                  <span className="text-[10px] text-gray-400">×{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Shop items */}
      {categories.map(cat => {
        const items = itemsByCategory[cat] ?? [];
        return (
          <div key={cat}>
            <h3 className="text-sm font-bold text-gray-700 mb-2">{ITEM_CATEGORY_LABELS[cat]}</h3>
            <div className="flex flex-col gap-2">
              {items.map(item => {
                const canAfford = coins >= item.price;
                return (
                  <div key={item.id}
                    className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
                    <span className="text-3xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {item.effect.hunger    !== undefined && <span className="text-[10px] bg-orange-50 text-orange-600 rounded-full px-2 py-0.5 border border-orange-100">おなか{item.effect.hunger}</span>}
                        {item.effect.hydration !== undefined && <span className="text-[10px] bg-sky-50 text-sky-600 rounded-full px-2 py-0.5 border border-sky-100">水分{item.effect.hydration}</span>}
                        {item.effect.happiness !== undefined && <span className="text-[10px] bg-pink-50 text-pink-600 rounded-full px-2 py-0.5 border border-pink-100">ごきげん+{item.effect.happiness}</span>}
                        {item.effect.vip       !== undefined && <span className="text-[10px] bg-purple-50 text-purple-600 rounded-full px-2 py-0.5 border border-purple-100">VIP+{item.effect.vip}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-sm font-black text-gray-700">🎟️ {item.price}</span>
                      <button onClick={() => onBuy(item.id)} disabled={!canAfford}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                          canAfford ? "text-white active:opacity-90" : "bg-gray-100 text-gray-400"
                        }`}
                        style={canAfford ? { background: "linear-gradient(135deg, #833AB4, #E1306C)" } : {}}>
                        買う
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-center text-xs text-gray-400 pb-2">
        ミニゲームで「ちくわ券」をゲットしよう！
      </p>
    </div>
  );
}
