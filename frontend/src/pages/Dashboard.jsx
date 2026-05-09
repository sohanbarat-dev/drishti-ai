import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getScanHistory } from '../services/api'

function Dashboard() {
  const navigate = useNavigate()
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const data = await getScanHistory()
      setScans(data.scans || [])
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityConfig = (level) => {
    if (level === 'No DR') return {
      color: '#00d4aa', bg: 'rgba(0,212,170,0.08)',
      border: 'rgba(0,212,170,0.2)', dot: '#00d4aa',
    }
    if (level === 'Low DR') return {
      color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.2)', dot: '#f59e0b',
    }
    return {
      color: '#ef4444', bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.2)', dot: '#ef4444',
    }
  }

  const totalScans = scans.length
  const lastScan = scans[0]
  const noDRCount = scans.filter(s => s.level === 'No DR').length
  const highDRCount = scans.filter(s => s.level === 'High DR').length

  // Simple trend: compare last 2 scans
  const getTrend = () => {
    if (scans.length < 2) return null
    const last = scans[0].predictedClass
    const prev = scans[1].predictedClass
    if (last < prev) return { label: 'Improving ↑', color: '#00d4aa' }
    if (last > prev) return { label: 'Worsening ↓', color: '#ef4444' }
    return { label: 'Stable →', color: '#f59e0b' }
  }

  const trend = getTrend()

  return (
    <div style={{ background: '#060b1a', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar />

      {/* BG glow */}
      <div style={{ position: 'fixed', top: 0, right: 0, width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 2rem 80px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', padding: '5px 14px', borderRadius: '100px', marginBottom: '16px' }}>
            <div style={{ width: '6px', height: '6px', background: '#00d4aa', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', color: '#00d4aa', fontWeight: '600', letterSpacing: '0.08em' }}>PATIENT DASHBOARD</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '42px', fontWeight: '400', color: '#f0f4ff', margin: '0 0 8px' }}>
            Welcome back, {user.name?.split(' ')[0] || 'Patient'} 👋
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Track your retina health over time
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Scans', value: totalScans, icon: '🔍', color: '#00d4aa' },
            { label: 'Last Result', value: lastScan ? lastScan.level : '—', icon: lastScan?.emoji || '👁️', color: lastScan ? getSeverityConfig(lastScan.level).color : '#fff' },
            { label: 'Healthy Scans', value: noDRCount, icon: '✅', color: '#00d4aa' },
            { label: 'Trend', value: trend ? trend.label : '—', icon: '📈', color: trend ? trend.color : 'rgba(255,255,255,0.4)' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '18px', padding: '22px 20px',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,170,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{stat.icon}</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', color: stat.color, lineHeight: 1, marginBottom: '6px' }}>
                {loading ? '...' : stat.value}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: '500' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Patient Medical Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '28px' }}>

          {/* Profile card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', fontWeight: '600', marginBottom: '16px' }}>PATIENT PROFILE</div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #00d4aa, #0099ff)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: '#060b1a', flexShrink: 0 }}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#f0f4ff' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{user.email}</div>
              </div>
            </div>

            {/* Medical details */}
            {[
              { label: 'Age', value: user.age ? `${user.age} years` : '—' },
              { label: 'Diabetes Type', value: user.diabetesType || '—' },
              { label: 'Diabetic Since', value: user.diabeticSince ? `${user.diabeticSince} years` : '—' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#f0f4ff' }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Trend Chart — simple visual bars */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', fontWeight: '600', marginBottom: '4px' }}>SEVERITY TREND</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#f0f4ff' }}>Last {Math.min(scans.length, 8)} scans</div>
              </div>
              {trend && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '5px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', color: trend.color }}>
                  {trend.label}
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px', paddingTop: '40px' }}>Loading...</div>
            ) : scans.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.3 }}>📊</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>No scans yet — do your first scan!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
                {scans.slice(0, 8).reverse().map((scan, i) => {
                  const cfg = getSeverityConfig(scan.level)
                  const heights = { 'No DR': 30, 'Low DR': 60, 'High DR': 100 }
                  const h = heights[scan.level] || 30
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ fontSize: '10px', color: cfg.color, fontWeight: '700' }}>{scan.confidence?.toFixed(0)}%</div>
                      <div style={{
                        width: '100%', height: `${h}px`,
                        background: cfg.color, borderRadius: '6px 6px 2px 2px',
                        opacity: 0.7, transition: 'all 0.3s',
                        minWidth: '24px',
                      }}
                        title={`${scan.level} — ${new Date(scan.createdAt).toLocaleDateString()}`}
                      />
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
                        {new Date(scan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              {[['#00d4aa', 'No DR'], ['#f59e0b', 'Low DR'], ['#ef4444', 'High DR']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scan History Table */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#f0f4ff' }}>Scan History</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{totalScans} total scans</div>
            </div>
            <button
              onClick={() => navigate('/scan')}
              style={{ background: 'linear-gradient(135deg, #00d4aa, #0099ff)', color: '#060b1a', fontWeight: '700', fontSize: '13px', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              + New Scan
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>
              Loading scan history...
            </div>
          ) : scans.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.2 }}>🔍</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>No scans yet</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', marginBottom: '24px' }}>Upload your first retina image to get started</div>
              <button
                onClick={() => navigate('/scan')}
                style={{ background: 'linear-gradient(135deg, #00d4aa, #0099ff)', color: '#060b1a', fontWeight: '700', fontSize: '14px', padding: '12px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                Start First Scan →
              </button>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['Date & Time', 'Result', 'Confidence', 'No DR %', 'High DR %'].map(h => (
                  <div key={h} style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>{h}</div>
                ))}
              </div>

              {/* Table rows */}
              {scans.map((scan, i) => {
                const cfg = getSeverityConfig(scan.level)
                return (
                  <div
                    key={scan._id}
                    style={{
                      display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                      padding: '16px 24px',
                      borderBottom: i < scans.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Date */}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#f0f4ff' }}>
                        {new Date(scan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                        {new Date(scan.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Result badge */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '100px', padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: cfg.color }}>{scan.level}</span>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: cfg.color }}>
                        {scan.confidence?.toFixed(1)}%
                      </span>
                    </div>

                    {/* No DR % */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#00d4aa', fontWeight: '600' }}>
                        {scan.allProbabilities?.noDR?.toFixed(1)}%
                      </span>
                    </div>

                    {/* High DR % */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600' }}>
                        {scan.allProbabilities?.highDR?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick action */}
        {scans.length > 0 && (
          <div style={{ marginTop: '20px', background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#f0f4ff', marginBottom: '4px' }}>
                Ready for your next screening?
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                Regular monitoring helps track progression early
              </div>
            </div>
            <button
              onClick={() => navigate('/scan')}
              style={{ background: 'linear-gradient(135deg, #00d4aa, #0099ff)', color: '#060b1a', fontWeight: '700', fontSize: '14px', padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,212,170,0.25)' }}
            >
              🔍 New Scan →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard