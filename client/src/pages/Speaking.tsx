import { useEffect, useState, useRef } from 'react';
import { listeningApi } from '../api';

// Levenshtein distance based similarity (0-100)
function similarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 100;
  if (!s1.length || !s2.length) return 0;
  const dp: number[][] = Array.from({ length: s1.length + 1 }, () => Array(s2.length + 1).fill(0));
  for (let i = 0; i <= s1.length; i++) dp[i][0] = i;
  for (let j = 0; j <= s2.length; j++) dp[0][j] = j;
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      dp[i][j] = s1[i - 1] === s2[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const maxLen = Math.max(s1.length, s2.length);
  return Math.round((1 - dp[s1.length][s2.length] / maxLen) * 100);
}

export default function Speaking() {
  const [sentences, setSentences] = useState<any[]>([]);
  const [level, setLevel] = useState('A1');
  const [idx, setIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [recognized, setRecognized] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    listeningApi.sentences({ level }).then((res: any) => {
      setSentences(res.sentences);
      setIdx(0);
      setScore(null);
      setRecognized('');
    });
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
  }, [level]);

  const current = sentences[idx];
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.85;
      speechSynthesis.speak(u);
    }
  };

  const startRecognition = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setRecognized(text);
      if (current) {
        const s = similarity(text, current.sentence);
        setScore(s);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const getScoreColor = (s: number) => s >= 80 ? 'text-green-500' : s >= 50 ? 'text-amber-500' : 'text-red-500';
  const getScoreLabel = (s: number) => s >= 80 ? '优秀！' : s >= 50 ? '不错，继续加油' : '再试一次';

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">🎙️ 口语跟读</h1>
      <p className="text-gray-500 mb-6">听标准发音，录音跟读，AI 智能评分</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {levels.map(l => (
          <button key={l} onClick={() => setLevel(l)} className={`px-4 py-2 rounded-xl font-medium ${level === l ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{l}</button>
        ))}
      </div>

      {!supported && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl mb-6">
          ⚠️ 当前浏览器不支持语音识别，建议使用 Chrome 或 Edge 浏览器以获得完整体验。
        </div>
      )}

      {current ? (
        <div className="max-w-2xl mx-auto">
          <div className="card text-center mb-6">
            <div className="text-sm text-gray-500 mb-2">请跟读以下句子：</div>
            <p className="text-2xl font-semibold text-gray-800 mb-3 leading-relaxed">{current.sentence}</p>
            <p className="text-gray-500 mb-4">{current.translation}</p>
            <button onClick={() => speak(current.sentence)} className="btn-secondary">
              🔊 播放标准发音
            </button>
          </div>

          <div className="card text-center">
            <div className={`text-6xl mb-4 transition-all ${listening ? 'animate-pulse text-red-500' : 'text-gray-300'}`}>
              {listening ? '🎙️' : '🎤'}
            </div>
            <div className="text-gray-500 mb-4">
              {listening ? '正在聆听...请朗读句子' : '点击下方按钮开始录音'}
            </div>

            {!listening ? (
              <button onClick={startRecognition} disabled={!supported} className="btn-primary text-lg">
                🎙️ 开始录音
              </button>
            ) : (
              <button onClick={stopRecognition} className="bg-red-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-red-600">
                ⏹ 停止录音
              </button>
            )}

            {score !== null && (
              <div className="mt-6 animate-slide-up">
                <div className="text-sm text-gray-500 mb-1">识别结果</div>
                <div className="text-lg text-gray-700 mb-4 italic">"{recognized}"</div>
                <div className="text-sm text-gray-500 mb-1">相似度评分</div>
                <div className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}<span className="text-2xl">/100</span></div>
                <div className={`text-lg font-medium mt-2 ${getScoreColor(score)}`}>{getScoreLabel(score)}</div>
                <button onClick={() => { setScore(null); setRecognized(''); }} className="btn-secondary mt-4">再试一次</button>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => { setIdx(i => Math.max(0, i - 1)); setScore(null); setRecognized(''); }} disabled={idx === 0} className="btn-secondary disabled:opacity-50">← 上一句</button>
            <span className="text-gray-500">{idx + 1} / {sentences.length}</span>
            <button onClick={() => { setIdx(i => Math.min(sentences.length - 1, i + 1)); setScore(null); setRecognized(''); }} disabled={idx === sentences.length - 1} className="btn-primary disabled:opacity-50">下一句 →</button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">暂无口语练习</div>
      )}
    </div>
  );
}
