import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
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
            <div className="text-5xl mb-3">🌍</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              LinguaFlow
            </h1>
            <p className="text-gray-500 mt-2">沉浸式英语学习平台</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名或邮箱</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-field"
                placeholder="请输入用户名或邮箱"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="请输入密码"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            还没有账号？<Link to="/register" className="text-primary-600 font-medium hover:underline">立即注册</Link>
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            💡 演示账号：<b>demo</b> / <b>demo123</b>
          </div>
        </div>
      </div>
    </div>
  );
}
