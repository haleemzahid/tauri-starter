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

    // Create example tables
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

/**
 * Example: Insert a user
 */
export async function insertUser(name: string, email: string) {
  const database = await getDatabase()
  const result = await database.execute(
    'INSERT INTO users (name, email) VALUES ($1, $2)',
    [name, email]
  )
  return result
}

/**
 * Example: Get all users
 */
export async function getUsers() {
  const database = await getDatabase()
  const users = await database.select<
    { id: number; name: string; email: string; created_at: string }[]
  >('SELECT * FROM users ORDER BY created_at DESC')
  return users
}

/**
 * Example: Get user by ID
 */
export async function getUserById(id: number) {
  const database = await getDatabase()
  const users = await database.select<
    { id: number; name: string; email: string; created_at: string }[]
  >('SELECT * FROM users WHERE id = $1', [id])
  return users[0] || null
}

/**
 * Example: Delete user
 */
export async function deleteUser(id: number) {
  const database = await getDatabase()
  const result = await database.execute('DELETE FROM users WHERE id = $1', [id])
  return result
}
