import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonDetail from './pages/LessonDetail';
import Vocabulary from './pages/Vocabulary';
import Grammar from './pages/Grammar';
import Speaking from './pages/Speaking';
import Listening from './pages/Listening';
import Progress from './pages/Progress';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import Achievements from './pages/Achievements';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-pulse">🌍 加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/lessons/:id" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
          <Route path="/vocabulary" element={<ProtectedRoute><Vocabulary /></ProtectedRoute>} />
          <Route path="/grammar" element={<ProtectedRoute><Grammar /></ProtectedRoute>} />
          <Route path="/speaking" element={<ProtectedRoute><Speaking /></ProtectedRoute>} />
          <Route path="/listening" element={<ProtectedRoute><Listening /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/community/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
