import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { communityApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);

  const load = () => {
    communityApi.detail(Number(id)).then((res: any) => {
      setPost(res.post);
      setComments(res.comments);
    });
    communityApi.liked(Number(id)).then((res: any) => setLiked(res.liked)).catch(() => {});
  };

  useEffect(() => { load(); }, [id]);

  const handleLike = async () => {
    const res: any = await communityApi.like(Number(id));
    setLiked(res.liked);
    setPost((p: any) => ({ ...p, likes: p.likes + (res.liked ? 1 : -1) }));
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await communityApi.comment(Number(id), comment);
    setComment('');
    load();
  };

  if (!post) return <div className="text-center py-20 text-xl">加载中...</div>;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <Link to="/community" className="text-primary-600 hover:underline text-sm mb-4 inline-block">← 返回社区</Link>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-medium">{post.category}</span>
          <span className="text-sm text-gray-500">@{post.username}</span>
          <span className="text-sm text-gray-400">{post.created_at?.replace('T', ' ').slice(0, 16)}</span>
        </div>
        <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-4">
          <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${liked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500 hover:bg-red-50'}`}>
            {liked ? '❤️' : '🤍'} {post.likes}
          </button>
          <span className="text-gray-500 text-sm">💬 {comments.length} 评论</span>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-lg mb-4">评论 ({comments.length})</h3>
        <form onSubmit={submitComment} className="flex gap-2 mb-6">
          <input type="text" value={comment} onChange={e => setComment(e.target.value)} className="input-field" placeholder="写下你的评论..." />
          <button type="submit" className="btn-primary">发送</button>
        </form>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-gray-400 py-6">暂无评论，来抢沙发吧！</div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{c.username}</span>
                  <span className="text-xs text-gray-400">{c.created_at?.replace('T', ' ').slice(0, 16)}</span>
                </div>
                <p className="text-gray-700">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
