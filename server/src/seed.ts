import { db, initSchema } from './db';

initSchema();

// Clear existing data
const tables = ['progress', 'completed_lessons', 'user_words', 'comments', 'likes', 'user_badges',
  'posts', 'lessons', 'units', 'courses', 'vocabulary', 'grammar_questions',
  'listening_questions', 'speaking_sentences', 'badges'];

export function seedDatabase(reset: boolean = false) {
  if (reset) {
    for (const t of tables) db.exec(`DELETE FROM ${t}`);
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('" + tables.join("','") + "')");
  }

// ===== Courses (A1-C2) =====
const courses = [
  { level: 'A1', title: '入门级 Beginner', description: '基础词汇与日常对话', color: '#10b981' },
  { level: 'A2', title: '初级 Elementary', description: '简单交流与语法基础', color: '#3b82f6' },
  { level: 'B1', title: '中级 Intermediate', description: '流利表达与复杂句式', color: '#8b5cf6' },
  { level: 'B2', title: '中高级 Upper-Intermediate', description: '深入话题与地道表达', color: '#f59e0b' },
  { level: 'C1', title: '高级 Advanced', description: '学术英语与精准表达', color: '#ef4444' },
  { level: 'C2', title: '精通级 Proficiency', description: '母语级流利与文化理解', color: '#ec4899' },
];
const insertCourse = db.prepare('INSERT INTO courses (level, title, description, color) VALUES (?, ?, ?, ?)');
const courseIds: Record<string, number> = {};
for (const c of courses) {
  const r = insertCourse.run(c.level, c.title, c.description, c.color);
  courseIds[c.level] = r.lastInsertRowid as number;
}

// ===== Units & Lessons =====
const unitData: Record<string, [string, string[]][]> = {
  A1: [
    ['Greetings 问候', ['Hello & Goodbye', 'Introducing Yourself', 'Numbers 1-20']],
    ['Daily Life 日常生活', ['Family Members', 'Daily Routine', 'Food & Drinks']],
    ['Basic Grammar 基础语法', ['Verb To Be', 'Articles A/An/The', 'Plural Nouns']],
  ],
  A2: [
    ['Travel 旅行', ['At the Airport', 'Asking for Directions', 'At the Hotel']],
    ['Work & Study 工作学习', ['Job Interviews', 'In the Classroom', 'Making Plans']],
    ['Grammar Focus 语法聚焦', ['Present Simple vs Continuous', 'Past Simple', 'Modal Verbs']],
  ],
  B1: [
    ['Social Life 社交生活', ['Making Friends', 'Hobbies & Interests', 'Describing People']],
    ['News & Media 新闻媒体', ['Reading News', 'Watching Movies', 'Social Media']],
    ['Grammar Focus 语法聚焦', ['Present Perfect', 'Conditionals Type 1&2', 'Reported Speech']],
  ],
  B2: [
    ['Environment 环境', ['Climate Change', 'Sustainable Living', 'Wildlife']],
    ['Technology 科技', ['AI & Future', 'Social Impact', 'Cybersecurity']],
    ['Grammar Focus 语法聚焦', ['Conditionals Type 3', 'Passive Voice', 'Relative Clauses']],
  ],
  C1: [
    ['Business 商务', ['Negotiations', 'Presentations', 'Corporate Culture']],
    ['Literature 文学', ['Poetry Analysis', 'Novel Discussion', 'Critique Writing']],
    ['Grammar Focus 语法聚焦', ['Subjunctive Mood', 'Inversion', 'Cleft Sentences']],
  ],
  C2: [
    ['Philosophy 哲学', ['Ethics Debates', 'Existentialism', 'Eastern Philosophy']],
    ['Culture 文化', ['Cross-cultural Communication', 'Arts & Society', 'Globalization']],
    ['Mastery 精通', ['Idiomatic Expressions', 'Academic Writing', 'Translation']],
  ],
};

const insertUnit = db.prepare('INSERT INTO units (course_id, title, description, sort_order) VALUES (?, ?, ?, ?)');
const insertLesson = db.prepare('INSERT INTO lessons (unit_id, title, description, sort_order) VALUES (?, ?, ?, ?)');

let lessonCount = 0;
for (const [level, units] of Object.entries(unitData)) {
  units.forEach((unit, ui) => {
    const unitTitle = unit[0];
    const lessons = unit[1];
    const ur = insertUnit.run(courseIds[level], unitTitle, `${level} - ${unitTitle}`, ui + 1);
    const unitId = ur.lastInsertRowid as number;
    lessons.forEach((lesson, li) => {
      insertLesson.run(unitId, lesson, `课时：${lesson}`, li + 1);
      lessonCount++;
    });
  });
}

// ===== Vocabulary (100+ words) =====
const vocabData: { word: string; phonetic: string; meaning: string; example: string; level: string }[] = [
  { word: 'hello', phonetic: '/həˈloʊ/', meaning: '你好', example: 'Hello, how are you?', level: 'A1' },
  { word: 'goodbye', phonetic: '/ˌɡʊdˈbaɪ/', meaning: '再见', example: 'Goodbye, see you tomorrow.', level: 'A1' },
  { word: 'thank', phonetic: '/θæŋk/', meaning: '感谢', example: 'Thank you for your help.', level: 'A1' },
  { word: 'please', phonetic: '/pliːz/', meaning: '请', example: 'Please sit down.', level: 'A1' },
  { word: 'family', phonetic: '/ˈfæməli/', meaning: '家庭', example: 'My family is very kind.', level: 'A1' },
  { word: 'friend', phonetic: '/frend/', meaning: '朋友', example: 'She is my best friend.', level: 'A1' },
  { word: 'water', phonetic: '/ˈwɔːtər/', meaning: '水', example: 'Can I have some water?', level: 'A1' },
  { word: 'food', phonetic: '/fuːd/', meaning: '食物', example: 'The food is delicious.', level: 'A1' },
  { word: 'book', phonetic: '/bʊk/', meaning: '书', example: 'I am reading a book.', level: 'A1' },
  { word: 'school', phonetic: '/skuːl/', meaning: '学校', example: 'I go to school every day.', level: 'A1' },
  { word: 'happy', phonetic: '/ˈhæpi/', meaning: '快乐的', example: 'I am happy to see you.', level: 'A1' },
  { word: 'sad', phonetic: '/sæd/', meaning: '悲伤的', example: 'He looks sad today.', level: 'A1' },
  { word: 'big', phonetic: '/bɪɡ/', meaning: '大的', example: 'That is a big house.', level: 'A1' },
  { word: 'small', phonetic: '/smɔːl/', meaning: '小的', example: 'I have a small dog.', level: 'A1' },
  { word: 'morning', phonetic: '/ˈmɔːrnɪŋ/', meaning: '早晨', example: 'Good morning, everyone!', level: 'A1' },
  { word: 'night', phonetic: '/naɪt/', meaning: '夜晚', example: 'Good night, sleep well.', level: 'A1' },
  { word: 'father', phonetic: '/ˈfɑːðər/', meaning: '父亲', example: 'My father is a doctor.', level: 'A1' },
  { word: 'mother', phonetic: '/ˈmʌðər/', meaning: '母亲', example: 'My mother cooks well.', level: 'A1' },
  { word: 'brother', phonetic: '/ˈbrʌðər/', meaning: '兄弟', example: 'I have one brother.', level: 'A1' },
  { word: 'sister', phonetic: '/ˈsɪstər/', meaning: '姐妹', example: 'My sister is older.', level: 'A1' },
  // A2
  { word: 'travel', phonetic: '/ˈtrævl/', meaning: '旅行', example: 'I love to travel abroad.', level: 'A2' },
  { word: 'airport', phonetic: '/ˈerpɔːrt/', meaning: '机场', example: 'The airport is very busy.', level: 'A2' },
  { word: 'hotel', phonetic: '/hoʊˈtel/', meaning: '酒店', example: 'We stayed at a nice hotel.', level: 'A2' },
  { word: 'direction', phonetic: '/dəˈrekʃn/', meaning: '方向', example: 'Can you give me directions?', level: 'A2' },
  { word: 'work', phonetic: '/wɜːrk/', meaning: '工作', example: 'I work in an office.', level: 'A2' },
  { word: 'study', phonetic: '/ˈstʌdi/', meaning: '学习', example: 'I study English every day.', level: 'A2' },
  { word: 'plan', phonetic: '/plæn/', meaning: '计划', example: 'Let us plan the trip.', level: 'A2' },
  { word: 'money', phonetic: '/ˈmʌni/', meaning: '钱', example: 'I need to save money.', level: 'A2' },
  { word: 'weather', phonetic: '/ˈweðər/', meaning: '天气', example: 'The weather is nice today.', level: 'A2' },
  { word: 'city', phonetic: '/ˈsɪti/', meaning: '城市', example: 'Beijing is a big city.', level: 'A2' },
  { word: 'country', phonetic: '/ˈkʌntri/', meaning: '国家', example: 'Which country are you from?', level: 'A2' },
  { word: 'language', phonetic: '/ˈlæŋɡwɪdʒ/', meaning: '语言', example: 'English is a global language.', level: 'A2' },
  { word: 'lesson', phonetic: '/ˈlesn/', meaning: '课程', example: 'The lesson was interesting.', level: 'A2' },
  { word: 'question', phonetic: '/ˈkwestʃən/', meaning: '问题', example: 'Do you have any questions?', level: 'A2' },
  { word: 'answer', phonetic: '/ˈænsər/', meaning: '回答', example: 'Please answer the question.', level: 'A2' },
  // B1
  { word: 'experience', phonetic: '/ɪkˈspɪriəns/', meaning: '经验', example: 'He has a lot of experience.', level: 'B1' },
  { word: 'environment', phonetic: '/ɪnˈvaɪrənmənt/', meaning: '环境', example: 'We must protect the environment.', level: 'B1' },
  { word: 'technology', phonetic: '/tekˈnɑːlədʒi/', meaning: '技术', example: 'Technology changes our lives.', level: 'B1' },
  { word: 'society', phonetic: '/səˈsaɪəti/', meaning: '社会', example: 'Society is changing rapidly.', level: 'B1' },
  { word: 'culture', phonetic: '/ˈkʌltʃər/', meaning: '文化', example: 'I enjoy learning about culture.', level: 'B1' },
  { word: 'opinion', phonetic: '/əˈpɪnjən/', meaning: '观点', example: 'In my opinion, it is great.', level: 'B1' },
  { word: 'decision', phonetic: '/dɪˈsɪʒn/', meaning: '决定', example: 'It is a difficult decision.', level: 'B1' },
  { word: 'opportunity', phonetic: '/ˌɑːpərˈtuːnəti/', meaning: '机会', example: 'This is a great opportunity.', level: 'B1' },
  { word: 'challenge', phonetic: '/ˈtʃælɪndʒ/', meaning: '挑战', example: 'Learning English is a challenge.', level: 'B1' },
  { word: 'success', phonetic: '/səkˈses/', meaning: '成功', example: 'Hard work leads to success.', level: 'B1' },
  { word: 'achieve', phonetic: '/əˈtʃiːv/', meaning: '实现', example: 'You can achieve your dreams.', level: 'B1' },
  { word: 'communicate', phonetic: '/kəˈmjuːnɪkeɪt/', meaning: '交流', example: 'We communicate by email.', level: 'B1' },
  { word: 'develop', phonetic: '/dɪˈveləp/', meaning: '发展', example: 'Children develop quickly.', level: 'B1' },
  { word: 'improve', phonetic: '/ɪmˈpruːv/', meaning: '改善', example: 'I want to improve my English.', level: 'B1' },
  { word: 'consider', phonetic: '/kənˈsɪdər/', meaning: '考虑', example: 'Please consider my suggestion.', level: 'B1' },
  // B2
  { word: 'sustainable', phonetic: '/səˈsteɪnəbl/', meaning: '可持续的', example: 'We need sustainable energy.', level: 'B2' },
  { word: 'consequence', phonetic: '/ˈkɑːnsəkwens/', meaning: '后果', example: 'Every action has consequences.', level: 'B2' },
  { word: 'negotiate', phonetic: '/nɪˈɡoʊʃieɪt/', meaning: '谈判', example: 'They will negotiate the deal.', level: 'B2' },
  { word: 'analyze', phonetic: '/ˈænəlaɪz/', meaning: '分析', example: 'Analyze the data carefully.', level: 'B2' },
  { word: 'strategy', phonetic: '/ˈstrætədʒi/', meaning: '策略', example: 'We need a clear strategy.', level: 'B2' },
  { word: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', meaning: '重要的', example: 'This is a significant change.', level: 'B2' },
  { word: 'perspective', phonetic: '/pərˈspektɪv/', meaning: '观点', example: 'Consider different perspectives.', level: 'B2' },
  { word: 'efficient', phonetic: '/ɪˈfɪʃnt/', meaning: '高效的', example: 'This method is very efficient.', level: 'B2' },
  { word: 'impact', phonetic: '/ˈɪmpækt/', meaning: '影响', example: 'The policy had a huge impact.', level: 'B2' },
  { word: 'contribute', phonetic: '/kənˈtrɪbjuːt/', meaning: '贡献', example: 'Everyone can contribute.', level: 'B2' },
  { word: 'establish', phonetic: '/ɪˈstæblɪʃ/', meaning: '建立', example: 'They established a new company.', level: 'B2' },
  { word: 'maintain', phonetic: '/meɪnˈteɪn/', meaning: '维持', example: 'Maintain a healthy lifestyle.', level: 'B2' },
  { word: 'obvious', phonetic: '/ˈɑːbviəs/', meaning: '明显的', example: 'The answer is obvious.', level: 'B2' },
  { word: 'acquire', phonetic: '/əˈkwaɪər/', meaning: '获得', example: 'Acquire new skills.', level: 'B2' },
  { word: 'comprehensive', phonetic: '/ˌkɑːmprɪˈhensɪv/', meaning: '全面的', example: 'A comprehensive report.', level: 'B2' },
  // C1
  { word: 'profound', phonetic: '/prəˈfaʊnd/', meaning: '深刻的', example: 'A profound understanding.', level: 'C1' },
  { word: 'ambiguous', phonetic: '/æmˈbɪɡjuəs/', meaning: '模糊的', example: 'The statement is ambiguous.', level: 'C1' },
  { word: 'subtle', phonetic: '/ˈsʌtl/', meaning: '微妙的', example: 'There is a subtle difference.', level: 'C1' },
  { word: 'articulate', phonetic: '/ɑːrˈtɪkjuleɪt/', meaning: '清晰表达', example: 'She can articulate her ideas.', level: 'C1' },
  { word: 'compromise', phonetic: '/ˈkɑːmprəmaɪz/', meaning: '妥协', example: 'We reached a compromise.', level: 'C1' },
  { word: 'deteriorate', phonetic: '/dɪˈtɪriəreɪt/', meaning: '恶化', example: 'His health deteriorated.', level: 'C1' },
  { word: 'fluctuate', phonetic: '/ˈflʌktʃueɪt/', meaning: '波动', example: 'Prices fluctuate daily.', level: 'C1' },
  { word: 'inevitable', phonetic: '/ɪnˈevɪtəbl/', meaning: '不可避免的', example: 'Change is inevitable.', level: 'C1' },
  { word: 'predominant', phonetic: '/prɪˈdɑːmɪnənt/', meaning: '主要的', example: 'The predominant language.', level: 'C1' },
  { word: 'scrutinize', phonetic: '/ˈskruːtənaɪz/', meaning: '仔细检查', example: 'Scrutinize the contract.', level: 'C1' },
  { word: 'unprecedented', phonetic: '/ʌnˈpresɪdentɪd/', meaning: '前所未有的', example: 'An unprecedented event.', level: 'C1' },
  { word: 'viable', phonetic: '/ˈvaɪəbl/', meaning: '可行的', example: 'A viable solution.', level: 'C1' },
  // C2
  { word: 'eloquent', phonetic: '/ˈeləkwənt/', meaning: '雄辩的', example: 'An eloquent speech.', level: 'C2' },
  { word: 'paradigm', phonetic: '/ˈpærədaɪm/', meaning: '范式', example: 'A paradigm shift.', level: 'C2' },
  { word: 'quintessential', phonetic: '/ˌkwɪntɪˈsenʃl/', meaning: '典型的', example: 'The quintessential Englishman.', level: 'C2' },
  { word: 'ubiquitous', phonetic: '/juːˈbɪkwɪtəs/', meaning: '无处不在的', example: 'Smartphones are ubiquitous.', level: 'C2' },
  { word: 'serendipity', phonetic: '/ˌserənˈdɪpəti/', meaning: '机缘巧合', example: 'A moment of serendipity.', level: 'C2' },
  { word: 'ephemeral', phonetic: '/ɪˈfemərəl/', meaning: '短暂的', example: 'Ephemeral beauty.', level: 'C2' },
  { word: 'meticulous', phonetic: '/məˈtɪkjələs/', meaning: '一丝不苟的', example: 'Meticulous attention to detail.', level: 'C2' },
  { word: 'pragmatic', phonetic: '/præɡˈmætɪk/', meaning: '务实的', example: 'A pragmatic approach.', level: 'C2' },
  { word: 'resilient', phonetic: '/rɪˈzɪliənt/', meaning: '有韧性的', example: 'A resilient community.', level: 'C2' },
  { word: 'nuance', phonetic: '/ˈnuːɑːns/', meaning: '细微差别', example: 'Understand the nuances.', level: 'C2' },
];

const insertVocab = db.prepare('INSERT INTO vocabulary (word, phonetic, meaning, example, level) VALUES (?, ?, ?, ?, ?)');
for (const v of vocabData) {
  insertVocab.run(v.word, v.phonetic, v.meaning, v.example, v.level);
}

// ===== Grammar Questions (30+) =====
const grammarData = [
  { level: 'A1', type: 'choice', question: 'She ___ a teacher.', options: ['am', 'is', 'are', 'be'], answer: 'is', explanation: '第三人称单数用 is' },
  { level: 'A1', type: 'choice', question: 'I have ___ apple.', options: ['a', 'an', 'the', '/'], answer: 'an', explanation: 'apple 以元音开头，用 an' },
  { level: 'A1', type: 'fill', question: 'There ___ two books on the desk.', answer: 'are', explanation: 'two books 是复数，用 are' },
  { level: 'A1', type: 'choice', question: 'My brother ___ football every day.', options: ['play', 'plays', 'playing', 'played'], answer: 'plays', explanation: '第三人称单数一般现在时加 s' },
  { level: 'A1', type: 'fill', question: 'What ___ your name?', answer: 'is', explanation: 'your name 是单数，用 is' },
  { level: 'A1', type: 'choice', question: '___ you like coffee?', options: ['Do', 'Does', 'Are', 'Is'], answer: 'Do', explanation: '第二人称用 Do' },
  { level: 'A2', type: 'choice', question: 'I ___ to Paris last summer.', options: ['go', 'goes', 'went', 'going'], answer: 'went', explanation: 'last summer 表示过去，用过去式 went' },
  { level: 'A2', type: 'fill', question: 'She is ___ a book now.', answer: 'reading', explanation: 'now 表示现在进行时，be + doing' },
  { level: 'A2', type: 'choice', question: 'You ___ eat more vegetables.', options: ['should', 'would', 'can', 'may'], answer: 'should', explanation: 'should 表示建议' },
  { level: 'A2', type: 'fill', question: 'He ___ (not/like) spicy food.', answer: "doesn't like", explanation: '第三人称单数否定用 doesn\'t + 动词原形' },
  { level: 'A2', type: 'choice', question: 'There ___ a lot of water in the glass.', options: ['is', 'are', 'have', 'has'], answer: 'is', explanation: 'water 不可数，用 is' },
  { level: 'B1', type: 'choice', question: 'I have ___ finished my homework.', options: ['already', 'yet', 'still', 'ever'], answer: 'already', explanation: '肯定句中用 already' },
  { level: 'B1', type: 'fill', question: 'If it rains, we ___ stay at home.', answer: 'will', explanation: '第一条件句：if + 现在时, will + 动词原形' },
  { level: 'B1', type: 'choice', question: 'She said she ___ tired.', options: ['is', 'was', 'will be', 'be'], answer: 'was', explanation: '间接引语中时态后退，is → was' },
  { level: 'B1', type: 'fill', question: 'I have lived here ___ 2010.', answer: 'since', explanation: 'since 接时间点，for 接时间段' },
  { level: 'B1', type: 'choice', question: 'This is the man ___ helped me.', options: ['who', 'which', 'whom', 'whose'], answer: 'who', explanation: '先行词是人且作主语用 who' },
  { level: 'B2', type: 'choice', question: 'If I ___ rich, I would travel the world.', options: ['am', 'was', 'were', 'be'], answer: 'were', explanation: '第二条件句中 be 动词用 were' },
  { level: 'B2', type: 'fill', question: 'The book ___ (write) by Hemingway.', answer: 'was written', explanation: '被动语态：be + 过去分词' },
  { level: 'B2', type: 'choice', question: 'I wish I ___ more time.', options: ['have', 'had', 'will have', 'having'], answer: 'had', explanation: 'wish 后用过去式表虚拟' },
  { level: 'B2', type: 'fill', question: 'Not only ___ she smart, but also kind.', answer: 'is', explanation: 'Not only 置于句首需倒装' },
  { level: 'B2', type: 'choice', question: 'The reason ___ he left is unclear.', options: ['why', 'which', 'that', 'where'], answer: 'why', explanation: 'reason 后用 why 引导定语从句' },
  { level: 'C1', type: 'choice', question: 'Had I known, I ___ have come earlier.', options: ['would', 'will', 'should', 'could'], answer: 'would', explanation: '第三条件句倒装：Had + 主语 + 过去分词, would have done' },
  { level: 'C1', type: 'fill', question: 'It was John ___ broke the window.', answer: 'who/that', explanation: '强调句 It is/was + 被强调部分 + who/that' },
  { level: 'C1', type: 'choice', question: '___ no circumstances should you open this door.', options: ['In', 'Under', 'On', 'At'], answer: 'Under', explanation: '固定搭配 under no circumstances' },
  { level: 'C1', type: 'fill', question: 'Should you need help, ___ me know.', answer: 'let', explanation: '条件句倒装 Should + 主语 + 动词原形' },
  { level: 'C2', type: 'choice', question: '___ the fact that it was raining, we went out.', options: ['Despite', 'Although', 'However', 'In spite'], answer: 'Despite', explanation: 'despite + 名词短语' },
  { level: 'C2', type: 'fill', question: 'Rarely ___ I seen such beauty.', answer: 'have', explanation: '否定副词置于句首需部分倒装' },
  { level: 'C2', type: 'choice', question: 'He is ___ intelligent that everyone admires him.', options: ['so', 'such', 'too', 'very'], answer: 'so', explanation: 'so + 形容词 + that 从句' },
  { level: 'C2', type: 'fill', question: 'Not until he left ___ I realize how much I missed him.', answer: 'did', explanation: 'Not until 置于句首需倒装' },
  { level: 'C2', type: 'choice', question: 'She acted as if she ___ the queen.', options: ['is', 'was', 'were', 'be'], answer: 'were', explanation: 'as if 后用虚拟语气 were' },
];

const insertGrammar = db.prepare('INSERT INTO grammar_questions (level, type, question, options, answer, explanation) VALUES (?, ?, ?, ?, ?, ?)');
for (const g of grammarData) {
  insertGrammar.run(g.level, g.type, g.question, g.options ? JSON.stringify(g.options) : null, g.answer, g.explanation);
}

// ===== Listening Questions (15+) =====
const listeningData = [
  { level: 'A1', audio_text: 'Hello, my name is Tom. I am from England.', question: 'Where is Tom from?', options: ['America', 'England', 'Canada', 'Australia'], answer: 'England', explanation: '原文：I am from England.' },
  { level: 'A1', audio_text: 'I have two sisters and one brother.', question: 'How many brothers does the speaker have?', options: ['One', 'Two', 'Three', 'Four'], answer: 'One', explanation: '原文：one brother' },
  { level: 'A1', audio_text: 'The weather is sunny and warm today.', question: 'How is the weather?', options: ['Rainy', 'Cold', 'Sunny and warm', 'Snowy'], answer: 'Sunny and warm', explanation: '原文：sunny and warm' },
  { level: 'A1', audio_text: 'My favorite food is pizza.', question: 'What is the speaker\'s favorite food?', options: ['Burger', 'Pizza', 'Pasta', 'Salad'], answer: 'Pizza', explanation: '原文：My favorite food is pizza.' },
  { level: 'A1', audio_text: 'I go to school at eight o\'clock.', question: 'What time does the speaker go to school?', options: ['7:00', '8:00', '9:00', '10:00'], answer: '8:00', explanation: '原文：at eight o\'clock' },
  { level: 'A2', audio_text: 'Last weekend, I traveled to Paris with my family. We visited the Eiffel Tower.', question: 'Where did the speaker travel?', options: ['London', 'Paris', 'Berlin', 'Rome'], answer: 'Paris', explanation: '原文：I traveled to Paris' },
  { level: 'A2', audio_text: 'I work as a software engineer at a tech company.', question: 'What is the speaker\'s job?', options: ['Teacher', 'Doctor', 'Software engineer', 'Lawyer'], answer: 'Software engineer', explanation: '原文：I work as a software engineer' },
  { level: 'A2', audio_text: 'Could you please tell me how to get to the train station?', question: 'Where does the speaker want to go?', options: ['Airport', 'Train station', 'Bus stop', 'Hotel'], answer: 'Train station', explanation: '原文：get to the train station' },
  { level: 'A2', audio_text: 'I usually get up at seven and have breakfast at half past seven.', question: 'When does the speaker have breakfast?', options: ['7:00', '7:30', '8:00', '8:30'], answer: '7:30', explanation: '原文：at half past seven' },
  { level: 'A2', audio_text: 'It is going to rain tomorrow, so bring an umbrella.', question: 'What should you bring tomorrow?', options: ['Sunglasses', 'Umbrella', 'Coat', 'Hat'], answer: 'Umbrella', explanation: '原文：bring an umbrella' },
  { level: 'B1', audio_text: 'In my opinion, technology has both positive and negative impacts on our daily lives.', question: 'What does the speaker think about technology?', options: ['Only positive', 'Only negative', 'Both positive and negative', 'No impact'], answer: 'Both positive and negative', explanation: '原文：both positive and negative impacts' },
  { level: 'B1', audio_text: 'I decided to study English because it opens doors to many opportunities.', question: 'Why does the speaker study English?', options: ['For fun', 'For opportunities', 'For travel', 'For friends'], answer: 'For opportunities', explanation: '原文：opens doors to many opportunities' },
  { level: 'B2', audio_text: 'Despite the economic challenges, the company managed to achieve sustainable growth this year.', question: 'How did the company perform?', options: ['Failed completely', 'Achieved sustainable growth', 'No change', 'Went bankrupt'], answer: 'Achieved sustainable growth', explanation: '原文：managed to achieve sustainable growth' },
  { level: 'B2', audio_text: 'The government implemented new policies to reduce carbon emissions by twenty percent.', question: 'What is the emission reduction target?', options: ['10%', '20%', '30%', '50%'], answer: '20%', explanation: '原文：by twenty percent' },
  { level: 'C1', audio_text: 'The paradigm shift in education has prompted educators to reconsider traditional teaching methodologies.', question: 'What has changed in education?', options: ['Nothing', 'A paradigm shift', 'More exams', 'Fewer students'], answer: 'A paradigm shift', explanation: '原文：The paradigm shift in education' },
];

const insertListening = db.prepare('INSERT INTO listening_questions (level, audio_text, question, options, answer, explanation) VALUES (?, ?, ?, ?, ?, ?)');
for (const l of listeningData) {
  insertListening.run(l.level, l.audio_text, l.question, l.options ? JSON.stringify(l.options) : null, l.answer, l.explanation);
}

// ===== Speaking Sentences =====
const speakingData = [
  { level: 'A1', sentence: 'Hello, how are you today?', translation: '你好，你今天怎么样？' },
  { level: 'A1', sentence: 'My name is Tom and I am from England.', translation: '我叫汤姆，来自英国。' },
  { level: 'A1', sentence: 'I love learning English every day.', translation: '我喜欢每天学英语。' },
  { level: 'A2', sentence: 'Could you please help me find the train station?', translation: '请问你能帮我找到火车站吗？' },
  { level: 'A2', sentence: 'I would like to order a cup of coffee, please.', translation: '我想点一杯咖啡，谢谢。' },
  { level: 'A2', sentence: 'What do you usually do on weekends?', translation: '你周末通常做什么？' },
  { level: 'B1', sentence: 'In my opinion, learning a foreign language is very rewarding.', translation: '在我看来，学习外语非常有意义。' },
  { level: 'B1', sentence: 'I have been studying English for three years now.', translation: '我学英语已经三年了。' },
  { level: 'B2', sentence: 'Despite the challenges, we managed to complete the project on time.', translation: '尽管有挑战，我们还是按时完成了项目。' },
  { level: 'B2', sentence: 'The company decided to invest in renewable energy sources.', translation: '公司决定投资可再生能源。' },
  { level: 'C1', sentence: 'A profound understanding of culture is essential for effective communication.', translation: '深刻理解文化对于有效沟通至关重要。' },
  { level: 'C1', sentence: 'The unprecedented changes in technology have transformed our lives.', translation: '技术上前所未有的变革改变了我们的生活。' },
  { level: 'C2', sentence: 'The quintessential English gentleman is known for his eloquent speech.', translation: '典型的英国绅士以其雄辩的口才而闻名。' },
  { level: 'C2', sentence: 'Meticulous attention to detail is the hallmark of a true professional.', translation: '对细节的一丝不苟是真正专业人士的标志。' },
];

const insertSpeaking = db.prepare('INSERT INTO speaking_sentences (level, sentence, translation) VALUES (?, ?, ?)');
for (const s of speakingData) {
  insertSpeaking.run(s.level, s.sentence, s.translation);
}

// ===== Badges =====
const badgeData = [
  { name: '初学者', description: '完成你的第一节课', icon: '🌱', condition_type: 'completed_lessons', condition_value: 1, points: 50 },
  { name: '勤奋学徒', description: '完成 5 节课', icon: '📚', condition_type: 'completed_lessons', condition_value: 5, points: 100 },
  { name: '学习达人', description: '完成 10 节课', icon: '🎓', condition_type: 'completed_lessons', condition_value: 10, points: 200 },
  { name: '词汇大师', description: '答对 50 道题', icon: '🏆', condition_type: 'correct_answers', condition_value: 50, points: 150 },
  { name: '知识渊博', description: '答对 100 道题', icon: '📖', condition_type: 'correct_answers', condition_value: 100, points: 300 },
  { name: '积分新星', description: '获得 500 积分', icon: '⭐', condition_type: 'points', condition_value: 500, points: 0 },
  { name: '积分达人', description: '获得 1000 积分', icon: '🌟', condition_type: 'points', condition_value: 1000, points: 0 },
  { name: '学霸', description: '完成 20 节课', icon: '👑', condition_type: 'completed_lessons', condition_value: 20, points: 500 },
];

const insertBadge = db.prepare('INSERT INTO badges (name, description, icon, condition_type, condition_value, points) VALUES (?, ?, ?, ?, ?, ?)');
for (const b of badgeData) {
  insertBadge.run(b.name, b.description, b.icon, b.condition_type, b.condition_value, b.points);
}

// ===== Sample Posts =====
const postData = [
  { title: '如何高效背单词？', content: '大家好，我是新手，请问有什么背单词的好方法吗？感觉总是记了又忘。', category: 'learning-tips' },
  { title: '推荐几本英文原著', content: '想开始读英文原著，有没有适合 B1 水平的书籍推荐？', category: 'resources' },
  { title: '口语练习打卡', content: '今天练习了 10 分钟口语，感觉发音进步了！大家一起加油！', category: 'general' },
  { title: '语法问题请教', content: '现在完成时和一般过去时到底怎么区分？总是搞混。', category: 'grammar' },
];

const insertPost = db.prepare('INSERT INTO posts (user_id, title, content, category) VALUES (?, ?, ?, ?)');
// Use a placeholder user id 1 (will be created by seed user or just insert for demo)
// First create a demo user
const demoUserExists = db.prepare('SELECT id FROM users WHERE username = ?').get('demo');
if (!demoUserExists) {
  const bcrypt = require('bcryptjs');
  const hashed = bcrypt.hashSync('demo123', 10);
  db.prepare('INSERT INTO users (username, email, password, level, points) VALUES (?, ?, ?, ?, ?)').run('demo', 'demo@linguaflow.com', hashed, 'A1', 320);
}
const demoUser = db.prepare('SELECT id FROM users WHERE username = ?').get('demo') as any;
for (const p of postData) {
  insertPost.run(demoUser.id, p.title, p.content, p.category);
}

// Add some likes to demo posts
const demoPosts = db.prepare('SELECT id FROM posts').all() as any[];
if (demoPosts[0]) db.prepare('UPDATE posts SET likes = 5 WHERE id = ?').run(demoPosts[0].id);
if (demoPosts[1]) db.prepare('UPDATE posts SET likes = 3 WHERE id = ?').run(demoPosts[1].id);

console.log('✅ Seed data created successfully!');
console.log(`  Courses: 6 levels`);
console.log(`  Lessons: ${lessonCount}`);
console.log(`  Vocabulary: ${vocabData.length} words`);
console.log(`  Grammar questions: ${grammarData.length}`);
console.log(`  Listening questions: ${listeningData.length}`);
console.log(`  Speaking sentences: ${speakingData.length}`);
console.log(`  Badges: ${badgeData.length}`);
console.log(`  Demo user: demo / demo123`);
}

// 直接运行脚本时执行完整重置+种子
if (require.main === module) {
  seedDatabase(true);
}
