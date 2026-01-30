import { jsPDF } from 'jspdf'
import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'
import { share } from '@vnidrop/tauri-plugin-share'
import type { MyDashboardData, DistributorDashboardData, MyGrowthData, DistributorGrowthData, Period } from './types'
import { getMonthName, MONTH_NAMES } from '@/slices/targets'

// Helper to create a File object from PDF arraybuffer
function createPDFFile(pdfOutput: ArrayBuffer, fileName: string): File {
  const blob = new Blob([pdfOutput], { type: 'application/pdf' })
  return new File([blob], fileName, { type: 'application/pdf' })
}

function formatPeriodText(period: Period): string {
  if (period.type === 'annual') {
    return `${period.year}`
  }
  if (period.type === 'quarterly') {
    return `Q${period.quarter} ${period.year}`
  }
  return `${MONTH_NAMES[(period.month || 1) - 1]} ${period.year}`
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-PK').format(amount)
}

function generatePDFDocument(data: MyDashboardData, title: string): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(title, pageWidth / 2, 20, { align: 'center' })

  // Summary stats
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  const statsY = 35
  doc.text(`Total Sales: PKR ${formatAmount(data.total)}`, 20, statsY)
  doc.text(`Target: PKR ${formatAmount(data.target)}`, 20, statsY + 7)
  doc.text(`Achievement: ${data.percentage}%`, 20, statsY + 14)

  // Table header
  const tableStartY = 60
  const colX = [15, 30, 100, 145]

  doc.setFillColor(41, 128, 185)
  doc.setTextColor(255, 255, 255)
  doc.rect(14, tableStartY - 6, pageWidth - 28, 10, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Sr No', colX[0], tableStartY)
  doc.text('Distributor Name', colX[1], tableStartY)
  doc.text('City', colX[2], tableStartY)
  doc.text('Amount (PKR)', colX[3], tableStartY)

  // Table rows
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')

  let currentY = tableStartY + 10
  const rowHeight = 8
  const maxY = doc.internal.pageSize.getHeight() - 30

  data.rows.forEach((row, idx) => {
    // Check if we need a new page
    if (currentY > maxY) {
      doc.addPage()
      currentY = 20
    }

    // Alternate row background
    if (idx % 2 === 0) {
      doc.setFillColor(245, 245, 245)
      doc.rect(14, currentY - 5, pageWidth - 28, rowHeight, 'F')
    }

    doc.text(String(idx + 1), colX[0], currentY)
    doc.text(row.distributor_name, colX[1], currentY)
    doc.text(row.city, colX[2], currentY)
    doc.text(formatAmount(row.total_amount), colX[3], currentY)

    currentY += rowHeight
  })

  // Total row
  currentY += 5
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(52, 73, 94)
  doc.setTextColor(255, 255, 255)
  doc.rect(14, currentY - 5, pageWidth - 28, 10, 'F')
  doc.text('Total', colX[2], currentY)
  doc.text(`PKR ${formatAmount(data.total)}`, colX[3], currentY)

  // Footer
  doc.setTextColor(128, 128, 128)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const footerY = doc.internal.pageSize.getHeight() - 10
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY, { align: 'center' })

  return doc
}

export async function exportMyDashboardToPDF(data: MyDashboardData, isAnnual = false) {
  const monthName = getMonthName(data.month)
  const defaultFilename = isAnnual
    ? `Annual_Report_${data.year}.pdf`
    : `My_Dashboard_${monthName}_${data.year}.pdf`
  const title = isAnnual
    ? `Annual Sales Report - ${data.year}`
    : `Sales Report - ${monthName} ${data.year}`

  // Show save dialog
  const filePath = await save({
    defaultPath: defaultFilename,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })

  if (!filePath) {
    // User cancelled
    return
  }

  const doc = generatePDFDocument(data, title)

  // Get PDF as array buffer and write to file
  const pdfOutput = doc.output('arraybuffer')
  await writeFile(filePath, new Uint8Array(pdfOutput))
}

/**
 * Share My Dashboard as PDF via native share dialog
 */
export async function shareMyDashboardPDF(data: MyDashboardData, isAnnual = false) {
  const monthName = getMonthName(data.month)
  const fileName = isAnnual
    ? `Annual_Report_${data.year}.pdf`
    : `My_Dashboard_${monthName}_${data.year}.pdf`
  const title = isAnnual
    ? `Annual Sales Report - ${data.year}`
    : `Sales Report - ${monthName} ${data.year}`

  const doc = generatePDFDocument(data, title)
  const pdfOutput = doc.output('arraybuffer')
  const pdfFile = createPDFFile(pdfOutput, fileName)

  await share({
    title,
    files: [pdfFile],
  })
}

/**
 * Export Distributor Dashboard to PDF
 */
