import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null

/**
 * Initialize the SQLite database
 * The database file will be created in the app data directory
 */
export async function initDatabase() {
  if (!db) {
    db = await Database.load('sqlite:app.db')

    // Create companies table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_email TEXT,
        contact_phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create distributors table (used as building blocks for SOLs)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS distributors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create distributor_companies junction table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS distributor_companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        distributor_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        UNIQUE(distributor_id, company_id)
      )
    `)

    // Create SOLs (Sales Organization Levels) table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sols (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        main_distributor_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (main_distributor_id) REFERENCES distributors(id) ON DELETE RESTRICT
      )
    `)

    // Create SOL sub-distributors junction table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sol_sub_distributors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sol_id INTEGER NOT NULL,
        distributor_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sol_id) REFERENCES sols(id) ON DELETE CASCADE,
        FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE,
        UNIQUE(sol_id, distributor_id)
      )
    `)

    // Create SOL targets table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sol_targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sol_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        total_target REAL NOT NULL DEFAULT 0,
        main_target REAL NOT NULL DEFAULT 0,
        sub_target REAL NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sol_id) REFERENCES sols(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        UNIQUE(sol_id, company_id, year, month)
      )
    `)

    // Create sales table with SOL context
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sol_id INTEGER NOT NULL,
        distributor_id INTEGER NOT NULL,
        distributor_type TEXT NOT NULL CHECK(distributor_type IN ('main', 'sub')),
        company_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        bank_details TEXT,
        amount REAL NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sol_id) REFERENCES sols(id) ON DELETE CASCADE,
        FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `)

    // Create personal targets table (overall monthly target)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS personal_targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        target_amount REAL NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(year, month)
      )
    `)

    // Create indexes for better query performance
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_sales_sol_id ON sales(sol_id)`)
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)`)
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_sales_distributor_type ON sales(distributor_type)`)
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_sol_sub_distributors_sol_id ON sol_sub_distributors(sol_id)`)
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_sol_targets_lookup ON sol_targets(sol_id, company_id, year, month)`)
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
