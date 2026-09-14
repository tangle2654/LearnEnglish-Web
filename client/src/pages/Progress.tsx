import { useEffect, useState } from 'react';
import { progressApi } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function Progress() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressApi.stats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-xl">加载中...</div>;
  if (!stats) return <div className="text-center py-20 text-gray-500">暂无数据</div>;

  const weeklyData = stats.weekly.map((w: any) => ({
    date: w.date.slice(5),
    duration: Math.round(w.duration / 60),
    count: w.count,
  }));

  const statCards = [
    { label: '已完成课时', value: stats.completedLessons, icon: '📖', color: 'from-green-400 to-emerald-500' },
    { label: '答题正确率', value: `${stats.accuracy}%`, icon: '🎯', color: 'from-blue-400 to-indigo-500' },
    { label: '累计答题', value: `${stats.correct}/${stats.total}`, icon: '✏️', color: 'from-purple-400 to-pink-500' },
    { label: '学习时长', value: `${Math.round(stats.duration / 60)} 分钟`, icon: '⏱️', color: 'from-orange-400 to-red-500' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">📊 学习进度</h1>
      <p className="text-gray-500 mb-8">追踪你的学习数据，见证每一次进步</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg animate-slide-up`} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm opacity-90">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-lg mb-4">📈 近 7 天学习时长（分钟）</h3>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="duration" radius={[8, 8, 0, 0]}>
                  {weeklyData.map((_: any, i: number) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#3b82f6' : '#d946ef'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400">暂无数据，开始学习吧！</div>
          )}
        </div>

        <div className="card">
          <h3 className="font-bold text-lg mb-4">📝 近 7 天练习次数</h3>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {weeklyData.map((_: any, i: number) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#10b981' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400">暂无数据</div>
          )}
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="font-bold text-lg mb-4">🏅 等级进度</h3>
        <div className="flex items-center gap-4">
          <div className="text-2xl">{stats.level}</div>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full" style={{ width: `${Math.min(stats.completedLessons * 5, 100)}%` }}></div>
          </div>
          <div className="text-sm text-gray-500">{stats.completedLessons * 5}%</div>
        </div>
      </div>
    </div>
  );
}
