import { useNavigate, useLocation } from 'react-router-dom'
import logoImg from '../assets/drishti-logo.png'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const links = [
  { label: 'Home', path: '/' },
  { label: 'Scan', path: '/scan' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Doctors', path: '/doctors' },
  { label: 'About', path: '/about' },
]

  return (
    <nav style={{
      background: 'rgba(6, 11, 26, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0, 212, 170, 0.12)',
      padding: '0 2rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <img
          src={logoImg}
          alt="DrishtiAI"
          style={{
            width: '38px', height: '38px',
            borderRadius: '10px',
            objectFit: 'cover',
            boxShadow: '0 0 16px rgba(0, 212, 170, 0.35)',
          }}
        />
        <div>
          <div style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '18px', fontWeight: '700',
            background: 'linear-gradient(90deg, #00d4aa, #60b8ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}>DrishtiAI</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginTop: '2px' }}>
            Detect Early. Prevent Blindness.
          </div>
        </div>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {links.map((link) => {
          const active = location.pathname === link.path
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                background: active ? 'rgba(0, 212, 170, 0.1)' : 'transparent',
                border: active ? '1px solid rgba(0, 212, 170, 0.3)' : '1px solid transparent',
                color: active ? '#00d4aa' : 'rgba(255,255,255,0.5)',
                padding: '6px 16px', borderRadius: '8px',
                fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                transition: 'all 0.2s', letterSpacing: '0.02em',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => { if (!active) { e.target.style.color = 'rgba(255,255,255,0.85)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}}
              onMouseLeave={e => { if (!active) { e.target.style.color = 'rgba(255,255,255,0.5)'; e.target.style.background = 'transparent' }}}
            >
              {link.label}
            </button>
          )
        })}
      </div>

      {/* Right: user + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* User avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #00d4aa, #0099ff)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '13px', fontWeight: '700',
            color: '#060b1a',
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>
            {user.name || 'User'}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', fontWeight: '500', fontSize: '13px',
            padding: '8px 14px', borderRadius: '8px',
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar