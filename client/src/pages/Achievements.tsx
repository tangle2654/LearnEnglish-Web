import { useEffect, useState } from 'react';
import { achievementApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Achievements() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    achievementApi.badges().then((res: any) => setBadges(res.badges)).catch(() => {});
    achievementApi.leaderboard().then((res: any) => setLeaderboard(res.users)).catch(() => {});
  }, []);

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">🏆 成就中心</h1>
      <p className="text-gray-500 mb-8">收集徽章，登顶排行榜，成为英语达人</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🎖️ 我的徽章</h2>
            <span className="text-sm text-gray-500">{earnedCount} / {badges.length}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map(b => (
              <div key={b.id} className={`card text-center transition-all ${b.earned ? 'hover:scale-105' : 'opacity-50 grayscale'}`}>
                <div className="text-5xl mb-2">{b.icon}</div>
                <div className="font-bold text-sm mb-1">{b.name}</div>
                <div className="text-xs text-gray-500 mb-2">{b.description}</div>
                {b.earned ? (
                  <span className="text-xs text-green-600 font-medium">✅ 已获得</span>
                ) : (
                  <span className="text-xs text-gray-400">🔒 未解锁</span>
                )}
                {b.points > 0 && <div className="text-xs text-amber-600 mt-1">+{b.points} 积分</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="text-xl font-bold mb-4">👑 排行榜</h2>
          <div className="card">
            {leaderboard.length === 0 ? (
              <div className="text-center text-gray-400 py-6">暂无数据</div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((u, i) => (
                  <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl ${u.id === user?.id ? 'bg-primary-50' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{u.username}{u.id === user?.id && ' (我)'}</div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      ⭐ {u.points}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 card bg-gradient-to-br from-primary-50 to-accent-50">
            <div className="text-sm text-gray-600">我的排名</div>
            <div className="text-2xl font-bold text-primary-600">
              {leaderboard.findIndex((u: any) => u.id === user?.id) + 1 || '-'} / {leaderboard.length}
            </div>
            <div className="text-sm text-amber-600 font-medium mt-1">⭐ {user?.points} 积分</div>
          </div>
        </div>
      </div>
    </div>
  );
}
