/// src/utils/storage.ts

import * as SQLite from 'expo-sqlite';

/**
 * On newer Expo SDKs, expo-sqlite gives you:
 *   - openDatabaseSync(name)
 * On older, it's:
 *   - openDatabase(name)
 *
 * In Expo Go you DO have sqlite, so this should work on-device. We just
 * need to handle both shapes so it doesn't explode at runtime.
 */

// Use a looser type so we can handle both shapes returned by expo-sqlite
// (older openDatabase and newer openDatabaseSync have slightly different shapes).
let db: any | null = null;

export function getDB() {
  if (db) return db;

  // prefer new API if available
  if ('openDatabaseSync' in SQLite && typeof (SQLite as any).openDatabaseSync === 'function') {
    db = (SQLite as any).openDatabaseSync('smallsteps.db');
  } else if ('openDatabase' in SQLite && typeof (SQLite as any).openDatabase === 'function') {
    db = (SQLite as any).openDatabase('smallsteps.db');
  } else {
    // If we ever land here, it means expo-sqlite didn't load right
    // (for example: not installed, bad import, etc.)
    throw new Error('expo-sqlite is not available: could not open database');
  }

  return db!;
}

/**
 * Example helper: run a CREATE TABLE if not exists.
 * You can call this early in SettingsScreen or app startup to ensure tables exist.
 */
export function initSchema() {
  const database = getDB();

  // If the runtime DB object supports transaction, use it so multiple statements
  // run in a single transaction. Otherwise fall back to calling executeSql
  // directly (some API shapes expose executeSql but not transaction).
  if (database && typeof database.transaction === 'function') {
    database.transaction((tx: any) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS habits (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          color TEXT,
          reminderTime TEXT
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS goals (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          targetNumber REAL,
          currentNumber REAL,
          color TEXT
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS journal (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          text TEXT
        );`
      );
    });
  } else if (database && typeof database.executeSql === 'function') {
    // Fallback: call each statement individually
    database.executeSql(
      `CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        reminderTime TEXT
      );`
    );

    database.executeSql(
      `CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        targetNumber REAL,
        currentNumber REAL,
        color TEXT
      );`
    );

    database.executeSql(
      `CREATE TABLE IF NOT EXISTS journal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        text TEXT
      );`
    );
  } else {
    throw new Error('Opened database does not expose transaction or executeSql methods');
  }
}
