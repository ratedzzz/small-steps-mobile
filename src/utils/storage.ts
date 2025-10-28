// src/utils/storage.ts

import * as SQLite from 'expo-sqlite';

let db: any | null = null;

/** Open or reuse SQLite DB connection */
export function getDB() {
  if (db) return db;

  if (
    'openDatabaseSync' in SQLite &&
    typeof (SQLite as any).openDatabaseSync === 'function'
  ) {
    db = (SQLite as any).openDatabaseSync('smallsteps.db');
  } else if (
    'openDatabase' in SQLite &&
    typeof (SQLite as any).openDatabase === 'function'
  ) {
    db = (SQLite as any).openDatabase('smallsteps.db');
  } else {
    throw new Error('expo-sqlite is not available: could not open database');
  }

  return db!;
}

/** Create tables if not exist */
export function initSchema() {
  const database = getDB();

  database.transaction((tx: any) => {
    // Habits
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        reminderTime TEXT
      );`
    );

    // Goals
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        color TEXT,
        dueDate TEXT
      );`
    );

    // Journal
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS journal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        text TEXT
      );`
    );
  });
}

/* -----------------------------
   HABITS HELPERS
------------------------------*/

export function insertHabit(habit: {
  id: string;
  name: string;
  color?: string;
  reminderTime?: string;
}) {
  return new Promise<void>((resolve, reject) => {
    const db = getDB();
    db.transaction((tx: any) => {
      tx.executeSql(
        `INSERT INTO habits (id, name, color, reminderTime) VALUES (?, ?, ?, ?);`,
        [habit.id, habit.name, habit.color || null, habit.reminderTime || null],
        () => resolve(),
        (_: any, err: any) => reject(err)
      );
    });
  });
}

export function getAllHabits(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT * FROM habits ORDER BY name ASC;`,
        [],
        (_: any, { rows }: any) => resolve(rows._array || []),
        (_: any, err: any) => reject(err)
      );
    });
  });
}

export function deleteHabit(id: string) {
  return new Promise<void>((resolve, reject) => {
    const db = getDB();
    db.transaction((tx: any) => {
      tx.executeSql(
        `DELETE FROM habits WHERE id = ?;`,
        [id],
        () => resolve(),
        (_: any, err: any) => reject(err)
      );
    });
  });
}

/* -----------------------------
   GOALS HELPERS
------------------------------*/

export function insertGoal(goal: {
  id: string;
  title: string;
  color?: string;
  dueDate?: string;
}) {
  return new Promise<void>((resolve, reject) => {
    const db = getDB();
    db.transaction((tx: any) => {
      tx.executeSql(
        `INSERT INTO goals (id, title, color, dueDate) VALUES (?, ?, ?, ?);`,
        [goal.id, goal.title, goal.color || null, goal.dueDate || null],
        () => resolve(),
        (_: any, err: any) => reject(err)
      );
    });
  });
}

export function getAllGoals(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT * FROM goals ORDER BY title ASC;`,
        [],
        (_: any, { rows }: any) => resolve(rows._array || []),
        (_: any, err: any) => reject(err)
      );
    });
  });
}

export function deleteGoal(id: string) {
  return new Promise<void>((resolve, reject) => {
    const db = getDB();
    db.transaction((tx: any) => {
      tx.executeSql(
        `DELETE FROM goals WHERE id = ?;`,
        [id],
        () => resolve(),
        (_: any, err: any) => reject(err)
      );
    });
  });
}

/* -----------------------------
   JOURNAL HELPERS (optional expansion later)
------------------------------*/
// we can add insertJournalEntry/getEntries/etc later if we want

/* -----------------------------
   EXPORT / ERASE HELPERS
------------------------------*/

/**
 * exportJson()
 * Read all current data so Settings can let the user "export my data".
 * This returns habits, goals, and later we can include journal entries.
 */
export async function exportJson() {
  const [habits, goals] = await Promise.all([getAllHabits(), getAllGoals()]);
  return {
    habits,
    goals,
    // journal: [] // add later if we also persist journal in SQLite
  };
}

/**
 * eraseAll()
 * Wipe all app data from SQLite. We'll call this from Settings.
 * NOTE: After calling this, you'll also want to clear Zustand state in-memory.
 */
export function eraseAll() {
  return new Promise<void>((resolve, reject) => {
    const db = getDB();
    db.transaction((tx: any) => {
      tx.executeSql(`DELETE FROM habits;`);
      tx.executeSql(`DELETE FROM goals;`);
      tx.executeSql(`DELETE FROM journal;`);

      // If you later add tables like 'progress' etc, wipe them here too.

      // On success, resolve after transaction completes
    },
    (err: any) => {
      reject(err);
    },
    () => {
      resolve();
    });
  });
}
