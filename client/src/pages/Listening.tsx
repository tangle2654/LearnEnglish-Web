import { useEffect, useState } from 'react';
import { listeningApi, progressApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Listening() {
  const { refreshUser } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [level, setLevel] = useState('A1');
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    listeningApi.list({ level }).then((res: any) => {
      setQuestions(res.questions);
      setIdx(0);
      setAnswer('');
      setSubmitted(false);
      setShowText(false);
    });
  }, [level]);

  const q = questions[idx];
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

  const playAudio = () => {
    if (q && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(q.audio_text);
      u.lang = 'en-US';
      u.rate = 0.85;
      speechSynthesis.speak(u);
    }
  };

  const submit = () => {
    if (!q || !answer) return;
    const correct = answer.trim().toLowerCase() === q.answer.toLowerCase();
    setSubmitted(true);
    progressApi.record({ type: 'listening', correct: correct ? 1 : 0, total: 1 }).catch(() => {});
    refreshUser();
  };

  const next = () => {
    setIdx(i => Math.min(i + 1, questions.length - 1));
    setAnswer('');
    setSubmitted(false);
    setShowText(false);
  };

  const isCorrect = submitted && answer.trim().toLowerCase() === q?.answer.toLowerCase();

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">👂 听力训练</h1>
      <p className="text-gray-500 mb-6">播放音频，理解内容，回答问题</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {levels.map(l => (
          <button key={l} onClick={() => setLevel(l)} className={`px-4 py-2 rounded-xl font-medium ${level === l ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{l}</button>
        ))}
      </div>

      {q ? (
        <div className="max-w-2xl mx-auto">
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">听力题 · {q.level}</span>
              <span className="text-sm text-gray-400">{idx + 1} / {questions.length}</span>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 text-center mb-6">
              <div className="text-5xl mb-3">🎧</div>
              <p className="text-gray-600 mb-4">点击下方按钮播放听力音频</p>
              <button onClick={playAudio} className="btn-primary text-lg">
                ▶️ 播放音频
              </button>
              {showText && (
                <div className="mt-4 p-4 bg-white rounded-xl text-left animate-slide-up">
                  <div className="text-sm text-gray-500 mb-1">听力原文：</div>
                  <div className="text-gray-800 italic">"{q.audio_text}"</div>
                </div>
              )}
            </div>

            <h2 className="text-lg font-semibold mb-4">{q.question}</h2>

            {q.options ? (
              <div className="space-y-3">
                {q.options.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => !submitted && setAnswer(opt)}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      submitted
                        ? opt.toLowerCase() === q.answer.toLowerCase()
                          ? 'border-green-400 bg-green-50'
                          : answer === opt ? 'border-red-400 bg-red-50' : 'border-gray-200 opacity-60'
                        : answer === opt ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {opt}
                    {submitted && opt.toLowerCase() === q.answer.toLowerCase() && ' ✅'}
                    {submitted && answer === opt && opt.toLowerCase() !== q.answer.toLowerCase() && ' ❌'}
                  </button>
                ))}
              </div>
            ) : (
              <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} disabled={submitted} className="input-field" placeholder="请输入答案..." />
            )}

            {!submitted ? (
              <button onClick={submit} disabled={!answer} className="btn-primary w-full mt-6">提交答案</button>
            ) : (
              <div className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className={`font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '✅ 回答正确！' : '❌ 回答错误'}
                </div>
                {!isCorrect && <div className="text-gray-700 mb-2">正确答案：<b>{q.answer}</b></div>}
                <div className="text-gray-600 text-sm mb-3">💡 {q.explanation}</div>
                <button onClick={() => setShowText(true)} className="text-orange-600 text-sm font-medium hover:underline">📝 查看听力原文</button>
                <button onClick={next} className="btn-primary mt-4 ml-4">下一题 →</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">暂无听力题</div>
      )}
    </div>
  );
}
