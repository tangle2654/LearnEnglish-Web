import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🚀</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              加入 LinguaFlow
            </h1>
            <p className="text-gray-500 mt-2">开启你的英语学习之旅</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input-field" placeholder="请输入用户名" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="请输入邮箱" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="至少 6 位" minLength={6} required />
            </div>
            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? '注册中...' : '注册'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            已有账号？<Link to="/login" className="text-primary-600 font-medium hover:underline">立即登录</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