export async function exportDistributorDashboardToPDF(
  data: DistributorDashboardData,
  companyIndex: number,
  isAnnual = false
) {
  const company = data.companies[companyIndex]
  if (!company) return

  const periodText = isAnnual ? `Annual_${data.year}` : `${getMonthName(data.month)}_${data.year}`
  const defaultFilename = `${data.distributor.name}_${company.company_name}_${periodText}.pdf`
  const title = isAnnual
    ? `${data.distributor.name} - ${company.company_name} - Annual ${data.year}`
    : `${data.distributor.name} - ${company.company_name} - ${getMonthName(data.month)} ${data.year}`

  // Show save dialog
  const filePath = await save({
    defaultPath: defaultFilename,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })

  if (!filePath) {
    return
  }

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(title, pageWidth / 2, 20, { align: 'center' })

  // Distributor info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`City: ${data.distributor.city}`, pageWidth / 2, 28, { align: 'center' })

  // Summary stats
  doc.setFontSize(12)
  const statsY = 40
  doc.text(`Total Sales: PKR ${formatAmount(company.total)}`, 20, statsY)
  doc.text(`Target: PKR ${formatAmount(company.target)}`, 20, statsY + 7)
  doc.text(`Achievement: ${company.percentage}%`, 20, statsY + 14)

  // Table header
  const tableStartY = 65
  const colX = [15, 30, 70, 110, 155]

  doc.setFillColor(41, 128, 185)
  doc.setTextColor(255, 255, 255)
  doc.rect(14, tableStartY - 6, pageWidth - 28, 10, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Sr No', colX[0], tableStartY)
  doc.text('Date', colX[1], tableStartY)
  doc.text('Note', colX[2], tableStartY)
  doc.text('Bank Details', colX[3], tableStartY)
  doc.text('Amount (PKR)', colX[4], tableStartY)

  // Table rows
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')

  let currentY = tableStartY + 10
  const rowHeight = 8
  const maxY = doc.internal.pageSize.getHeight() - 30

  company.sales.forEach((sale, idx) => {
    if (currentY > maxY) {
      doc.addPage()
      currentY = 20
    }

    if (idx % 2 === 0) {
      doc.setFillColor(245, 245, 245)
      doc.rect(14, currentY - 5, pageWidth - 28, rowHeight, 'F')
    }

    const saleDate = new Date(sale.date)
    const dateStr = saleDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    doc.text(String(idx + 1), colX[0], currentY)
    doc.text(dateStr, colX[1], currentY)
    doc.text((sale.note || '-').substring(0, 20), colX[2], currentY)
    doc.text((sale.bank_details || '-').substring(0, 20), colX[3], currentY)
    doc.text(formatAmount(sale.amount), colX[4], currentY)

    currentY += rowHeight
  })

  // Total row
  currentY += 5
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(52, 73, 94)
  doc.setTextColor(255, 255, 255)
  doc.rect(14, currentY - 5, pageWidth - 28, 10, 'F')
  doc.text('Total', colX[3], currentY)
  doc.text(`PKR ${formatAmount(company.total)}`, colX[4], currentY)

  // Footer
  doc.setTextColor(128, 128, 128)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const footerY = doc.internal.pageSize.getHeight() - 10
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY, { align: 'center' })

  // Save
  const pdfOutput = doc.output('arraybuffer')
  await writeFile(filePath, new Uint8Array(pdfOutput))
}

/**
 * Share Distributor Dashboard as PDF via native share dialog
 */
