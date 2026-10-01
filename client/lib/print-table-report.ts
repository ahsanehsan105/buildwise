export type PrintTableReport = {
  title: string
  description: string
  headers: string[]
  rows: Array<Array<string | number>>
  emptyMessage?: string
  total?: { label: string; value: string }
}

export function printTableReport(report: PrintTableReport) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return false

  const printDocument = printWindow.document
  printDocument.title = report.title

  const styles = printDocument.createElement('style')
  styles.textContent = `
    @page { size: A4 landscape; margin: 14mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #1b2924; font-family: Arial, sans-serif; font-size: 12px; }
    .report-header { margin-bottom: 22px; border-bottom: 2px solid #173c35; padding-bottom: 14px; }
    .brand { color: #173c35; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    h1 { margin: 10px 0 4px; color: #173c35; font-size: 24px; }
    .description, .generated { color: #65736c; font-size: 11px; }
    .generated { margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #edf2ed; color: #355047; font-size: 10px; letter-spacing: .4px; text-align: left; text-transform: uppercase; }
    th, td { border: 1px solid #d7dfd8; padding: 9px 10px; vertical-align: top; }
    tbody tr:nth-child(even) { background: #f8faf8; }
    tfoot td { background: #edf2ed; font-weight: 700; }
    .empty { color: #65736c; text-align: center; }
    @media screen { body { padding: 24px; } }
  `
  printDocument.head.append(styles)

  const header = printDocument.createElement('header')
  header.className = 'report-header'
  const brand = printDocument.createElement('div')
  brand.className = 'brand'
  brand.textContent = 'Buildwise · Construction Cost Intelligence'
  const title = printDocument.createElement('h1')
  title.textContent = report.title
  const description = printDocument.createElement('div')
  description.className = 'description'
  description.textContent = report.description
  const generated = printDocument.createElement('div')
  generated.className = 'generated'
  generated.textContent = `Generated ${new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())}`
  header.append(brand, title, description, generated)
  printDocument.body.append(header)

  const table = printDocument.createElement('table')
  const tableHead = printDocument.createElement('thead')
  const headingRow = printDocument.createElement('tr')
  for (const label of report.headers) {
    const cell = printDocument.createElement('th')
    cell.textContent = label
    headingRow.append(cell)
  }
  tableHead.append(headingRow)
  table.append(tableHead)

  const tableBody = printDocument.createElement('tbody')
  if (report.rows.length === 0) {
    const row = printDocument.createElement('tr')
    const cell = printDocument.createElement('td')
    cell.className = 'empty'
    cell.colSpan = report.headers.length
    cell.textContent = report.emptyMessage || 'No records to display.'
    row.append(cell)
    tableBody.append(row)
  } else {
    for (const values of report.rows) {
      const row = printDocument.createElement('tr')
      for (const value of values) {
        const cell = printDocument.createElement('td')
        cell.textContent = String(value)
        row.append(cell)
      }
      tableBody.append(row)
    }
  }
  table.append(tableBody)

  if (report.total) {
    const footer = printDocument.createElement('tfoot')
    const row = printDocument.createElement('tr')
    const label = printDocument.createElement('td')
    label.colSpan = Math.max(1, report.headers.length - 1)
    label.textContent = report.total.label
    const value = printDocument.createElement('td')
    value.textContent = report.total.value
    row.append(label, value)
    footer.append(row)
    table.append(footer)
  }

  printDocument.body.append(table)
  printDocument.close()
  printWindow.addEventListener('afterprint', () => printWindow.close(), { once: true })
  printWindow.setTimeout(() => {
    printWindow.focus()
    printWindow.print()
  }, 200)
  return true
}
