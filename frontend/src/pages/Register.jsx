import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import bannerImg from '../assets/drishti-banner.png'
import logoImg from '../assets/drishti-logo.png'

function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age: '', diabetesType: 'Type 2',
    diabeticSince: '', lastHbA1c: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password)
      return setError('Please fill in all fields')
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters')
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
          diabeticSince: Number(form.diabeticSince),
          lastHbA1c: Number(form.lastHbA1c),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: '#f0f4ff',
    fontSize: '14px', outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  }

  const labelStyle = {
    fontSize: '11px', fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: '0.08em', display: 'block', marginBottom: '7px',
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Full screen background */}
      <img src={bannerImg} alt="DrishtiAI"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to right, rgba(4,8,20,0.15) 0%, rgba(4,8,20,0.75) 60%, rgba(4,8,20,0.88) 100%)',
      }} />

      {/* Glass Register Box */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '440px', marginRight: '6vw',
        background: 'rgba(8, 16, 36, 0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px', padding: '40px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <img src={logoImg} alt="DrishtiAI Logo"
            style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover' }} />
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', background: 'linear-gradient(90deg, #00d4aa, #60b8ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>DrishtiAI</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginTop: '3px' }}>RETINOPATHY SCREENING</div>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: step >= s ? 'linear-gradient(135deg, #00d4aa, #0099ff)' : 'rgba(255,255,255,0.06)',
                border: step >= s ? 'none' : '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700',
                color: step >= s ? '#060b1a' : 'rgba(255,255,255,0.3)',
              }}>{s}</div>
              <span style={{ fontSize: '12px', color: step === s ? '#f0f4ff' : 'rgba(255,255,255,0.3)', fontWeight: step === s ? '600' : '400' }}>
                {s === 1 ? 'Account' : 'Medical Info'}
              </span>
              {s < 2 && <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />}
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', fontWeight: '400', color: '#f0f4ff', margin: '0 0 4px' }}>
          {step === 1 ? 'Create account' : 'Medical profile'}
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '0 0 22px', lineHeight: 1.6 }}>
          {step === 1 ? 'Start your retina health journey' : 'Helps AI personalize your recommendations'}
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', color: '#ef4444' }}>
            ⚠️ {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNext}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>FULL NAME</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Sohan Barat" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>PASSWORD</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <button type="submit"
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #00d4aa, #0099ff)', color: '#060b1a', fontWeight: '700', fontSize: '15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 6px 20px rgba(0,212,170,0.3)' }}>
              Continue →
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>AGE</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="25" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label style={labelStyle}>DIABETIC SINCE (YRS)</label>
                <input type="number" name="diabeticSince" value={form.diabeticSince} onChange={handleChange} placeholder="5" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>DIABETES TYPE</label>
              <select name="diabetesType" value={form.diabetesType} onChange={handleChange}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                <option value="Type 1">Type 1</option>
                <option value="Type 2">Type 2</option>
                <option value="Pre-diabetic">Pre-diabetic</option>
                <option value="Not diabetic">Not diabetic</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>LAST HbA1c % <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input type="number" step="0.1" name="lastHbA1c" value={form.lastHbA1c} onChange={handleChange} placeholder="7.2" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setStep(1)}
                style={{ flex: 1, padding: '13px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: '14px', borderRadius: '10px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                ← Back
              </button>
              <button type="submit" disabled={loading}
                style={{ flex: 2, padding: '13px', background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #00d4aa, #0099ff)', color: loading ? 'rgba(255,255,255,0.3)' : '#060b1a', fontWeight: '700', fontSize: '14px', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading
                  ? <><div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Creating...</>
                  : 'Create Account →'}
              </button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#00d4aa', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        select option { background: #0d1528; color: #f0f4ff; }
      `}</style>
    </div>
  )
}

export default Register