import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../hooks/useAuth'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

const METRICS = ['weight', 'body_fat', 'biceps', 'chest', 'waist', 'thigh']
const METRIC_LABELS: Record<string, string> = {
  weight: 'Weight',
  body_fat: 'Body Fat %',
  biceps: 'Biceps',
  chest: 'Chest',
  waist: 'Waist',
  thigh: 'Thigh',
}
const METRIC_UNITS: Record<string, string> = {
  weight: 'kg',
  body_fat: '%',
  biceps: 'cm',
  chest: 'cm',
  waist: 'cm',
  thigh: 'cm',
}

function getDateNDaysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function prettyDate(dateStr: string) {
  return dateStr.slice(5, 10) // MM-DD
}

export const Progress: React.FC = () => {
  const { user } = useAuth()

  // Tabs: strength, metrics, prs
  const [tab, setTab] = useState<'strength' | 'metrics' | 'prs'>('strength')

  // Date range toggle (7, 30, 90 days)
  const [range, setRange] = useState<7 | 30 | 90>(30)

  // Data
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([])
  const [progressLogs, setProgressLogs] = useState<any[]>([])
  const [prs, setPRs] = useState<any[]>([])

  // Modal state for adding new metric logs
  const [showMetricModal, setShowMetricModal] = useState(false)
  const [metricType, setMetricType] = useState('weight')
  const [metricValue, setMetricValue] = useState('')

  // Editing state for inline metric edit
  const [editingMetric, setEditingMetric] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  // Fetch all progress logs (metrics) from Supabase
  const fetchAllProgressLogs = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('progress_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
    setProgressLogs(data ?? [])
  }, [user])

  // Fetch exercise logs and PRs in addition
  const fetchAllData = useCallback(async () => {
    if (!user) return

    const { data: exLogs } = await supabase.from('exercise_logs').select('*')
    setExerciseLogs(exLogs ?? [])

    await fetchAllProgressLogs()

    const { data: prLogs } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('personal_record', true)
      .order('created_at', { ascending: false })
    setPRs(prLogs ?? [])
  }, [user, fetchAllProgressLogs])

  // On mount and every time modal opens/closes, get fresh data
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData, showMetricModal])

  // Filter progressLogs by metric type and date range
  function filteredMetricsData(type: string) {
    const cutoff = getDateNDaysAgo(range)
    return (
      (progressLogs ?? [])
        .filter((log) => log.metric_type === type && new Date(log.date) >= cutoff)
        .map((log) => ({
          date: log.date,
          value: log.value,
          id: log.id,
        })) ?? []
    )
  }

  // Group exercise logs by exercise name and filter by range
  const liftNames = Array.from(new Set(exerciseLogs.map((log) => log.exercise_name)))

  function getStrengthData() {
    const result: Record<string, Array<{ date: string; weight: number }>> = {}
    for (const name of liftNames) {
      result[name] = []

      for (const log of exerciseLogs) {
        if (log.exercise_name === name && log.sets && log.sets.length > 0) {
          // Take max weight in the sets for the session
          const maxWeight = Math.max(...log.sets.map((s: any) => Number(s.weight) || 0))
          if (maxWeight > 0 && log.created_at) {
            result[name].push({
              date: log.created_at.slice(0, 10),
              weight: maxWeight,
            })
          }
        }
      }
      // Filter by date range
      result[name] = result[name].filter(({ date }) => new Date(date) >= getDateNDaysAgo(range))
    }
    return result
  }

  // Prepare PRs data table
  function getPRTable() {
    return (prs ?? []).map((pr) => ({
      name: pr.exercise_name,
      date: pr.created_at?.slice(0, 10),
      set: pr.sets?.[0] ?? {},
    }))
  }

  // Checks if user already logged a given metric today
  const hasLoggedToday = (metric: string) => {
    const today = new Date().toISOString().slice(0, 10)
    return progressLogs.some(
      (log) => log.metric_type === metric && log.date === today
    )
  }

  // Handler to add new metric (via modal)
  async function handleAddMetric(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    const today = new Date().toISOString().slice(0, 10)

    // Prevent duplicates for same day (optional)
    if (hasLoggedToday(metricType)) {
      alert(`Already logged ${METRIC_LABELS[metricType]} today!`)
      setShowMetricModal(false)
      setMetricValue('')
      return
    }

    await supabase.from('progress_logs').insert({
      user_id: user.id,
      metric_type: metricType,
      value: parseFloat(metricValue),
      unit: METRIC_UNITS[metricType] || '',
      date: today,
    })

    await fetchAllProgressLogs()
    setShowMetricModal(false)
    setMetricValue('')
  }

  // Handler to update existing metric inline
  async function handleEditMetric(logId: string) {
    if (!user || !logId) return
    if (editingValue.trim() === '') {
      alert('Value cannot be empty')
      return
    }
    await supabase
      .from('progress_logs')
      .update({ value: parseFloat(editingValue) })
      .eq('id', logId)
    await fetchAllProgressLogs()
    setEditingMetric(null)
    setEditingValue('')
  }

  return (
    <div className="min-h-screen pt-16 pb-24 bg-gray-900 text-white flex flex-col">
      {/* Tabs */}
      <div className="flex justify-around border-b border-gray-800 bg-black/60 sticky top-0 z-30">
        <button
          onClick={() => setTab('strength')}
          className={`flex-1 py-3 ${
            tab === 'strength' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'
          }`}
        >
          Strength
        </button>
        <button
          onClick={() => setTab('metrics')}
          className={`flex-1 py-3 ${
            tab === 'metrics' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'
          }`}
        >
          Metrics
        </button>
        <button
          onClick={() => setTab('prs')}
          className={`flex-1 py-3 ${
            tab === 'prs' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'
          }`}
        >
          PRs
        </button>
      </div>

      {/* Range toggle */}
      <div className="flex justify-center mt-2 space-x-3">
        {[7, 30, 90].map((r) => (
          <button
            key={r}
            className={`px-3 py-1 rounded-full border ${
              range === r ? 'bg-orange-500 border-orange-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-300'
            } text-xs`}
            onClick={() => setRange(r as 7 | 30 | 90)}
          >
            {r}d
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-2 pt-2">
        {/* Strength Tab */}
        {tab === 'strength' && (
          <div className="mb-8">
            {Object.keys(getStrengthData()).length === 0 ? (
              <div className="text-center mt-8 text-gray-400">No strength data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart margin={{ left: 0, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
                  <XAxis dataKey="date" tickFormatter={prettyDate} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.entries(getStrengthData()).map(([exercise, data], i) => (
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke={['#FF6B35', '#1AC9A7', '#71BCF7', '#FFD166', '#5D8FFF'][i % 5]}
                      data={data}
                      name={exercise}
                      key={exercise}
                      dot={false}
                      activeDot={{ r: 7 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* Latest PR summaries */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Latest PRs</h3>
              <div className="grid grid-cols-2 gap-3">
                {prs.slice(0, 4).map((pr, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-3 bg-gray-800 border border-gray-700 text-center"
                  >
                    <div className="font-semibold">{pr.exercise_name}</div>
                    <div className="text-xl font-bold text-orange-400">
                      {pr.sets?.[0]?.weight ?? '--'} {pr.sets?.[0]?.unit ?? ''}
                    </div>
                    <div className="text-xs text-gray-400">{pr.created_at?.slice(0, 10)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {tab === 'metrics' && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {METRICS.map((mt) => {
                const metricData = filteredMetricsData(mt)
                const latestLog = progressLogs.find(
                  (l) => l.metric_type === mt && l.date === new Date().toISOString().slice(0, 10)
                )
                const latestValue = metricData.length > 0 ? metricData[metricData.length - 1].value : '--'
                const logId = latestLog?.id

                return (
                  <div
                    key={mt}
                    className="rounded-xl p-4 bg-gray-800 border border-gray-700 flex flex-col items-center"
                  >
                    <div className="text-gray-300 text-sm">{METRIC_LABELS[mt]}</div>

                    {editingMetric === mt ? (
                      <form
                        className="w-full flex flex-col items-center"
                        onSubmit={async (e) => {
                          e.preventDefault()
                          await handleEditMetric(logId)
                        }}
                      >
                        <input
                          className="w-20 text-2xl font-bold rounded bg-gray-900 border border-orange-400 text-white text-center mb-1"
                          type="number"
                          step="any"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="bg-orange-500 px-3 py-1 rounded text-white text-xs"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="bg-gray-700 px-3 py-1 rounded text-gray-300 text-xs"
                            onClick={() => {
                              setEditingMetric(null)
                              setEditingValue('')
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-2xl font-bold text-white flex items-center mt-1">
                        {latestValue}
                        <span className="text-xs text-gray-400 ml-1">{METRIC_UNITS[mt]}</span>
                        {latestValue !== '--' && (
                          <button
                            onClick={() => {
                              setEditingMetric(mt)
                              setEditingValue(latestValue.toString())
                            }}
                            className="ml-2 text-gray-400 hover:text-orange-400"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    )}

                    <ResponsiveContainer width="95%" height={60}>
                      <LineChart>
                        <Line
                          type="monotone"
                          dataKey="value"
                          data={metricData}
                          stroke="#FF6B35"
                          dot={false}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    {/* Hide Add Log button if already logged today */}
                    {!hasLoggedToday(mt) && (
                      <button
                        className="mt-2 text-orange-400 text-xs"
                        onClick={() => {
                          setMetricType(mt)
                          setShowMetricModal(true)
                        }}
                      >
                        + Add Log
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PRs Tab */}
        {tab === 'prs' && (
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="py-1 text-left">Exercise</th>
                  <th className="py-1">Weight</th>
                  <th className="py-1">Reps</th>
                  <th className="py-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {prs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-10">
                      No PRs yet
                    </td>
                  </tr>
                ) : (
                  getPRTable().map((pr, i) => (
                    <tr key={i} className="border-t border-gray-700">
                      <td className="py-1">{pr.name}</td>
                      <td className="py-1 text-center">{pr.set.weight ?? '--'}</td>
                      <td className="py-1 text-center">{pr.set.reps ?? '--'}</td>
                      <td className="py-1 text-center">{pr.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Add Metric Modal */}
      {showMetricModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
          <div className="bg-gray-900 rounded-t-2xl md:rounded-xl p-6 w-full max-w-xs mx-auto animate-fadeInUp">
            <h2 className="text-lg font-bold mb-2">Add {METRIC_LABELS[metricType]} Log</h2>
            <form onSubmit={handleAddMetric}>
              <input
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                type="number"
                placeholder={`Enter ${METRIC_LABELS[metricType]} (${METRIC_UNITS[metricType]})`}
                className="w-full my-2 px-4 py-3 rounded border border-gray-600 text-white bg-gray-800 outline-none"
                step="any"
                required
                autoFocus
              />
              <button
                className="w-full bg-orange-500 py-3 rounded text-white mt-3 text-base font-bold hover:bg-orange-600"
                type="submit"
              >
                Save
              </button>
              <button
                type="button"
                className="w-full bg-gray-800 rounded py-2 mt-2 text-gray-400 text-sm"
                onClick={() => setShowMetricModal(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default Progress

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}
export const revalidate = 60 // Revalidate every 60 seconds
export const dynamic = 'force-dynamic' // Force dynamic rendering for this page
export const dynamicParams = false // No dynamic params for this page
export const fetchCache = 'force-no-store' // Disable fetch cache for this page 