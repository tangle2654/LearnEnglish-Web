import { useEffect, useState } from 'react';
import { vocabApi, progressApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Vocabulary() {
  const { user, refreshUser } = useAuth();
  const [words, setWords] = useState<any[]>([]);
  const [level, setLevel] = useState<string>('A1');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<'flashcard' | 'spelling'>('flashcard');
  const [spellingInput, setSpellingInput] = useState('');
  const [spellingResult, setSpellingResult] = useState<'correct' | 'wrong' | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    loadWords();
  }, [level]);

  useEffect(() => {
    vocabApi.userWords().then((res: any) => setSavedIds(new Set(res.words.map((w: any) => w.id)))).catch(() => {});
  }, []);

  const loadWords = () => {
    vocabApi.list({ level }).then((res: any) => {
      setWords(res.words);
      setCurrentIdx(0);
      setFlipped(false);
    });
  };

  const current = words[currentIdx];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      speechSynthesis.speak(u);
    }
  };

  const next = () => {
    setCurrentIdx(i => Math.min(i + 1, words.length - 1));
    setFlipped(false);
    setSpellingInput('');
    setSpellingResult(null);
  };
  const prev = () => {
    setCurrentIdx(i => Math.max(i - 1, 0));
    setFlipped(false);
    setSpellingInput('');
    setSpellingResult(null);
  };

  const checkSpelling = () => {
    if (!current) return;
    const correct = spellingInput.trim().toLowerCase() === current.word.toLowerCase();
    setSpellingResult(correct ? 'correct' : 'wrong');
    progressApi.record({ type: 'spelling', correct: correct ? 1 : 0, total: 1 }).catch(() => {});
    refreshUser();
  };

  const toggleSave = async () => {
    if (!current) return;
    try {
      if (savedIds.has(current.id)) {
        await vocabApi.removeWord(current.id);
        setSavedIds(prev => { const n = new Set(prev); n.delete(current.id); return n; });
      } else {
        await vocabApi.addWord(current.id);
        setSavedIds(prev => new Set(prev).add(current.id));
      }
    } catch (e) { /* ignore */ }
  };

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">🔤 单词记忆</h1>
          <p className="text-gray-500">闪卡学习 + 拼写测试，轻松掌握核心词汇</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSaved(!showSaved)} className={`btn-secondary text-sm ${showSaved ? 'bg-primary-50' : ''}`}>
            ⭐ 单词本 ({savedIds.size})
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {levels.map(l => (
          <button key={l} onClick={() => { setLevel(l); setShowSaved(false); }} className={`px-4 py-2 rounded-xl font-medium transition-all ${level === l && !showSaved ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode('flashcard')} className={`px-4 py-2 rounded-xl font-medium ${mode === 'flashcard' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'}`}>
          🎴 闪卡模式
        </button>
        <button onClick={() => setMode('spelling')} className={`px-4 py-2 rounded-xl font-medium ${mode === 'spelling' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'}`}>
          ✍️ 拼写测试
        </button>
      </div>

      {current ? (
        <div className="max-w-2xl mx-auto">
          {mode === 'flashcard' ? (
            <>
              <div className="flip-card h-64 cursor-pointer mb-6" onClick={() => setFlipped(!flipped)}>
                <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`} style={{ transform: flipped ? 'rotateY(180deg)' : '' }}>
                  <div className="flip-card-front bg-gradient-to-br from-primary-500 to-accent-500 text-white">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2">{current.word}</div>
                      <div className="text-xl opacity-90">{current.phonetic}</div>
                      <button onClick={(e) => { e.stopPropagation(); speak(current.word); }} className="mt-4 bg-white/20 px-4 py-2 rounded-full hover:bg-white/30">
                        🔊 播放发音
                      </button>
                      <div className="text-sm mt-4 opacity-75">点击卡片查看释义</div>
                    </div>
                  </div>
                  <div className="flip-card-back bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-3">{current.meaning}</div>
                      <div className="text-lg italic opacity-90 max-w-md">"{current.example}"</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <button onClick={prev} disabled={currentIdx === 0} className="btn-secondary disabled:opacity-50">← 上一个</button>
                <button onClick={toggleSave} className={`px-4 py-2 rounded-xl ${savedIds.has(current.id) ? 'bg-amber-400 text-white' : 'btn-secondary'}`}>
                  {savedIds.has(current.id) ? '⭐ 已收藏' : '☆ 收藏'}
                </button>
                <button onClick={next} disabled={currentIdx === words.length - 1} className="btn-primary disabled:opacity-50">下一个 →</button>
              </div>
              <div className="text-center text-sm text-gray-500 mt-4">{currentIdx + 1} / {words.length}</div>
            </>
          ) : (
            <div className="card">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold mb-2">{current.meaning}</div>
                <button onClick={() => speak(current.word)} className="btn-secondary text-sm">🔊 听发音</button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={spellingInput}
                  onChange={e => setSpellingInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !spellingResult && checkSpelling()}
                  className="input-field"
                  placeholder="请输入对应的英文单词..."
                  disabled={spellingResult !== null}
                />
                {!spellingResult && <button onClick={checkSpelling} className="btn-primary">提交</button>}
              </div>
              {spellingResult && (
                <div className={`mt-4 p-4 rounded-xl ${spellingResult === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <div className="font-bold text-lg">
                    {spellingResult === 'correct' ? '✅ 回答正确！' : '❌ 回答错误'}
                  </div>
                  {spellingResult === 'wrong' && <div>正确答案：<b>{current.word}</b></div>}
                  <div className="text-sm mt-1 text-gray-600">{current.example}</div>
                  <button onClick={next} className="btn-primary mt-3">下一题 →</button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">暂无单词数据</div>
      )}
    </div>
  );
}
