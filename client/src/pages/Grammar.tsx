import { useEffect, useState } from 'react';
import { grammarApi, progressApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Grammar() {
  const { refreshUser } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [level, setLevel] = useState('A1');
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    grammarApi.list({ level }).then((res: any) => {
      setQuestions(res.questions);
      setIdx(0);
      setAnswer('');
      setSubmitted(false);
    });
  }, [level]);

  const q = questions[idx];
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const checkAnswer = (ans: string, correct: string): boolean => {
    const accepted = correct.split('/').map(s => s.trim().toLowerCase());
    return accepted.includes(ans.trim().toLowerCase());
  };

  const submit = () => {
    if (!q || !answer) return;
    const correct = checkAnswer(answer, q.answer);
    setSubmitted(true);
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    progressApi.record({ type: 'grammar', correct: correct ? 1 : 0, total: 1 }).catch(() => {});
    refreshUser();
  };

  const next = () => {
    setIdx(i => Math.min(i + 1, questions.length - 1));
    setAnswer('');
    setSubmitted(false);
  };

  const isCorrect = submitted && q && checkAnswer(answer, q.answer);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">✏️ 语法练习</h1>
          <p className="text-gray-500">选择题 + 填空题，即时反馈与解析</p>
        </div>
        {score.total > 0 && (
          <div className="card py-2 px-4">
            <span className="text-green-600 font-bold">{score.correct}</span>
            <span className="text-gray-400"> / </span>
            <span className="text-gray-600">{score.total}</span>
            <span className="text-sm text-gray-500 ml-2">正确</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {levels.map(l => (
          <button key={l} onClick={() => setLevel(l)} className={`px-4 py-2 rounded-xl font-medium ${level === l ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{l}</button>
        ))}
      </div>

      {q ? (
        <div className="max-w-2xl mx-auto card">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {q.type === 'choice' ? '选择题' : '填空题'} · {q.level}
            </span>
            <span className="text-sm text-gray-400">{idx + 1} / {questions.length}</span>
          </div>

          <h2 className="text-xl font-semibold mb-6 leading-relaxed">{q.question}</h2>

          {q.type === 'choice' ? (
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
                        : answer === opt
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-200 opacity-60'
                      : answer === opt
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                  {submitted && opt.toLowerCase() === q.answer.toLowerCase() && ' ✅'}
                  {submitted && answer === opt && opt.toLowerCase() !== q.answer.toLowerCase() && ' ❌'}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !submitted && submit()}
              disabled={submitted}
              className="input-field text-lg"
              placeholder="请输入答案..."
            />
          )}

          {!submitted ? (
            <button onClick={submit} disabled={!answer} className="btn-primary w-full mt-6">提交答案</button>
          ) : (
            <div className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '✅ 回答正确！' : '❌ 回答错误'}
              </div>
              {!isCorrect && <div className="text-gray-700 mb-2">正确答案：<b>{q.answer}</b></div>}
              <div className="text-gray-600 text-sm">💡 {q.explanation}</div>
              <button onClick={next} disabled={idx === questions.length - 1} className="btn-primary mt-4">下一题 →</button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">暂无题目</div>
      )}
    </div>
  );
}
