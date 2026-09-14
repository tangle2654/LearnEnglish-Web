import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseApi, progressApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    courseApi.lesson(Number(id)).then(setData);
  }, [id]);

  const markComplete = async () => {
    try {
      await progressApi.record({ lesson_id: Number(id), type: 'lesson', correct: 1, total: 1, duration: 5 });
      setCompleted(true);
      refreshUser();
      setTimeout(() => navigate('/'), 1500);
    } catch (e) {
      setCompleted(true);
    }
  };

  if (!data) return <div className="text-center py-20 text-xl">加载中...</div>;

  const { lesson, unit, course } = data;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <Link to={course ? `/courses/${course.id}` : '/courses'} className="text-primary-600 hover:underline text-sm mb-4 inline-block">← 返回</Link>

      <div className="card">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: course?.color }}>
            {course?.level}
          </span>
          <span className="text-sm text-gray-500">{unit?.title}</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
        <p className="text-gray-600 mb-6">{lesson.description}</p>

        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-3">📖 课时内容</h3>
          <p className="text-gray-700 leading-relaxed">
            本课时将帮助你掌握 {lesson.title} 相关的英语知识。通过系统学习词汇、语法和表达，
            你将能够在实际场景中运用所学内容。建议配合下方的互动练习进行巩固。
          </p>
        </div>

        <h3 className="font-bold text-lg mb-4">🎯 配套练习</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link to="/vocabulary" className="card border-2 border-green-100 hover:border-green-300 transition-colors">
            <div className="text-2xl mb-1">🔤</div>
            <div className="font-semibold">单词记忆</div>
            <div className="text-sm text-gray-500">学习本课核心词汇</div>
          </Link>
          <Link to="/grammar" className="card border-2 border-blue-100 hover:border-blue-300 transition-colors">
            <div className="text-2xl mb-1">✏️</div>
            <div className="font-semibold">语法练习</div>
            <div className="text-sm text-gray-500">巩固语法知识点</div>
          </Link>
          <Link to="/speaking" className="card border-2 border-purple-100 hover:border-purple-300 transition-colors">
            <div className="text-2xl mb-1">🎙️</div>
            <div className="font-semibold">口语跟读</div>
            <div className="text-sm text-gray-500">练习口语发音</div>
          </Link>
          <Link to="/listening" className="card border-2 border-orange-100 hover:border-orange-300 transition-colors">
            <div className="text-2xl mb-1">👂</div>
            <div className="font-semibold">听力训练</div>
            <div className="text-sm text-gray-500">提升听力理解</div>
          </Link>
        </div>

        <button onClick={markComplete} disabled={completed} className="btn-primary w-full text-lg">
          {completed ? '✅ 已完成！获得积分中...' : '✓ 标记完成并获得积分'}
        </button>
      </div>
    </div>
  );
}
