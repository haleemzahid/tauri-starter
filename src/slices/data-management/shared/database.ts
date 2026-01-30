import { getDatabase } from '@/core/database/client'
import type {
  ExportData,
  CompanyExport,
  DistributorExport,
  DistributorCompanyExport,
  SaleExport,
  DistributorTargetExport,
  PersonalTargetExport,
} from './types'
import { CURRENT_EXPORT_VERSION } from './types'

/**
 * Export all data from the database as JSON
 */
export async function exportAllData(): Promise<ExportData> {
  const db = await getDatabase()

  const [
    companies,
    distributors,
    distributorCompanies,
    sales,
    distributorTargets,
    personalTargets,
  ] = await Promise.all([
    db.select<CompanyExport[]>('SELECT * FROM companies ORDER BY id'),
    db.select<DistributorExport[]>('SELECT * FROM distributors ORDER BY id'),
    db.select<DistributorCompanyExport[]>('SELECT * FROM distributor_companies ORDER BY id'),
    db.select<SaleExport[]>('SELECT * FROM sales ORDER BY id'),
    db.select<DistributorTargetExport[]>('SELECT * FROM distributor_targets ORDER BY id'),
    db.select<PersonalTargetExport[]>('SELECT * FROM personal_targets ORDER BY id'),
  ])

  return {
    version: CURRENT_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      companies,
      distributors,
      distributor_companies: distributorCompanies,
      sales,
      distributor_targets: distributorTargets,
      personal_targets: personalTargets,
    },
  }
}

/**
 * Import data from JSON, replacing all existing data
 */
export async function importAllData(exportData: ExportData): Promise<void> {
  const db = await getDatabase()
  const { data } = exportData

  // Start transaction by disabling foreign keys temporarily
  await db.execute('PRAGMA foreign_keys = OFF')

  try {
    // Clear all tables in reverse dependency order
    await db.execute('DELETE FROM sales')
    await db.execute('DELETE FROM distributor_targets')
    await db.execute('DELETE FROM personal_targets')
    await db.execute('DELETE FROM distributor_companies')
    await db.execute('DELETE FROM distributors')
    await db.execute('DELETE FROM companies')

    // Reset auto-increment counters
    await db.execute("DELETE FROM sqlite_sequence WHERE name IN ('companies', 'distributors', 'distributor_companies', 'sales', 'distributor_targets', 'personal_targets')")

    // Import companies
    for (const company of data.companies) {
      await db.execute(
        `INSERT INTO companies (id, name, contact_email, contact_phone, address, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [company.id, company.name, company.contact_email, company.contact_phone, company.address, company.created_at, company.updated_at]
      )
    }

    // Import distributors
    for (const distributor of data.distributors) {
      await db.execute(
        `INSERT INTO distributors (id, name, city, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [distributor.id, distributor.name, distributor.city, distributor.created_at, distributor.updated_at]
      )
    }

    // Import distributor_companies
    for (const dc of data.distributor_companies) {
      await db.execute(
        `INSERT INTO distributor_companies (id, distributor_id, company_id, created_at)
         VALUES (?, ?, ?, ?)`,
        [dc.id, dc.distributor_id, dc.company_id, dc.created_at]
      )
    }

    // Import sales
    for (const sale of data.sales) {
      await db.execute(
        `INSERT INTO sales (id, distributor_id, company_id, date, note, bank_details, amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sale.id, sale.distributor_id, sale.company_id, sale.date, sale.note, sale.bank_details, sale.amount, sale.created_at, sale.updated_at]
      )
    }

    // Import distributor_targets
    for (const target of data.distributor_targets) {
      await db.execute(
        `INSERT INTO distributor_targets (id, distributor_id, company_id, year, month, target_amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [target.id, target.distributor_id, target.company_id, target.year, target.month, target.target_amount, target.created_at, target.updated_at]
      )
    }

    // Import personal_targets
    for (const target of data.personal_targets) {
      await db.execute(
        `INSERT INTO personal_targets (id, year, month, target_amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [target.id, target.year, target.month, target.target_amount, target.created_at, target.updated_at]
      )
    }

  } finally {
    // Re-enable foreign keys
    await db.execute('PRAGMA foreign_keys = ON')
  }
}

/**
 * Validate import data structure
 */
export function validateImportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') return false

  const obj = data as Record<string, unknown>

  if (typeof obj.version !== 'string') return false
  if (typeof obj.exportedAt !== 'string') return false
  if (!obj.data || typeof obj.data !== 'object') return false

  const dataObj = obj.data as Record<string, unknown>

  const requiredArrays = [
    'companies',
    'distributors',
    'distributor_companies',
    'sales',
    'distributor_targets',
    'personal_targets',
  ]

  for (const key of requiredArrays) {
    if (!Array.isArray(dataObj[key])) return false
  }

  return true
}
