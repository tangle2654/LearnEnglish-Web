import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { communityApi } from '../api';
import { useAuth } from '../context/AuthContext';

const categories = [
  { value: 'all', label: '全部' },
  { value: 'general', label: '综合讨论' },
  { value: 'learning-tips', label: '学习技巧' },
  { value: 'grammar', label: '语法问题' },
  { value: 'resources', label: '资源分享' },
];

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general' });

  const load = () => {
    communityApi.list(category).then((res: any) => setPosts(res.posts));
  };

  useEffect(() => { load(); }, [category]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communityApi.create(form);
      setForm({ title: '', content: '', category: 'general' });
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">💬 学习社区</h1>
          <p className="text-gray-500">与全球学习者交流，分享经验，共同进步</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          ✏️ 发布帖子
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(c => (
          <button key={c.value} onClick={() => setCategory(c.value)} className={`px-4 py-2 rounded-xl font-medium ${category === c.value ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card mb-6 animate-slide-up">
          <h3 className="font-bold text-lg mb-4">发布新帖</h3>
          <form onSubmit={submit} className="space-y-4">
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="帖子标题" required />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
              {categories.filter(c => c.value !== 'all').map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="input-field min-h-[120px]" placeholder="分享你的想法..." required />
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">发布</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="card text-center text-gray-500 py-12">暂无帖子，快来发布第一条吧！</div>
        ) : (
          posts.map((p, i) => (
            <Link key={p.id} to={`/community/${p.id}`} className="card hover:scale-[1.01] transition-transform block animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full text-xs font-medium">{p.category}</span>
                    <span className="text-xs text-gray-400">{p.username}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{p.content}</p>
                </div>
                <div className="text-amber-500 font-medium text-sm ml-4 whitespace-nowrap">❤️ {p.likes}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
