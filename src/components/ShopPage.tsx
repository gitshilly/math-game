import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import CoinDisplay from './CoinDisplay';
import AchievementBadge from './AchievementBadge';
import { playClickSound } from '../utils/sound';

interface ShopPageProps {
  onClose: () => void;
}

export default function ShopPage({ onClose }: ShopPageProps) {
  const {
    stats,
    shopItems,
    achievements,
    purchaseItem,
    equipTitle,
    equipFrame,
    equippedTitle,
    equippedFrame,
    soundEnabled,
  } = useGame();

  const [tab, setTab] = useState<'shop' | 'achievements'>('shop');
  const [message, setMessage] = useState('');

  const titles = shopItems.filter(i => i.type === 'title');
  const frames = shopItems.filter(i => i.type === 'avatar_frame');

  const handlePurchase = (itemId: string) => {
    if (soundEnabled) playClickSound();
    const success = purchaseItem(itemId);
    if (success) {
      setMessage('购买成功!');
    } else {
      setMessage('金币不足!');
    }
    setTimeout(() => setMessage(''), 2000);
  };

  const handleEquip = (item: typeof shopItems[0]) => {
    if (soundEnabled) playClickSound();
    if (item.type === 'title') {
      equipTitle(equippedTitle === item.name ? '' : item.name);
    } else {
      equipFrame(equippedFrame === item.id ? '' : item.id);
    }
  };

  return (
    <div className="page-enter max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          ← 返回
        </button>
        <CoinDisplay amount={stats.totalCoins} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('shop')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            tab === 'shop' ? 'bg-indigo-600 text-white' : 'glass text-gray-400'
          }`}
        >
          🛒 商店
        </button>
        <button
          onClick={() => setTab('achievements')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            tab === 'achievements' ? 'bg-indigo-600 text-white' : 'glass text-gray-400'
          }`}
        >
          🏆 成就
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="text-center text-yellow-400 text-sm mb-4 animate-bounce-in">
          {message}
        </div>
      )}

      {tab === 'shop' ? (
        <div className="space-y-6">
          {/* Titles */}
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-1">
              <span>🏷️</span> 称号
            </h3>
            <div className="space-y-2">
              {titles.map(item => (
                <div key={item.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-bold text-sm">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.description}</div>
                    </div>
                  </div>
                  <div>
                    {item.owned ? (
                      <button
                        onClick={() => handleEquip(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          equippedTitle === item.name
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        {equippedTitle === item.name ? '已装备' : '装备'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(item.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          stats.totalCoins >= item.price
                            ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={stats.totalCoins < item.price}
                      >
                        🪙 {item.price}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frames */}
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-1">
              <span>🖼️</span> 头像框
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {frames.map(item => (
                <div key={item.id} className="glass rounded-xl p-4 text-center">
                  <span className="text-3xl">{item.icon}</span>
                  <div className="font-bold text-sm mt-2">{item.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{item.description}</div>
                  {item.owned ? (
                    <button
                      onClick={() => handleEquip(item)}
                      className={`w-full px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        equippedFrame === item.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {equippedFrame === item.id ? '已装备' : '装备'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item.id)}
                      className={`w-full px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        stats.totalCoins >= item.price
                          ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={stats.totalCoins < item.price}
                    >
                      🪙 {item.price}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-center mb-4">
            <span className="text-sm text-gray-400">
              已解锁 {achievements.filter(a => a.unlocked).length} / {achievements.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map(a => (
              <AchievementBadge key={a.id} achievement={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
