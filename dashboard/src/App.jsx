import { useState, useCallback, useMemo } from 'react'
import Papa from 'papaparse'
import { addItem, getTotal, getItemCount, findItem } from './engine'
import { loadItems, saveItems, loadDashboard, saveDashboard, clearDashboard } from './storage'
import {
  analyzeColumns,
  prepareBarData, prepareLineData, preparePieData,
  prepareScatterData, prepareAreaData,
  prepareRadarData, prepareTreemapData, prepareComposedData,
} from './utils/analyzeData'
import FileUpload from './components/FileUpload'
import StatsBar   from './components/StatsBar'
import ChartGrid  from './components/ChartGrid'
import './App.css'

const ALL_CHARTS = [
  { key: 'bar',      label: 'Bar' },
  { key: 'line',     label: 'Line' },
  { key: 'pie',      label: 'Pie' },
  { key: 'scatter',  label: 'Scatter' },
  { key: 'area',     label: 'Distribution' },
  { key: 'radar',    label: 'Radar' },
  { key: 'treemap',  label: 'Treemap' },
  { key: 'composed', label: 'Composed' },
]
const DEFAULT_CHARTS = ['bar', 'line', 'pie', 'scatter', 'area']

function buildCharts(analysis) {
  return {
    bar:      prepareBarData(analysis),
    line:     prepareLineData(analysis),
    pie:      preparePieData(analysis),
    scatter:  prepareScatterData(analysis),
    area:     prepareAreaData(analysis),
    radar:    prepareRadarData(analysis),
    treemap:  prepareTreemapData(analysis),
    composed: prepareComposedData(analysis),
  }
}

