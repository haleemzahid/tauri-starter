import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null

/**
 * Initialize the SQLite database
 * The database file will be created in the app data directory
 */
export async function initDatabase() {
  if (!db) {
    // The path is relative to the app data directory
    db = await Database.load('sqlite:app.db')

    // Create todos table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT NOT NULL DEFAULT 'medium',
        due_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create users table for future use
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }
  return db
}

/**
 * Get the database instance
 */
export async function getDatabase() {
  if (!db) {
    return await initDatabase()
  }
  return db
}
