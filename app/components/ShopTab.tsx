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
      {/* Wallet */}
      <div className="bg-yellow-100 rounded-2xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-bold text-amber-900">🎟️ ちくわ券</span>
        <span className="text-2xl font-black text-amber-700 tabular-nums">{coins.toLocaleString()}</span>
      </div>

      {/* Inventory */}
      {Object.keys(inventory).length > 0 && (
        <div>
          <h3 className="text-sm font-black text-amber-900 mb-2">🎒 もちもの</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(inventory).map(([id, count]) => {
              const item = ITEMS[id];
              if (!item || count <= 0) return null;
              return (
                <button
                  key={id}
                  onClick={() => onUseItem(id)}
                  className="bg-white/70 active:bg-white/90 rounded-xl px-3 py-2 flex flex-col items-center gap-0.5 shadow-sm min-w-[64px]"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[10px] text-amber-800 font-bold">{item.name}</span>
                  <span className="text-[10px] text-amber-500">×{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Shop items by category */}
      {categories.map(cat => {
        const items = itemsByCategory[cat] ?? [];
        return (
          <div key={cat}>
            <h3 className="text-sm font-black text-amber-900 mb-2">{ITEM_CATEGORY_LABELS[cat]}</h3>
            <div className="flex flex-col gap-2">
              {items.map(item => {
                const canAfford = coins >= item.price;
                return (
                  <div key={item.id} className="bg-white/60 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-amber-900">{item.name}</p>
                      <p className="text-xs text-amber-600">{item.description}</p>
                      {/* Effect preview */}
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {item.effect.hunger     && <span className="text-[10px] bg-orange-100 rounded px-1 text-orange-700">おなか{item.effect.hunger}</span>}
                        {item.effect.hydration  && <span className="text-[10px] bg-blue-100 rounded px-1 text-blue-700">水分{item.effect.hydration}</span>}
                        {item.effect.happiness  && <span className="text-[10px] bg-pink-100 rounded px-1 text-pink-700">ごきげん+{item.effect.happiness}</span>}
                        {item.effect.vip        && <span className="text-[10px] bg-purple-100 rounded px-1 text-purple-700">VIP+{item.effect.vip}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-black text-amber-700">🎟️{item.price}</span>
                      <button
                        onClick={() => onBuy(item.id)}
                        disabled={!canAfford}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${canAfford ? "bg-amber-500 text-white active:bg-amber-600" : "bg-gray-200 text-gray-400"}`}
                      >
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

      <p className="text-center text-xs text-amber-500 pb-2">
        ミニゲームで「ちくわ券」をゲットしよう！
      </p>
    </div>
  );
}
