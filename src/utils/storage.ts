import * as SQLite from 'expo-sqlite';

let db: any | null = null;

// Helper: do we have a working sqlite connection object
function hasWorkingDB() {
  return db && typeof db.transaction === 'function';
}

/** Open or reuse SQLite DB connection */
export function getDB() {
  if (db) return db;

  try {
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
      // expo-sqlite not available in this runtime
      db = null;
    }
  } catch (err) {
    console.warn('getDB() failed to open sqlite db:', err);
    db = null;
  }

  return db;
}

/** Create tables if not exist */
export function initSchema() {
  const database = getDB();

  if (!database || typeof database.transaction !== 'function') {
    // We are probably in Expo Go without sqlite native module.
    console.warn(
      '[storage] initSchema skipped: expo-sqlite not available in this environment'
    );
    return;
  }

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
        text TEXT,
        habitId TEXT
      );`
    );
  });
}

/* =============================
   HABITS HELPERS
=============================*/

export function insertHabit(habit: {
  id: string;
  name: string;
  color?: string;
  reminderTime?: string | null;
}) {
  return new Promise<void>((resolve, reject) => {
    const database = getDB();
    if (!database || typeof database.transaction !== 'function') {
      console.warn('[storage] insertHabit skipped (no sqlite)');
      resolve();
      return;
    }

    database.transaction((tx: any) => {
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
    const database = getDB();
    if (!database || typeof database.transaction !== 'function') {
      console.warn('[storage] getAllHabits fallback (no sqlite), returning []');
      resolve([]);
      return;
    }

    database.transaction((tx: any) => {
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
    const database = getDB();
    if (!database || typeof database.transaction !== 'function') {
      console.warn('[storage] deleteHabit skipped (no sqlite)');
      resolve();
      return;
    }

    database.transaction((tx: any) => {
      tx.executeSql(
        `DELETE FROM habits WHERE id = ?;`,
        [id],
        () => resolve(),
        (_: any, err: any) => reject(err)
      );
    });
  });
}

/* =============================
   GOALS HELPERS
=============================*/

export function insertGoal(goal: {
  id: string;
  title: string;
  color?: string;
  dueDate?: string;
}) {
  return new Promise<void>((resolve, reject) => {
    const database = getDB();
    if (!database || typeof database.transaction !== 'function') {
      console.warn('[storage] insertGoal skipped (no sqlite)');
      resolve();
      return;
    }

    database.transaction((tx: any) => {
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
    const database = getDB();
    if (!database || typeof database.transaction !== 'function') {
      console.warn('[storage] getAllGoals fallback (no sqlite), returning []');
      resolve([]);
      return;
    }

    database.transaction((tx: any) => {
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
    const database = getDB();
    if (!database || typeof database.transaction !== 'function') {
      console.warn('[storage] deleteGoal skipped (no sqlite)');
      resolve();
      return;
    }

    database.transaction((tx: any) => {
      tx.executeSql(
        `DELETE FROM goals WHERE id = ?;`,
        [id],
        () => resolve(),
        (_: any, err: any) => reject(err)
      );
    });
  });
}

/* =============================
   JOURNAL HELPERS
=============================*/

export function insertJournalEntry(entry: {
  date: string;
  habitId?: string;
  text?: string;
}) {
  return new Promise<void>((resolve, reject) => {
    const database = getDB();
    if (!database || typeof database.transaction !== 'function') {
      console.warn('[storage] insertJournalEntry skipped (no sqlite)');
      resolve();
      return;
    }

    database.transaction((tx: any) => {
      tx.executeSql(
        `INSERT INTO journal (date, text, habitId) VALUES (?, ?, ?);`,
        [entry.date, entry.text || null, entry.habitId || null],
        () => resolve(),
        (_: any, err: any) => reject(err)
      );
    });
  });
}

export function getAllJournalEntries(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const database = getDB();
    if (!database || typeof database.transaction !== 'function') {
      console.warn('[storage] getAllJournalEntries fallback (no sqlite), returning []');
      resolve([]);
      return;
    }

    database.transaction((tx: any) => {
      tx.executeSql(
        `SELECT id, date, text, habitId FROM journal ORDER BY date DESC;`,
        [],
        (_: any, { rows }: any) => resolve(rows._array || []),
        (_: any, err: any) => reject(err)
      );
    });
  });
}

/* =============================
   EXPORT / ERASE HELPERS
=============================*/

export async function exportJson() {
  const [habits, goals] = await Promise.all([getAllHabits(), getAllGoals()]);
  const journal = await getAllJournalEntries();
  return {
    habits,
    goals,
    journal,
  };
}

export function eraseAll() {
  return new Promise<void>((resolve, reject) => {
    const database = getDB();
    if (!database || typeof database.transaction !== 'function') {
      console.warn('[storage] eraseAll skipped (no sqlite)');
      resolve();
      return;
    }

    database.transaction(
      (tx: any) => {
        tx.executeSql(`DELETE FROM habits;`);
        tx.executeSql(`DELETE FROM goals;`);
        tx.executeSql(`DELETE FROM journal;`);
      },
      (err: any) => {
        reject(err);
      },
      () => {
        resolve();
      }
    );
  });
}
