import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'

function About() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 80)
  }, [])

  const modelStats = [
    { label: 'Architecture', value: 'EfficientNetB3' },
    { label: 'Training Strategy', value: 'Transfer Learning (2-phase)' },
    { label: 'Dataset', value: 'APTOS 2019 (3,662 images)' },
    { label: 'Overall Accuracy', value: '88%' },
    { label: 'No DR Accuracy', value: '97%' },
    { label: 'Weighted F1 Score', value: '0.876' },
    { label: 'Preprocessing', value: 'Ben Graham + Crop' },
    { label: 'Classes', value: 'No DR, Low DR, High DR' },
  ]

  const steps = [
    { num: '01', icon: '📤', title: 'Upload', desc: 'Patient uploads a fundus retina photograph' },
    { num: '02', icon: '🔬', title: 'Preprocess', desc: 'Ben Graham preprocessing enhances blood vessels and removes artifacts' },
    { num: '03', icon: '🧠', title: 'Classify', desc: 'EfficientNetB3 classifies into No DR, Low DR, or High DR' },
    { num: '04', icon: '🗺️', title: 'Explain', desc: 'Grad-CAM generates heatmap showing which retinal regions influenced the prediction' },
    { num: '05', icon: '📋', title: 'Report', desc: 'Full result with confidence scores, probabilities and recommendations' },
  ]

  return (
    <div style={{ background: '#060b1a', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar />

      {/* BG */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(0, 153, 255, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.02, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 2rem 80px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{
          marginBottom: '52px',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0, 212, 170, 0.08)', border: '1px solid rgba(0, 212, 170, 0.2)',
            padding: '5px 14px', borderRadius: '100px', marginBottom: '20px',
          }}>
            <div style={{ width: '6px', height: '6px', background: '#00d4aa', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', color: '#00d4aa', fontWeight: '600', letterSpacing: '0.08em' }}>
              THE SCIENCE BEHIND DRISHTI
            </span>
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '50px', fontWeight: '400', color: '#f0f4ff',
            margin: '0 0 12px', lineHeight: 1.1,
          }}>
            About DrishtiAI 👁️
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: '560px' }}>
            The science and story behind an AI-powered retinopathy screening platform built for India.
          </p>
        </div>

        {/* The Problem */}
        <div style={{
          borderRadius: '24px', overflow: 'hidden', marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(0,212,170,0.06) 0%, rgba(0,153,255,0.06) 100%)',
          border: '1px solid rgba(0,212,170,0.15)',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s 0.1s',
        }}>
          <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: '#00d4aa', letterSpacing: '0.1em', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>
              Context
            </div>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '28px', fontWeight: '400', color: '#f0f4ff', margin: 0,
            }}>
              The Problem
            </h2>
          </div>
          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { value: '77M+', label: 'Diabetics in India', icon: '🇮🇳', color: '#00d4aa' },
                { value: '1:70K', label: 'Eye doctor to patient ratio', icon: '🏥', color: '#f59e0b' },
                { value: '95%', label: 'Blindness preventable with early detection', icon: '👁️', color: '#0099ff' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px', padding: '24px 20px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{stat.icon}</div>
                  <div style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '34px', fontWeight: '400', color: stat.color, lineHeight: 1, marginBottom: '8px',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Model */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '24px', overflow: 'hidden', marginBottom: '24px',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s 0.15s',
        }}>
          <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: '#0099ff', letterSpacing: '0.1em', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>
              Architecture
            </div>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '28px', fontWeight: '400', color: '#f0f4ff', margin: 0,
            }}>
              🧠 The Model
            </h2>
          </div>
          <div style={{ padding: '24px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {modelStats.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.4)' }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#f0f4ff' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Accuracy highlight */}
            <div style={{
              marginTop: '16px', padding: '20px',
              background: 'rgba(0,212,170,0.05)',
              border: '1px solid rgba(0,212,170,0.15)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
            }}>
              {[
                { label: 'Overall', val: '88%', color: '#00d4aa' },
                { label: 'No DR', val: '97%', color: '#00d4aa' },
                { label: 'F1 Score', val: '0.876', color: '#0099ff' },
              ].map((m, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '28px', color: m.color, lineHeight: 1,
                  }}>{m.val}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{m.label}</div>
                </div>
              ))}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                  Trained on APTOS 2019 dataset with 2-phase transfer learning from ImageNet weights.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '24px', overflow: 'hidden', marginBottom: '24px',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s 0.2s',
        }}>
          <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: '#f59e0b', letterSpacing: '0.1em', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>
              Pipeline
            </div>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '28px', fontWeight: '400', color: '#f0f4ff', margin: 0,
            }}>
              ⚙️ How It Works
            </h2>
          </div>
          <div style={{ padding: '24px 32px' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: i < steps.length - 1 ? '0' : '0', position: 'relative' }}>
                {/* Left: number + connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: '48px', height: '48px',
                    background: 'rgba(0, 212, 170, 0.08)',
                    border: '1px solid rgba(0, 212, 170, 0.2)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'DM Serif Display', serif", fontSize: '14px', color: '#00d4aa',
                    flexShrink: 0,
                  }}>
                    {step.num}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      width: '1px', height: '32px',
                      background: 'linear-gradient(180deg, rgba(0,212,170,0.2), rgba(0,212,170,0.05))',
                      margin: '4px 0',
                    }} />
                  )}
                </div>
                {/* Right: content */}
                <div style={{ paddingBottom: i < steps.length - 1 ? '8px' : 0, paddingTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px' }}>{step.icon}</span>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#f0f4ff' }}>{step.title}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '24px', padding: '28px 32px', marginBottom: '24px',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s 0.25s',
        }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', fontWeight: '600', textTransform: 'uppercase', marginBottom: '20px' }}>
            Developer
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '60px', height: '60px', flexShrink: 0,
              background: 'linear-gradient(135deg, #00d4aa, #0099ff)',
              borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'DM Serif Display', serif", fontSize: '24px', color: '#060b1a',
              fontWeight: '700',
            }}>
              S
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#f0f4ff', marginBottom: '4px' }}>
                Sohan Barat
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                B.Tech CSE • KIIT University • 2023-27
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              {['EfficientNetB3', 'TensorFlow', 'React', 'Flask'].map(tag => (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '4px 10px', borderRadius: '6px',
                  fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '500',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          background: 'rgba(245,158,11,0.05)',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: '16px', padding: '20px 28px', textAlign: 'center',
          marginBottom: '28px',
          opacity: mounted ? 1 : 0, transition: 'all 0.5s 0.3s',
        }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'rgba(245,158,11,0.9)', marginBottom: '6px' }}>
            ⚠️ Important Disclaimer
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(245,158,11,0.65)', margin: 0, lineHeight: 1.7 }}>
            DrishtiAI is developed for educational and research purposes.
            It is NOT a certified medical device and should NOT be used as a substitute
            for professional medical diagnosis. Always consult a qualified ophthalmologist.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/scan')}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #00d4aa, #0099ff)',
            color: '#060b1a', fontWeight: '700', fontSize: '16px',
            padding: '18px', borderRadius: '14px', border: 'none',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 8px 32px rgba(0, 212, 170, 0.25)',
            fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.02em',
            opacity: mounted ? 1 : 0, 
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,212,170,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,212,170,0.25)' }}
        >
          Start Your Scan →
        </button>
      </div>
    </div>
  )
}

export default About