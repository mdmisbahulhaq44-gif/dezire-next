// Builds a CSV (Excel-friendly, UTF-8 with BOM) and downloads it in the browser.
const esc = v => {
  let s = v === null || v === undefined ? '' : String(v)
  if (/^[=+\-@]/.test(s)) s = "'" + s // stop spreadsheet formula injection
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

export function downloadCsv(filename, headers, rows) {
  const lines = [headers.map(esc).join(',')].concat(rows.map(r => r.map(esc).join(',')))
  const blob = new Blob([String.fromCharCode(0xFEFF) + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const stamp = () => new Date().toISOString().slice(0, 10)
