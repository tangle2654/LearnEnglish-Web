import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/courses', label: '课程', icon: '📚' },
  { to: '/vocabulary', label: '单词', icon: '🔤' },
  { to: '/grammar', label: '语法', icon: '✏️' },
  { to: '/speaking', label: '口语', icon: '🎙️' },
  { to: '/listening', label: '听力', icon: '👂' },
  { to: '/progress', label: '进度', icon: '📊' },
  { to: '/community', label: '社区', icon: '💬' },
  { to: '/achievements', label: '成就', icon: '🏆' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            🌍 LinguaFlow
          </NavLink>
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <span className="mr-1">{item.icon}</span>{item.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
              <span className="text-amber-500">⭐</span>
              <span className="text-sm font-semibold text-amber-700">{user.points}</span>
            </div>
            <div className="text-sm text-gray-700 hidden sm:block">{user.username}</div>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
              退出
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="lg:hidden flex gap-1 overflow-x-auto pb-2 -mx-4 px-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600'
                }`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
