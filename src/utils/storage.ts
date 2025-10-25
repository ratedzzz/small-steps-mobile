// src/utils/storage.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('smallsteps.db');

function runTx<T>(fn: (t: SQLite.SQLTransaction) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (t: SQLite.SQLTransaction) => fn(t),
      (err: unknown) => reject(err),
      // We resolve inside the fn via SELECT callbacks; for CREATE/INSERT it's fine to just resolve here
      () => resolve(undefined as unknown as T)
    );
  });
}

export type HabitRow = {
  id: string;
  name: string;
  color: string;
  reminderTime?: string | null;
};

export type GoalRow = {
  id: string;
  title: string;
  color: string;
  dueDate?: string | null; // YYYY-MM-DD
};

export type EntryRow = {
  id: string;
  date: string; // YYYY-MM-DD
  habitId?: string | null; // null for journal-only
  goalId?: string | null;
  completed?: boolean | null;
  text?: string | null;
};

export type BadgeRow = {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji ok
  unlockedAt?: string | null; // ISO date
};

export async function initDb() {
  await runTx<void>((t) => {
    t.executeSql(
      `CREATE TABLE IF NOT EXISTS habits(
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        reminderTime TEXT
      );`
    );
    t.executeSql(
      `CREATE TABLE IF NOT EXISTS goals(
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        color TEXT NOT NULL,
        dueDate TEXT
      );`
    );
    t.executeSql(
      `CREATE TABLE IF NOT EXISTS entries(
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL,
        habitId TEXT,
        goalId TEXT,
        completed INTEGER,
        text TEXT
      );`
    );
    t.executeSql(
      `CREATE TABLE IF NOT EXISTS badges(
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        unlockedAt TEXT
      );`
    );
  });
}

export async function loadAll() {
  const [habits, goals, entries, badges] = await Promise.all([
    allHabits(),
    allGoals(),
    allEntries(),
    allBadges(),
  ]);
  return { habits, goals, entries, badges };
}

export async function allHabits(): Promise<HabitRow[]> {
  return new Promise((resolve, reject) => {
    db.readTransaction((t: SQLite.SQLTransaction) => {
      t.executeSql(
        'SELECT id, name, color, reminderTime FROM habits;',
        [],
        (_: SQLite.SQLTransaction, { rows }: SQLite.SQLResultSet) =>
          resolve(rows._array as HabitRow[]),
        (_: SQLite.SQLTransaction, err: SQLite.SQLError) => {
          reject(err);
          return false;
        }
      );
    });
  });
}

export async function allGoals(): Promise<GoalRow[]> {
  return new Promise((resolve, reject) => {
    db.readTransaction((t: SQLite.SQLTransaction) => {
      t.executeSql(
        'SELECT id, title, color, dueDate FROM goals;',
        [],
        (_: SQLite.SQLTransaction, { rows }: SQLite.SQLResultSet) =>
          resolve(rows._array as GoalRow[]),
        (_: SQLite.SQLTransaction, err: SQLite.SQLError) => {
          reject(err);
          return false;
        }
      );
    });
  });
}

export async function allEntries(): Promise<EntryRow[]> {
  return new Promise((resolve, reject) => {
    db.readTransaction((t: SQLite.SQLTransaction) => {
      t.executeSql(
        'SELECT id, date, habitId, goalId, completed, text FROM entries;',
        [],
        (_: SQLite.SQLTransaction, { rows }: SQLite.SQLResultSet) => {
          const arr = rows._array.map((r: any) => ({
            ...r,
            completed: r.completed ? true : false,
          })) as EntryRow[];
          resolve(arr);
        },
        (_: SQLite.SQLTransaction, err: SQLite.SQLError) => {
          reject(err);
          return false;
        }
      );
    });
  });
}

export async function allBadges(): Promise<BadgeRow[]> {
  return new Promise((resolve, reject) => {
    db.readTransaction((t: SQLite.SQLTransaction) => {
      t.executeSql(
        'SELECT id, name, description, icon, unlockedAt FROM badges;',
        [],
        (_: SQLite.SQLTransaction, { rows }: SQLite.SQLResultSet) =>
          resolve(rows._array as BadgeRow[]),
        (_: SQLite.SQLTransaction, err: SQLite.SQLError) => {
          reject(err);
          return false;
        }
      );
    });
  });
}

export async function upsertHabit(h: HabitRow) {
  await runTx<void>((t) => {
    t.executeSql(
      `INSERT INTO habits(id, name, color, reminderTime) VALUES(?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, color=excluded.color, reminderTime=excluded.reminderTime;`,
      [h.id, h.name, h.color, h.reminderTime ?? null]
    );
  });
}

export async function removeHabit(id: string) {
  await runTx<void>((t) => {
    t.executeSql('DELETE FROM habits WHERE id = ?;', [id]);
    t.executeSql('DELETE FROM entries WHERE habitId = ?;', [id]);
  });
}

export async function upsertGoal(g: GoalRow) {
  await runTx<void>((t) => {
    t.executeSql(
      `INSERT INTO goals(id, title, color, dueDate) VALUES(?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET title=excluded.title, color=excluded.color, dueDate=excluded.dueDate;`,
      [g.id, g.title, g.color, g.dueDate ?? null]
    );
  });
}

export async function removeGoal(id: string) {
  await runTx<void>((t) => {
    t.executeSql('DELETE FROM goals WHERE id = ?;', [id]);
    t.executeSql('DELETE FROM entries WHERE goalId = ?;', [id]);
  });
}

export async function upsertEntry(e: EntryRow) {
  await runTx<void>((t) => {
    t.executeSql(
      `INSERT INTO entries(id, date, habitId, goalId, completed, text) VALUES(?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET date=excluded.date, habitId=excluded.habitId, goalId=excluded.goalId, completed=excluded.completed, text=excluded.text;`,
      [
        e.id,
        e.date,
        e.habitId ?? null,
        e.goalId ?? null,
        e.completed ? 1 : 0,
        e.text ?? null,
      ]
    );
  });
}

export async function removeEntry(id: string) {
  await runTx<void>((t) => {
    t.executeSql('DELETE FROM entries WHERE id = ?;', [id]);
  });
}

export async function unlockBadge(b: BadgeRow) {
  await runTx<void>((t) => {
    t.executeSql(
      `INSERT INTO badges(id, name, description, icon, unlockedAt) VALUES(?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET unlockedAt=excluded.unlockedAt;`,
      [b.id, b.name, b.description, b.icon, b.unlockedAt ?? null]
    );
  });
}

export async function exportJson(): Promise<string> {
  const data = await loadAll();
  return JSON.stringify(data, null, 2);
}

export async function eraseAll() {
  await runTx<void>((t) => {
    t.executeSql('DELETE FROM entries;');
    t.executeSql('DELETE FROM habits;');
    t.executeSql('DELETE FROM goals;');
    t.executeSql('DELETE FROM badges;');
  });
}