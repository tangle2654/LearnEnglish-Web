import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseApi } from '../api';

export default function CourseDetail() {
  const { id } = useParams();
  const [units, setUnits] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [expandedUnit, setExpandedUnit] = useState<number | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    courseApi.list().then((res: any) => {
      const c = res.courses.find((x: any) => x.id === Number(id));
      setCourse(c);
    });
    courseApi.units(Number(id)).then((res: any) => setUnits(res.units));
  }, [id]);

  const toggleUnit = async (unitId: number) => {
    if (expandedUnit === unitId) {
      setExpandedUnit(null);
    } else {
      setExpandedUnit(unitId);
      const res: any = await courseApi.lessons(unitId);
      setLessons(res.lessons);
    }
  };

  if (!course) return <div className="text-center py-20 text-xl">加载中...</div>;

  return (
    <div className="animate-fade-in">
      <Link to="/courses" className="text-primary-600 hover:underline text-sm mb-4 inline-block">← 返回课程列表</Link>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: course.color }}>
          {course.level}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-gray-500">{course.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {units.map((u, idx) => (
          <div key={u.id} className="card overflow-hidden">
            <button onClick={() => toggleUnit(u.id)} className="w-full flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-lg">{u.title}</h3>
                  <p className="text-sm text-gray-500">{u.description}</p>
                </div>
              </div>
              <span className={`text-gray-400 transition-transform ${expandedUnit === u.id ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {expandedUnit === u.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up">
                {lessons.map((l: any) => (
                  <Link key={l.id} to={`/lessons/${l.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors group">
                    <span className="text-primary-400 group-hover:text-primary-600">📖</span>
                    <div>
                      <div className="font-medium">{l.title}</div>
                      <div className="text-xs text-gray-500">{l.description}</div>
                    </div>
                    <span className="ml-auto text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