function App() {
  const { fileName: savedFileName, dashData: savedDashData } = loadDashboard()
  const [fileName, setFileName]             = useState(savedFileName)
  const [dashData, setDashData]             = useState(savedDashData)
  const [stats, setStats]                   = useState(loadItems)
  const [isDarkMode, setIsDarkMode]         = useState(false)
  const [columnFilter, setColumnFilter]     = useState('')
  const [selectedCharts, setSelectedCharts] = useState(DEFAULT_CHARTS)
  const [dateFilter, setDateFilter]         = useState({ col: '', from: '', to: '' })

  const handleFile = useCallback((file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        const headers = meta.fields || []
        const analysis = analyzeColumns(headers, data)

        let newStats = []
        for (const col of analysis.numericCols) {
          newStats = addItem(newStats, col.name, parseFloat(col.mean.toFixed(2)), col.count)
        }
        saveItems(newStats)
        setStats(newStats)

        const nextDashData = {
          headers,
          rowCount: analysis.rows.length,
          analysis,
          charts: buildCharts(analysis),
        }
        saveDashboard(file.name, nextDashData)
        setFileName(file.name)
        setDashData(nextDashData)
        setSelectedCharts(DEFAULT_CHARTS)

        const firstDateCol = analysis.dateCols?.[0]?.name ?? ''
        setDateFilter({ col: firstDateCol, from: '', to: '' })
      },
    })
  }, [])

  const reset = () => {
    clearDashboard()
    setDashData(null)
    setFileName(null)
    setStats([])
    setSelectedCharts(DEFAULT_CHARTS)
    setDateFilter({ col: '', from: '', to: '' })
  }

  const toggleDarkMode = () => {
    setIsDarkMode((d) => !d)
  }

  const handleExport = () => {
    if (!dashData) return
    const headerLine = dashData.headers.join(',')
    const dataLines = dashData.analysis.rows.map((row) =>
      dashData.headers.map((h) => {
        const val = String(row[h] ?? '')
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
      }).join(',')
    )
    const csv = [headerLine, ...dataLines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (fileName || 'data').replace('.csv', '_export.csv')
    a.click()
    URL.revokeObjectURL(url)
  }

  // Recompute charts from date-filtered rows whenever the filter or data changes
  const filteredCharts = useMemo(() => {
    if (!dashData) return null
    const { col, from, to } = dateFilter
    if (!col || (!from && !to)) return buildCharts(dashData.analysis)
    const fromDate = from ? new Date(from)             : null
    const toDate   = to   ? new Date(to + 'T23:59:59') : null
    const filteredRows = dashData.analysis.rows.filter((row) => {
      const val = new Date(row[col])
      if (isNaN(val.getTime())) return true
      if (fromDate && val < fromDate) return false
      if (toDate   && val > toDate)   return false
      return true
    })
    return buildCharts({ ...dashData.analysis, rows: filteredRows })
  }, [dashData, dateFilter])

  const filteredStats = columnFilter
    ? stats.filter((item) => item.name.toLowerCase().includes(columnFilter.toLowerCase()))
    : stats

  const dateCols = dashData?.analysis?.dateCols ?? []

  const toggleChart = (key) => {
    setSelectedCharts((prev) => {
      if (prev.includes(key)) return prev.length > 1 ? prev.filter((k) => k !== key) : prev
      if (prev.length >= 5) return prev
      return [...prev, key]
    })
  }

  return (
    <div className={`app${isDarkMode ? ' dark' : ''}`}>
      <header className="app-header">
        <div className="header-left">
          <h1>Data Dashboard</h1>
          {fileName && <span className="file-chip">{fileName}</span>}
        </div>
        <div className="header-actions">
          {dashData && (
            <button className="btn-export" onClick={handleExport}>
              Export CSV
            </button>
          )}
          <button className="btn-dark-mode" onClick={toggleDarkMode}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          {dashData && (
            <button className="btn-reset" onClick={reset}>
              Upload New File
            </button>
          )}
        </div>
      </header>

      {!dashData ? (
        <div className="upload-page">
          <FileUpload onFile={handleFile} />
        </div>
      ) : (
        <main className="dashboard">
          <div className="filter-bar">
            <input
              className="column-filter"
              type="text"
              placeholder="Filter columns..."
              value={columnFilter}
              onChange={(e) => setColumnFilter(e.target.value)}
            />
            {dateCols.length > 0 && (
              <div className="date-filter">
                <span className="date-filter-label">Date range:</span>
                {dateCols.length > 1 && (
                  <select
                    className="date-filter-select"
                    value={dateFilter.col}
                    onChange={(e) => setDateFilter((f) => ({ ...f, col: e.target.value }))}
                  >
                    {dateCols.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                )}
                <input
                  type="date"
                  className="date-input"
                  value={dateFilter.from}
                  onChange={(e) => setDateFilter((f) => ({ ...f, from: e.target.value }))}
                />
                <span className="date-separator">–</span>
                <input
                  type="date"
                  className="date-input"
                  value={dateFilter.to}
                  onChange={(e) => setDateFilter((f) => ({ ...f, to: e.target.value }))}
                />
                {(dateFilter.from || dateFilter.to) && (
                  <button
                    className="date-clear-btn"
                    onClick={() => setDateFilter((f) => ({ ...f, from: '', to: '' }))}
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="chart-picker">
            <span className="chart-picker-label">Charts ({selectedCharts.length}/5):</span>
            {ALL_CHARTS.map(({ key, label }) => {
              const on    = selectedCharts.includes(key)
              const maxed = selectedCharts.length >= 5
              return (
                <label
                  key={key}
                  className={`chart-pick-option${on ? ' on' : ''}${!on && maxed ? ' maxed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={!on && maxed}
                    onChange={() => toggleChart(key)}
                  />
                  {label}
                </label>
              )
            })}
          </div>

          <StatsBar
            stats={filteredStats}
            rowCount={dashData.rowCount}
            colCount={dashData.headers.length}
          />
          <ChartGrid charts={filteredCharts} selectedCharts={selectedCharts} />
        </main>
      )}
    </div>
  )
}

export default App
