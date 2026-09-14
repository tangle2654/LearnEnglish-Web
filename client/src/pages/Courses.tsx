import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../api';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseApi.list().then((res: any) => setCourses(res.courses)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-xl">加载中...</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">📚 分级课程体系</h1>
      <p className="text-gray-500 mb-8">从入门到精通，A1-C2 六个等级循序渐进</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c, idx) => (
          <Link key={c.id} to={`/courses/${c.id}`} className="card hover:scale-105 transition-transform animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg" style={{ backgroundColor: c.color }}>
                {c.level}
              </div>
              <div>
                <h3 className="font-bold text-lg">{c.title}</h3>
                <p className="text-sm text-gray-500">{c.description}</p>
              </div>
            </div>
            <div className="text-primary-600 text-sm font-medium">查看单元 →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
