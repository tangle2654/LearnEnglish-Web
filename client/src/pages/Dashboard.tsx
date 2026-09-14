import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendApi, progressApi, courseApi } from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [recommend, setRecommend] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    recommendApi.get().then(setRecommend).catch(() => {});
    progressApi.stats().then(setStats).catch(() => {});
    courseApi.list().then((res: any) => setCourses(res.courses)).catch(() => {});
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">你好，{user?.username}！👋</h1>
        <p className="text-primary-50 opacity-90">欢迎回到 LinguaFlow，继续你的英语学习之旅吧！</p>
        <div className="flex gap-6 mt-6">
          <div className="bg-white/20 rounded-xl px-5 py-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{stats?.completedLessons || 0}</div>
            <div className="text-sm opacity-90">已完成课时</div>
          </div>
          <div className="bg-white/20 rounded-xl px-5 py-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{stats?.accuracy || 0}%</div>
            <div className="text-sm opacity-90">正确率</div>
          </div>
          <div className="bg-white/20 rounded-xl px-5 py-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{stats?.points || 0}</div>
            <div className="text-sm opacity-90">积分</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🎯 为你推荐 <span className="text-sm font-normal text-gray-500">基于你的学习水平</span>
        </h2>
        {recommend && (
          <div className="space-y-4">
            <p className="text-gray-600 bg-white rounded-xl px-4 py-2 inline-block shadow-sm">
              {recommend.message}
            </p>
            {recommend.nextLessons?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">📖 继续学习</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommend.nextLessons.map((l: any) => (
                    <Link key={l.id} to={`/lessons/${l.id}`} className="card hover:scale-105 transition-transform">
                      <div className="text-xs text-primary-600 font-semibold mb-1">{l.level}</div>
                      <div className="font-semibold text-gray-800">{l.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{l.unit_title}</div>
                      <div className="mt-3 text-primary-500 text-sm font-medium">开始学习 →</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {recommend.reviewLessons?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">🔁 建议复习</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommend.reviewLessons.map((l: any) => (
                    <Link key={l.id} to={`/lessons/${l.id}`} className="card border-2 border-amber-200 hover:scale-105 transition-transform">
                      <div className="text-xs text-amber-600 font-semibold mb-1">{l.level}</div>
                      <div className="font-semibold text-gray-800">{l.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{l.unit_title}</div>
                      <div className="mt-3 text-amber-600 text-sm font-medium">复习 →</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick access */}
      <div>
        <h2 className="text-2xl font-bold mb-4">⚡ 快速入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/vocabulary', icon: '🔤', label: '单词记忆', color: 'from-green-400 to-emerald-500' },
            { to: '/grammar', icon: '✏️', label: '语法练习', color: 'from-blue-400 to-indigo-500' },
            { to: '/speaking', icon: '🎙️', label: '口语跟读', color: 'from-purple-400 to-pink-500' },
            { to: '/listening', icon: '👂', label: '听力训练', color: 'from-orange-400 to-red-500' },
          ].map(item => (
            <Link key={item.to} to={item.to} className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform`}>
              <div className="text-4xl mb-2">{item.icon}</div>
              <div className="font-semibold text-lg">{item.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Course levels */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📚 课程等级</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {courses.map(c => (
            <Link key={c.id} to={`/courses/${c.id}`} className="card text-center hover:scale-105 transition-transform">
              <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white font-bold text-xl mb-2" style={{ backgroundColor: c.color }}>
                {c.level}
              </div>
              <div className="font-semibold text-sm">{c.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
