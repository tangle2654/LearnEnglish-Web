import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'linguaflow.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      level TEXT DEFAULT 'A1',
      points INTEGER DEFAULT 0,
      avatar TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (unit_id) REFERENCES units(id)
    );

    CREATE TABLE IF NOT EXISTS vocabulary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      phonetic TEXT,
      meaning TEXT NOT NULL,
      example TEXT,
      level TEXT,
      unit_id INTEGER,
      FOREIGN KEY (unit_id) REFERENCES units(id)
    );

    CREATE TABLE IF NOT EXISTS grammar_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id INTEGER,
      level TEXT,
      type TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL,
      explanation TEXT,
      FOREIGN KEY (unit_id) REFERENCES units(id)
    );

    CREATE TABLE IF NOT EXISTS listening_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT,
      audio_text TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL,
      explanation TEXT
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER,
      type TEXT NOT NULL,
      correct INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );

    CREATE TABLE IF NOT EXISTS completed_lessons (
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );

    CREATE TABLE IF NOT EXISTS user_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      word_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (word_id) REFERENCES vocabulary(id),
      UNIQUE(user_id, word_id)
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS likes (
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );

    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      icon TEXT,
      condition_type TEXT NOT NULL,
      condition_value INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      user_id INTEGER NOT NULL,
      badge_id INTEGER NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, badge_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (badge_id) REFERENCES badges(id)
    );

    CREATE TABLE IF NOT EXISTS speaking_sentences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT,
      sentence TEXT NOT NULL,
      translation TEXT
    );
  `);
}
