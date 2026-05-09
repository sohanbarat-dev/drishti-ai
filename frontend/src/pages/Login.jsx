import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import bannerImg from '../assets/drishti-banner.png'
import logoImg from '../assets/drishti-logo.png'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return setError('Please fill in all fields')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── Full screen background image ── */}
      <img
        src={bannerImg}
        alt="DrishtiAI"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* ── Dark overlay for readability ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to right, rgba(4,8,20,0.15) 0%, rgba(4,8,20,0.75) 60%, rgba(4,8,20,0.88) 100%)',
      }} />

      {/* ── Glass Login Box ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '420px', marginRight: '6vw',
        background: 'rgba(8, 16, 36, 0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '44px 40px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        {/* Glow inside box */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '250px', height: '250px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
          <img
            src={logoImg}
            alt="DrishtiAI Logo"
            style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover' }}
          />
          <div>
            <div style={{
              fontFamily: "'DM Serif Display', serif", fontSize: '20px',
              background: 'linear-gradient(90deg, #00d4aa, #60b8ff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>DrishtiAI</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginTop: '3px' }}>
              RETINOPATHY SCREENING
            </div>
          </div>
        </div>

        {/* Heading */}
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '30px', fontWeight: '400',
          color: '#f0f4ff', margin: '0 0 6px',
        }}>
          Welcome back
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '0 0 28px', lineHeight: 1.6 }}>
          Sign in to access your scan history and dashboard
        </p>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '11px 14px', marginBottom: '18px',
            fontSize: '13px', color: '#ef4444',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', display: 'block', marginBottom: '7px' }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email" name="email"
              value={form.email} onChange={handleChange}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: '#f0f4ff',
                fontSize: '14px', outline: 'none',
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', display: 'block', marginBottom: '7px' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password} onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '12px 44px 12px 14px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#f0f4ff',
                  fontSize: '14px', outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '15px', padding: 0 }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #00d4aa, #0099ff)',
              color: loading ? 'rgba(255,255,255,0.3)' : '#060b1a',
              fontWeight: '700', fontSize: '15px',
              border: 'none', borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
              boxShadow: loading ? 'none' : '0 6px 20px rgba(0,212,170,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,212,170,0.45)' }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 6px 20px rgba(0,212,170,0.3)' }}
          >
            {loading ? (
              <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Signing in...</>
            ) : 'Sign In →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#00d4aa', fontWeight: '600', textDecoration: 'none' }}>
            Create account
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
      `}</style>
    </div>
  )
}

export default Login