export async function shareDistributorDashboardPDF(
  data: DistributorDashboardData,
  companyIndex: number,
  isAnnual = false
) {
  const company = data.companies[companyIndex]
  if (!company) return

  const periodText = isAnnual ? `Annual_${data.year}` : `${getMonthName(data.month)}_${data.year}`
  const fileName = `${data.distributor.name}_${company.company_name}_${periodText}.pdf`
  const title = isAnnual
    ? `${data.distributor.name} - ${company.company_name} - Annual ${data.year}`
    : `${data.distributor.name} - ${company.company_name} - ${getMonthName(data.month)} ${data.year}`

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(title, pageWidth / 2, 20, { align: 'center' })

  // Distributor info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`City: ${data.distributor.city}`, pageWidth / 2, 28, { align: 'center' })

  // Summary stats
  doc.setFontSize(12)
  const statsY = 40
  doc.text(`Total Sales: PKR ${formatAmount(company.total)}`, 20, statsY)
  doc.text(`Target: PKR ${formatAmount(company.target)}`, 20, statsY + 7)
  doc.text(`Achievement: ${company.percentage}%`, 20, statsY + 14)

  // Table header
  const tableStartY = 65
  const colX = [15, 30, 70, 110, 155]

  doc.setFillColor(41, 128, 185)
  doc.setTextColor(255, 255, 255)
  doc.rect(14, tableStartY - 6, pageWidth - 28, 10, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Sr No', colX[0], tableStartY)
  doc.text('Date', colX[1], tableStartY)
  doc.text('Note', colX[2], tableStartY)
  doc.text('Bank Details', colX[3], tableStartY)
  doc.text('Amount (PKR)', colX[4], tableStartY)

  // Table rows
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')

  let currentY = tableStartY + 10
  const rowHeight = 8
  const maxY = doc.internal.pageSize.getHeight() - 30

  company.sales.forEach((sale, idx) => {
    if (currentY > maxY) {
      doc.addPage()
      currentY = 20
    }

    if (idx % 2 === 0) {
      doc.setFillColor(245, 245, 245)
      doc.rect(14, currentY - 5, pageWidth - 28, rowHeight, 'F')
    }

    const saleDate = new Date(sale.date)
    const dateStr = saleDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    doc.text(String(idx + 1), colX[0], currentY)
    doc.text(dateStr, colX[1], currentY)
    doc.text((sale.note || '-').substring(0, 20), colX[2], currentY)
    doc.text((sale.bank_details || '-').substring(0, 20), colX[3], currentY)
    doc.text(formatAmount(sale.amount), colX[4], currentY)

    currentY += rowHeight
  })

  // Total row
  currentY += 5
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(52, 73, 94)
  doc.setTextColor(255, 255, 255)
  doc.rect(14, currentY - 5, pageWidth - 28, 10, 'F')
  doc.text('Total', colX[3], currentY)
  doc.text(`PKR ${formatAmount(company.total)}`, colX[4], currentY)

  // Footer
  doc.setTextColor(128, 128, 128)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const footerY = doc.internal.pageSize.getHeight() - 10
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY, { align: 'center' })

  const pdfOutput = doc.output('arraybuffer')
  const pdfFile = createPDFFile(pdfOutput, fileName)

  await share({
    title,
    files: [pdfFile],
  })
}

/**
 * Export My Growth Comparison to PDF
 */
export async function exportMyGrowthToPDF(data: MyGrowthData) {
  const p1Text = formatPeriodText(data.period1)
  const p2Text = formatPeriodText(data.period2)
  const defaultFilename = `Growth_Comparison_${p1Text}_vs_${p2Text}.pdf`.replace(/\s/g, '_')
  const title = `Growth Comparison: ${p1Text} vs ${p2Text}`

  const filePath = await save({
    defaultPath: defaultFilename,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })

  if (!filePath) return

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(title, pageWidth / 2, 20, { align: 'center' })

  // Summary stats
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const statsY = 35
  doc.text(`${p1Text}: PKR ${formatAmount(data.period1_total)}`, 20, statsY)
  doc.text(`${p2Text}: PKR ${formatAmount(data.period2_total)}`, 20, statsY + 7)
  const growthSign = data.growth_percentage >= 0 ? '+' : ''
  doc.text(`Growth: ${growthSign}${data.growth_percentage}% (${growthSign}PKR ${formatAmount(data.growth_amount)})`, 20, statsY + 14)

  // Table header
  const tableStartY = 60
  const colX = [15, 25, 75, 100, 130, 160]

  doc.setFillColor(41, 128, 185)
  doc.setTextColor(255, 255, 255)
  doc.rect(14, tableStartY - 6, pageWidth - 28, 10, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('No', colX[0], tableStartY)
  doc.text('Distributor', colX[1], tableStartY)
  doc.text('City', colX[2], tableStartY)
  doc.text(p1Text.substring(0, 12), colX[3], tableStartY)
  doc.text(p2Text.substring(0, 12), colX[4], tableStartY)
  doc.text('Growth', colX[5], tableStartY)

  // Table rows
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')

  let currentY = tableStartY + 10
  const rowHeight = 7
  const maxY = doc.internal.pageSize.getHeight() - 30

  data.rows.forEach((row, idx) => {
    if (currentY > maxY) {
      doc.addPage()
      currentY = 20
    }

    if (idx % 2 === 0) {
      doc.setFillColor(245, 245, 245)
      doc.rect(14, currentY - 5, pageWidth - 28, rowHeight, 'F')
    }

    const growthStr = `${row.growth_percentage >= 0 ? '+' : ''}${row.growth_percentage}%`

    doc.text(String(idx + 1), colX[0], currentY)
    doc.text(row.distributor_name.substring(0, 25), colX[1], currentY)
    doc.text(row.city.substring(0, 12), colX[2], currentY)
    doc.text(formatAmount(row.period1_amount), colX[3], currentY)
    doc.text(formatAmount(row.period2_amount), colX[4], currentY)

    // Color code growth
    if (row.growth_percentage > 0) {
      doc.setTextColor(34, 139, 34) // Green
    } else if (row.growth_percentage < 0) {
      doc.setTextColor(220, 20, 60) // Red
    }
    doc.text(growthStr, colX[5], currentY)
    doc.setTextColor(0, 0, 0)

    currentY += rowHeight
  })

  // Total row
  currentY += 5
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(52, 73, 94)
  doc.setTextColor(255, 255, 255)
  doc.rect(14, currentY - 5, pageWidth - 28, 10, 'F')
  doc.text('Total', colX[1], currentY)
  doc.text(formatAmount(data.period1_total), colX[3], currentY)
  doc.text(formatAmount(data.period2_total), colX[4], currentY)
  doc.text(`${growthSign}${data.growth_percentage}%`, colX[5], currentY)

  // Footer
  doc.setTextColor(128, 128, 128)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const footerY = doc.internal.pageSize.getHeight() - 10
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY, { align: 'center' })

  const pdfOutput = doc.output('arraybuffer')
  await writeFile(filePath, new Uint8Array(pdfOutput))
}

/**
 * Export Distributor Growth Comparison to PDF
 */
export async function exportDistributorGrowthToPDF(data: DistributorGrowthData) {
  const p1Text = formatPeriodText(data.period1)
  const p2Text = formatPeriodText(data.period2)
  const defaultFilename = `${data.distributor.name}_Growth_${p1Text}_vs_${p2Text}.pdf`.replace(/\s/g, '_')
  const title = `${data.distributor.name} - Growth Comparison`
  const subtitle = `${p1Text} vs ${p2Text}`

  const filePath = await save({
    defaultPath: defaultFilename,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })

  if (!filePath) return

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(title, pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(subtitle, pageWidth / 2, 28, { align: 'center' })

  // Distributor info
  doc.setFontSize(10)
  doc.text(`City: ${data.distributor.city}`, pageWidth / 2, 35, { align: 'center' })

  // Summary stats
  doc.setFontSize(11)
  const statsY = 45
  doc.text(`${p1Text}: PKR ${formatAmount(data.period1_total)}`, 20, statsY)
  doc.text(`${p2Text}: PKR ${formatAmount(data.period2_total)}`, 20, statsY + 7)
  const growthSign = data.growth_percentage >= 0 ? '+' : ''
  doc.text(`Growth: ${growthSign}${data.growth_percentage}% (${growthSign}PKR ${formatAmount(data.growth_amount)})`, 20, statsY + 14)

  // Table header
  const tableStartY = 70
  const colX = [15, 25, 80, 115, 150]

  doc.setFillColor(41, 128, 185)
  doc.setTextColor(255, 255, 255)
  doc.rect(14, tableStartY - 6, pageWidth - 28, 10, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('No', colX[0], tableStartY)
  doc.text('Company', colX[1], tableStartY)
  doc.text(p1Text.substring(0, 12), colX[2], tableStartY)
  doc.text(p2Text.substring(0, 12), colX[3], tableStartY)
  doc.text('Growth', colX[4], tableStartY)

  // Table rows
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')

  let currentY = tableStartY + 10
  const rowHeight = 8

  data.companies.forEach((company, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(245, 245, 245)
      doc.rect(14, currentY - 5, pageWidth - 28, rowHeight, 'F')
    }

    const growthStr = `${company.growth_percentage >= 0 ? '+' : ''}${company.growth_percentage}%`

    doc.text(String(idx + 1), colX[0], currentY)
    doc.text(company.company_name.substring(0, 30), colX[1], currentY)
    doc.text(formatAmount(company.period1_amount), colX[2], currentY)
    doc.text(formatAmount(company.period2_amount), colX[3], currentY)

    if (company.growth_percentage > 0) {
      doc.setTextColor(34, 139, 34)
    } else if (company.growth_percentage < 0) {
      doc.setTextColor(220, 20, 60)
    }
    doc.text(growthStr, colX[4], currentY)
    doc.setTextColor(0, 0, 0)

    currentY += rowHeight
  })

  // Total row
  currentY += 5
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(52, 73, 94)
  doc.setTextColor(255, 255, 255)
  doc.rect(14, currentY - 5, pageWidth - 28, 10, 'F')
  doc.text('Total', colX[1], currentY)
  doc.text(formatAmount(data.period1_total), colX[2], currentY)
  doc.text(formatAmount(data.period2_total), colX[3], currentY)
  doc.text(`${growthSign}${data.growth_percentage}%`, colX[4], currentY)

  // Footer
  doc.setTextColor(128, 128, 128)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const footerY = doc.internal.pageSize.getHeight() - 10
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY, { align: 'center' })

  const pdfOutput = doc.output('arraybuffer')
  await writeFile(filePath, new Uint8Array(pdfOutput))
}
