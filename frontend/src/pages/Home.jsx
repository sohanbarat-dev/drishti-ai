import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'

function Home() {
  const navigate = useNavigate()
  const heroRef = useRef(null)

  useEffect(() => {
    // Animate elements in on load
    const els = document.querySelectorAll('.fade-up')
    els.forEach((el, i) => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(28px)'
      setTimeout(() => {
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      }, i * 110)
    })
  }, [])

  const stats = [
    { value: '77M+', label: 'Diabetics in India', icon: '🇮🇳' },
    { value: '88%', label: 'Model Accuracy', icon: '🎯' },
    { value: '3', label: 'Severity Levels', icon: '📊' },
    { value: '<5s', label: 'Scan Time', icon: '⚡' },
  ]

  const features = [
    { icon: '🧠', title: 'AI-Powered Detection', desc: 'EfficientNetB3 with transfer learning trained on 3,662 retina scans from the APTOS 2019 dataset' },
    { icon: '🔍', title: 'Grad-CAM Visualization', desc: 'See exactly which retinal regions the AI focused on — making every result explainable and trustworthy' },
    { icon: '⚡', title: 'Instant Results', desc: 'Get your complete screening result with confidence scores in under 5 seconds' },
    { icon: '🏥', title: '3-Level Classification', desc: 'No DR, Low DR, High DR — clinically meaningful severity levels for better care decisions' },
    { icon: '🔒', title: 'Privacy First', desc: 'Your retina images are never stored permanently after analysis. Your data stays yours.' },
    { icon: '📋', title: 'Detailed Report', desc: 'Full probability breakdown, Grad-CAM heatmap, and personalized recommendations' },
  ]

  return (
    <div style={{ background: '#060b1a', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <Navbar />

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '-120px', right: '-80px',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(0, 212, 170, 0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-60px',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(0, 153, 255, 0.07) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>

            {/* Left */}
            <div>
              <div className="fade-up" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(0, 212, 170, 0.08)', border: '1px solid rgba(0, 212, 170, 0.25)',
                padding: '6px 14px', borderRadius: '100px', marginBottom: '28px',
              }}>
                <div style={{ width: '6px', height: '6px', background: '#00d4aa', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '12px', color: '#00d4aa', fontWeight: '500', letterSpacing: '0.05em' }}>
                  AI-POWERED MEDICAL SCREENING
                </span>
              </div>

              <h1 className="fade-up" style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(42px, 5vw, 68px)',
                lineHeight: 1.08, fontWeight: '400',
                marginBottom: '24px', color: '#f0f4ff',
              }}>
                Detect Diabetic<br />
                <span style={{
                  background: 'linear-gradient(90deg, #00d4aa 0%, #60b8ff 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Retinopathy
                </span><br />
                with AI
              </h1>

              <p className="fade-up" style={{
                fontSize: '17px', lineHeight: 1.7,
                color: 'rgba(255,255,255,0.5)', maxWidth: '480px',
                marginBottom: '40px',
              }}>
                DrishtiAI uses deep learning to screen for diabetic retinopathy from retina images.
                Early detection can prevent <strong style={{ color: 'rgba(255,255,255,0.8)' }}>95% of blindness</strong> cases in diabetic patients.
              </p>

              <div className="fade-up" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '56px' }}>
                <button
                  onClick={() => navigate('/scan')}
                  style={{
                    background: 'linear-gradient(135deg, #00d4aa, #0099ff)',
                    color: '#060b1a', fontWeight: '700', fontSize: '15px',
                    padding: '14px 32px', borderRadius: '12px', border: 'none',
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 8px 32px rgba(0, 212, 170, 0.3)',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 212, 170, 0.45)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 212, 170, 0.3)' }}
                >
                  Start Free Scan →
                </button>
                <button
                  onClick={() => navigate('/about')}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.7)', fontWeight: '500', fontSize: '15px',
                    padding: '14px 32px', borderRadius: '12px',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                >
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="fade-up" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                {stats.map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', color: '#fff', lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', letterSpacing: '0.03em' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Visual card */}
            <div className="fade-up" style={{ position: 'relative' }}>
              <div style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                border: '1px solid rgba(0, 212, 170, 0.15)',
                borderRadius: '24px', padding: '32px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}>
                {/* Fake retina scan card */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>LIVE ANALYSIS</span>
                    <span style={{
                      background: 'rgba(0, 212, 170, 0.12)', color: '#00d4aa',
                      padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600',
                    }}>● ACTIVE</span>
                  </div>
                  {/* Retina circle mockup */}
                  <div style={{
                    width: '180px', height: '180px', margin: '0 auto 20px',
                    borderRadius: '50%', position: 'relative',
                    background: 'radial-gradient(circle at 45% 45%, #3d1a00 0%, #1a0a00 40%, #0d0500 100%)',
                    border: '2px solid rgba(0, 212, 170, 0.2)',
                    boxShadow: '0 0 40px rgba(0, 212, 170, 0.1)',
                    overflow: 'hidden',
                  }}>
                    {/* Vessels simulation */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'radial-gradient(ellipse at 52% 48%, rgba(255,100,0,0.3) 0%, transparent 50%)',
                    }} />
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'rgba(255,180,80,0.6)',
                      boxShadow: '0 0 20px rgba(255,150,0,0.4)',
                    }} />
                    {/* Heatmap overlay */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'radial-gradient(ellipse at 60% 40%, rgba(0,212,170,0.15) 0%, transparent 60%)',
                    }} />
                  </div>
                </div>

                {/* Result preview */}
                <div style={{
                  background: 'rgba(0, 212, 170, 0.08)', border: '1px solid rgba(0, 212, 170, 0.2)',
                  borderRadius: '12px', padding: '16px', marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', marginBottom: '4px' }}>RESULT</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#00d4aa' }}>✅ No DR Detected</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', marginBottom: '4px' }}>CONFIDENCE</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>94.3%</div>
                    </div>
                  </div>
                </div>

                {/* Probability bars */}
                {[
                  { label: 'No DR', pct: 94, color: '#00d4aa' },
                  { label: 'Low DR', pct: 4, color: '#f59e0b' },
                  { label: 'High DR', pct: 2, color: '#ef4444' },
                ].map((b, i) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{b.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: b.color }}>{b.pct}%</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '100px', height: '5px' }}>
                      <div style={{ width: `${b.pct}%`, height: '5px', borderRadius: '100px', background: b.color, opacity: 0.8 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating badge */}
              <div style={{
                position: 'absolute', top: '-16px', right: '-16px',
                background: 'linear-gradient(135deg, #0099ff, #00d4aa)',
                borderRadius: '12px', padding: '10px 16px',
                fontSize: '12px', fontWeight: '700', color: '#060b1a',
                boxShadow: '0 8px 24px rgba(0, 153, 255, 0.4)',
              }}>
                EfficientNetB3
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Disclaimer bar */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.06)',
        borderTop: '1px solid rgba(245, 158, 11, 0.15)',
        borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
        padding: '12px 2rem', textAlign: 'center',
      }}>
        <p style={{ fontSize: '13px', color: 'rgba(245, 158, 11, 0.85)', margin: 0 }}>
          ⚠️ DrishtiAI is a screening tool only — not a medical diagnosis. Always consult a qualified ophthalmologist.
        </p>
      </div>

      {/* Features */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-block',
            fontSize: '11px', color: '#00d4aa', letterSpacing: '0.12em',
            fontWeight: '600', marginBottom: '16px',
            textTransform: 'uppercase',
          }}>Why DrishtiAI?</div>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '400',
            color: '#f0f4ff', marginBottom: '16px', lineHeight: 1.2,
          }}>
            Screening accessible<br />to every Indian
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
            India has 77 million diabetic patients but only 1 ophthalmologist per 70,000 people.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px', padding: '28px',
                transition: 'all 0.3s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0, 212, 170, 0.04)'
                e.currentTarget.style.borderColor = 'rgba(0, 212, 170, 0.2)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                width: '48px', height: '48px',
                background: 'rgba(0, 212, 170, 0.08)',
                border: '1px solid rgba(0, 212, 170, 0.15)',
                borderRadius: '14px', fontSize: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f0f4ff', marginBottom: '10px' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works - timeline */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '80px 2rem',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', color: '#00d4aa', letterSpacing: '0.12em', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px' }}>
              Process
            </div>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '40px', fontWeight: '400', color: '#f0f4ff',
            }}>
              How it works
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { num: '01', title: 'Upload', desc: 'Upload your fundus retina photograph' },
              { num: '02', title: 'Preprocess', desc: 'Ben Graham preprocessing enhances vessels' },
              { num: '03', title: 'Classify', desc: 'EfficientNetB3 classifies severity level' },
              { num: '04', title: 'Explain', desc: 'Grad-CAM highlights affected regions' },
              { num: '05', title: 'Report', desc: 'Full result with recommendations' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', width: '140px' }}>
                  <div style={{
                    width: '52px', height: '52px',
                    background: 'rgba(0, 212, 170, 0.08)',
                    border: '1px solid rgba(0, 212, 170, 0.25)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px',
                    fontFamily: "'DM Serif Display', serif", fontSize: '18px', color: '#00d4aa',
                  }}>
                    {step.num}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#f0f4ff', marginBottom: '6px' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                    {step.desc}
                  </div>
                </div>
                {i < 4 && (
                  <div style={{
                    width: '32px', height: '1px',
                    background: 'linear-gradient(90deg, rgba(0,212,170,0.3), rgba(0,153,255,0.3))',
                    marginBottom: '40px', flexShrink: 0,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '100px 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(0, 212, 170, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '400',
            color: '#f0f4ff', marginBottom: '16px',
          }}>
            Ready to get screened?
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', marginBottom: '40px', lineHeight: 1.7 }}>
            Upload your retina scan and get results in seconds.<br />Free, fast and private.
          </p>
          <button
            onClick={() => navigate('/scan')}
            style={{
              background: 'linear-gradient(135deg, #00d4aa, #0099ff)',
              color: '#060b1a', fontWeight: '700', fontSize: '16px',
              padding: '16px 40px', borderRadius: '14px', border: 'none',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 8px 40px rgba(0, 212, 170, 0.3)',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 50px rgba(0, 212, 170, 0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(0, 212, 170, 0.3)' }}
          >
            Start Your Scan Now →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 2rem', textAlign: 'center',
      }}>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          Built by <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>Sohan Barat</span> •
          EfficientNetB3 + Transfer Learning •{' '}
          <span style={{ color: 'rgba(0, 212, 170, 0.6)' }}>Not for clinical use</span>
        </p>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default Home