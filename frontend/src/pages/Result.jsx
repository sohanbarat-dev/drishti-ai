import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'
import { getAIRecommendations } from '../services/api'

function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const { result, preview } = location.state || {}
  const [mounted, setMounted] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [aiRecs, setAiRecs] = useState(null)
  const [recsLoading, setRecsLoading] = useState(true)

  useEffect(() => {
    if (!result) navigate('/scan')
    setTimeout(() => setMounted(true), 100)
  }, [result])

  useEffect(() => {
    if (result) fetchAIRecommendations()
  }, [result])

  const fetchAIRecommendations = async () => {
    try {
      const data = await getAIRecommendations(result)
      setAiRecs(data)
    } catch (err) {
      console.error('AI recs failed:', err)
    } finally {
      setRecsLoading(false)
    }
  }

  if (!result) return null

  const severityConfig = {
    0: {
      accent: '#00d4aa', accentDim: 'rgba(0, 212, 170, 0.1)',
      accentBorder: 'rgba(0, 212, 170, 0.25)', accentText: '#00d4aa',
      gradStart: '#00d4aa', gradEnd: '#0099ff',
      urgencyBg: 'rgba(0, 212, 170, 0.06)', urgencyBorder: 'rgba(0, 212, 170, 0.2)',
    },
    1: {
      accent: '#f59e0b', accentDim: 'rgba(245, 158, 11, 0.1)',
      accentBorder: 'rgba(245, 158, 11, 0.25)', accentText: '#f59e0b',
      gradStart: '#f59e0b', gradEnd: '#ef4444',
      urgencyBg: 'rgba(245, 158, 11, 0.06)', urgencyBorder: 'rgba(245, 158, 11, 0.2)',
    },
    2: {
      accent: '#ef4444', accentDim: 'rgba(239, 68, 68, 0.1)',
      accentBorder: 'rgba(239, 68, 68, 0.25)', accentText: '#ef4444',
      gradStart: '#ef4444', gradEnd: '#be123c',
      urgencyBg: 'rgba(239, 68, 68, 0.06)', urgencyBorder: 'rgba(239, 68, 68, 0.2)',
    },
  }

  const cfg = severityConfig[result.predicted_class]

  // Fallback recommendations if Gyaan AI fails
  const fallbackRecs = {
    0: [
      { icon: '👁️', text: 'Continue regular annual eye checkups' },
      { icon: '🩸', text: 'Maintain good blood sugar control' },
      { icon: '🏃', text: 'Exercise regularly and eat a balanced diet' },
      { icon: '💊', text: 'Monitor blood pressure and cholesterol' },
      { icon: '🚨', text: 'Report any vision changes to your doctor immediately' },
    ],
    1: [
      { icon: '🏥', text: 'Consult an ophthalmologist within 3–6 months' },
      { icon: '🩸', text: 'Strictly control blood glucose levels (HbA1c < 7%)' },
      { icon: '💓', text: 'Monitor blood pressure — keep below 130/80' },
      { icon: '🚭', text: 'Avoid smoking — it accelerates retinopathy' },
      { icon: '📅', text: 'Schedule more frequent eye exams (every 6 months)' },
    ],
    2: [
      { icon: '🚨', text: 'Seek immediate ophthalmologist consultation' },
      { icon: '⚠️', text: 'Do NOT delay — untreated High DR can cause blindness' },
      { icon: '💉', text: 'Laser photocoagulation or injections may be needed' },
      { icon: '🩺', text: 'Urgently control blood sugar, pressure and cholesterol' },
      { icon: '📋', text: 'Inform your diabetologist about this screening result' },
    ],
  }

  const barColorMap = {
    'No DR':   { bar: '#00d4aa', text: '#00d4aa' },
    'Low DR':  { bar: '#f59e0b', text: '#f59e0b' },
    'High DR': { bar: '#ef4444', text: '#ef4444' },
  }

  const getBarColor = (label) => {
    const key = Object.keys(barColorMap).find(k => label.toLowerCase().includes(k.toLowerCase()))
    return barColorMap[key] || { bar: '#00d4aa', text: '#00d4aa' }
  }

  const generatePDF = async () => {
    setPdfLoading(true)
    try {
      await new Promise((resolve, reject) => {
        if (window.jspdf) return resolve()
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })

      const { jsPDF } = window.jspdf
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210
      const margin = 16
      let y = 0

      const sRGB =
        result.predicted_class === 0 ? [0, 212, 170] :
        result.predicted_class === 1 ? [245, 158, 11] :
        [239, 68, 68]

      const fill = (r, g, b) => doc.setFillColor(r, g, b)
      const textColor = (r, g, b) => doc.setTextColor(r, g, b)
      const fontSize = (s) => doc.setFontSize(s)
      const bold = () => doc.setFont('helvetica', 'bold')
      const normal = () => doc.setFont('helvetica', 'normal')
      const txt = (text, x, ty, opts = {}) => doc.text(String(text), x, ty, opts)
      const box = (x, bx, w, h, r, rgb) => { fill(...rgb); doc.roundedRect(x, bx, w, h, r, r, 'F') }

      box(0, 0, W, 48, 0, [6, 11, 26])
      fill(...sRGB); doc.rect(0, 0, 5, 48, 'F')
      fontSize(18); bold(); textColor(...sRGB)
      txt('DrishtiAI', margin + 2, 18)
      fontSize(7); normal(); textColor(150, 160, 180)
      txt('AI-Powered Retinopathy Screening', margin + 2, 25)
      txt('For screening purposes only — Not a clinical diagnostic tool', margin + 2, 31)
      const dateStr = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      fontSize(7); normal(); textColor(120, 130, 150)
      txt(`Generated: ${dateStr}`, W - margin, 18, { align: 'right' })
      txt('Model: EfficientNetB3 + Transfer Learning', W - margin, 25, { align: 'right' })
      txt('Dataset: APTOS 2019 (3,662 images)', W - margin, 31, { align: 'right' })
      fill(...sRGB); doc.rect(0, 47, W, 1, 'F')
      y = 56

      box(margin, y, W - margin * 2, 40, 4, [12, 20, 42])
      fill(...sRGB); doc.roundedRect(margin, y, 4, 40, 2, 2, 'F')
      fontSize(7); normal(); textColor(140, 150, 170); txt('DIAGNOSIS RESULT', margin + 10, y + 9)
      fontSize(20); bold(); textColor(...sRGB); txt(result.level, margin + 10, y + 22)
      fontSize(8); normal(); textColor(180, 190, 210); txt(result.message, margin + 10, y + 30)
      box(W - margin - 40, y + 6, 38, 24, 3, [20, 30, 55])
      fill(...sRGB); doc.roundedRect(W - margin - 40, y + 6, 38, 2, 1, 1, 'F')
      fontSize(18); bold(); textColor(...sRGB); txt(`${result.confidence}%`, W - margin - 21, y + 22, { align: 'center' })
      fontSize(6); normal(); textColor(130, 140, 160); txt('CONFIDENCE', W - margin - 21, y + 28, { align: 'center' })
      y += 48

      fontSize(7); normal(); textColor(100, 110, 130)
      txt('RETINA ANALYSIS  —  GRAD-CAM VISUALIZATION (XAI)', margin, y)
      y += 5
      const imgSize = (W - margin * 2 - 10) / 2
      box(margin, y, imgSize, imgSize + 12, 3, [10, 18, 38])
      fontSize(6); normal(); textColor(120, 130, 150); txt('ORIGINAL SCAN', margin + 3, y + 7)
      if (preview) { try { doc.addImage(preview, 'JPEG', margin + 2, y + 10, imgSize - 4, imgSize - 4) } catch (e) {} }
      const gx = margin + imgSize + 10
      box(gx, y, imgSize, imgSize + 12, 3, [10, 18, 38])
      fontSize(6); normal(); textColor(120, 130, 150); txt('GRAD-CAM HEATMAP  (XAI)', gx + 3, y + 7)
      if (result.gradcam) { try { doc.addImage(`data:image/png;base64,${result.gradcam}`, 'PNG', gx + 2, y + 10, imgSize - 4, imgSize - 4) } catch (e) {} }
      else { fontSize(8); textColor(70, 80, 100); txt('Not available', gx + imgSize / 2, y + imgSize / 2 + 5, { align: 'center' }) }
      y += imgSize + 16
      fill(239, 68, 68); doc.circle(margin + 2, y, 1.5, 'F')
      fontSize(6); normal(); textColor(130, 140, 160)
      txt('Red / warm regions = areas the AI focused on most for this prediction', margin + 6, y + 1)
      y += 8

      fontSize(7); normal(); textColor(100, 110, 130); txt('PROBABILITY BREAKDOWN', margin, y); y += 5
      const probColorMap = { 'No DR': [0,212,170], 'Low DR': [245,158,11], 'High DR': [239,68,68] }
      Object.entries(result.all_probabilities).forEach(([lbl, prob]) => {
        const cKey = Object.keys(probColorMap).find(k => lbl.includes(k)) || 'No DR'
        const bc = probColorMap[cKey]
        const totalW = W - margin * 2
        const filledW = Math.max((totalW * prob) / 100, 1.5)
        box(margin, y, totalW, 8, 2, [14, 22, 44])
        fill(...bc); doc.roundedRect(margin, y, filledW, 8, 2, 2, 'F')
        fontSize(7); bold(); textColor(230, 235, 245); txt(lbl, margin + 4, y + 5.5)
        fontSize(7); bold(); textColor(...bc); txt(`${prob}%`, W - margin - 2, y + 5.5, { align: 'right' })
        y += 11
      })
      y += 2

      box(margin, y, W - margin * 2, 16, 3, [12, 20, 42])
      fill(...sRGB); doc.roundedRect(margin, y, 4, 16, 2, 2, 'F')
      fontSize(7); bold(); textColor(...sRGB); txt('ACTION REQUIRED', margin + 9, y + 7)
      fontSize(8); normal(); textColor(190, 200, 220); txt(result.urgency, margin + 9, y + 13)
      y += 22

      if (y > 230) {
        doc.addPage()
        box(0, 0, W, 12, 0, [6, 11, 26])
        fill(...sRGB); doc.rect(0, 0, 5, 12, 'F')
        fontSize(7); normal(); textColor(150, 160, 180); txt('DrishtiAI — Recommendations', margin + 2, 8)
        y = 20
      }

      fontSize(7); normal(); textColor(100, 110, 130); txt('RECOMMENDATIONS', margin, y); y += 5
      const pdfRecs = aiRecs?.recommendations || fallbackRecs[result.predicted_class]
      pdfRecs.forEach((rec, i) => {
        box(margin, y, W - margin * 2, 12, 2, [10, 18, 38])
        fill(...sRGB); doc.circle(margin + 6, y + 6, 4, 'F')
        fontSize(7); bold(); textColor(6, 11, 26); txt(`${i + 1}`, margin + 6, y + 8, { align: 'center' })
        fontSize(8); normal(); textColor(195, 205, 220); txt(rec.text, margin + 14, y + 7.5)
        y += 14
      })
      y += 4

      if (y > 248) { doc.addPage(); y = 20 }
      box(margin, y, W - margin * 2, 16, 3, [30, 20, 5])
      fill(245, 158, 11); doc.roundedRect(margin, y, 4, 16, 2, 2, 'F')
      fontSize(7); bold(); textColor(245, 158, 11); txt('IMPORTANT DISCLAIMER', margin + 9, y + 7)
      fontSize(7); normal(); textColor(200, 180, 130)
      txt('This is an AI screening tool only. NOT a medical diagnosis. Always consult a qualified ophthalmologist.', margin + 9, y + 13)

      const totalPages = doc.getNumberOfPages()
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p)
        const ph = doc.internal.pageSize.height
        box(0, ph - 14, W, 14, 0, [6, 11, 26])
        fill(...sRGB); doc.rect(0, ph - 14, W, 1, 'F')
        fontSize(6); bold(); textColor(...sRGB); txt('DrishtiAI', margin, ph - 7)
        fontSize(6); normal(); textColor(100, 110, 130)
        txt('Built by Sohan Barat  |  EfficientNetB3 + Transfer Learning  |  APTOS 2019', W / 2, ph - 7, { align: 'center' })
        txt(`Page ${p} of ${totalPages}`, W - margin, ph - 7, { align: 'right' })
      }

      const fname = `DrishtiAI_${result.level.replace(' ', '_')}_Report_${Date.now()}.pdf`
      doc.save(fname)
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF generation failed: ' + err.message)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div style={{ background: '#060b1a', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar />

      <div style={{ position: 'fixed', top: 0, right: 0, width: '600px', height: '600px', background: `radial-gradient(circle, ${cfg.accentDim} 0%, transparent 65%)`, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, opacity: 0.02, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 2rem 80px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: '36px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.5s' }}>
          <button onClick={() => navigate('/scan')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', padding: 0, fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = cfg.accentText}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
            ← New Scan
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '42px', fontWeight: '400', color: '#f0f4ff', margin: 0, lineHeight: 1.1 }}>Scan Results</h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>AI analysis complete</p>
            </div>
            <div style={{ background: cfg.accentDim, border: `1px solid ${cfg.accentBorder}`, padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', color: cfg.accentText, letterSpacing: '0.06em' }}>● ANALYSIS COMPLETE</div>
          </div>
        </div>

        {/* Result Banner */}
        <div style={{ borderRadius: '24px', padding: '36px 40px', marginBottom: '28px', background: `linear-gradient(135deg, ${cfg.gradStart}18 0%, ${cfg.gradEnd}10 100%)`, border: `1px solid ${cfg.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.55s 0.1s', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle, ${cfg.gradStart}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase' }}>Diagnosis Result</div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '42px', fontWeight: '400', color: '#f0f4ff', margin: '0 0 8px', lineHeight: 1 }}>{result.emoji} {result.level}</h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', margin: '0 0 16px', lineHeight: 1.6 }}>{result.message}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '36px', color: cfg.accentText }}>{result.confidence}%</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>confidence score</span>
            </div>
          </div>
          <div style={{ fontSize: '100px', opacity: 0.08, lineHeight: 1 }}>👁️</div>
        </div>

        {/* Images + Probabilities */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.55s 0.2s' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#f0f4ff' }}>Retina Analysis</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>Grad-CAM visualization</div>
              </div>
              <div style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', color: '#00d4aa', fontWeight: '600' }}>XAI</div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Original</div>
                  {preview
                    ? <img src={preview} alt="Original" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'block' }} />
                    : <div style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>No image</div>}
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Grad-CAM <span style={{ background: 'rgba(0,212,170,0.12)', color: '#00d4aa', padding: '1px 6px', borderRadius: '4px', fontSize: '9px' }}>XAI</span>
                  </div>
                  {result.gradcam
                    ? <img src={`data:image/png;base64,${result.gradcam}`} alt="Grad-CAM" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'block' }} />
                    : <div style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', border: '1px dashed rgba(0,212,170,0.15)', background: 'rgba(0,212,170,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px', opacity: 0.3 }}>🔬</span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.4, padding: '0 8px' }}>Grad-CAM not available</span>
                      </div>}
                </div>
              </div>
              <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                {result.gradcam ? '🔴 Red regions = areas the AI focused on for this prediction' : '⚙️ Ensure Flask API returns gradcam field'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden', flex: 1 }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#f0f4ff' }}>Probability Breakdown</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>Confidence per class</div>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {Object.entries(result.all_probabilities).map(([label, prob], i) => {
                  const bc = getBarColor(label)
                  return (
                    <div key={label} style={{ marginBottom: i < Object.keys(result.all_probabilities).length - 1 ? '18px' : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.65)' }}>{label}</span>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: bc.text }}>{prob}%</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '100px', height: '6px' }}>
                        <div style={{ width: `${prob}%`, height: '6px', borderRadius: '100px', background: bc.bar, transition: 'width 1s ease', boxShadow: `0 0 8px ${bc.bar}60` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ background: cfg.urgencyBg, border: `1px solid ${cfg.urgencyBorder}`, borderRadius: '16px', padding: '20px 24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: cfg.accentText, marginBottom: '8px' }}>⏰ Action Required</div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>{result.urgency}</p>
            </div>
          </div>
        </div>

        {/* ── Recommendations (Gyaan AI) ── */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.55s 0.3s' }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#f0f4ff' }}>💊 Recommendations</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
                {aiRecs ? 'Personalized by Gyaan AI (Llama 3.3)' : 'Based on your screening result'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {aiRecs && (
                <div style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', color: '#00d4aa', fontWeight: '600' }}>
                  🤖 Gyaan AI
                </div>
              )}
              <div style={{ background: cfg.accentDim, border: `1px solid ${cfg.accentBorder}`, padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '600', color: cfg.accentText }}>
                {result.predicted_class === 0 ? 'PREVENTIVE' : result.predicted_class === 1 ? 'MONITOR' : 'URGENT'}
              </div>
            </div>
          </div>

          <div style={{ padding: '20px 28px' }}>
            {/* Gyaan AI summary */}
            {aiRecs?.summary && (
              <div style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                🧠 <strong style={{ color: '#00d4aa' }}>Gyaan says:</strong> {aiRecs.summary}
              </div>
            )}

            {recsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 0' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,212,170,0.2)', borderTopColor: '#00d4aa', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Gyaan AI is personalizing your recommendations...</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {(aiRecs?.recommendations || fallbackRecs[result.predicted_class]).map((rec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', background: cfg.accentDim, border: `1px solid ${cfg.accentBorder}`, borderRadius: '12px' }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{rec.icon}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>{rec.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '14px', padding: '16px 24px', textAlign: 'center', marginBottom: '28px', opacity: mounted ? 1 : 0, transition: 'all 0.55s 0.4s' }}>
          <p style={{ fontSize: '13px', color: 'rgba(245,158,11,0.7)', margin: 0, lineHeight: 1.6 }}>⚠️ {result.disclaimer}</p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '14px', opacity: mounted ? 1 : 0, transition: 'all 0.55s 0.45s' }}>
          <button
            onClick={() => navigate('/scan')}
            style={{ flex: 1, background: 'linear-gradient(135deg, #00d4aa, #0099ff)', color: '#060b1a', fontWeight: '700', fontSize: '15px', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 32px rgba(0, 212, 170, 0.25)', fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,212,170,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,212,170,0.25)' }}
          >
            🔍 Scan Another Image
          </button>
          <button
            onClick={generatePDF}
            disabled={pdfLoading}
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${pdfLoading ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)'}`, color: pdfLoading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: '15px', padding: '16px', borderRadius: '14px', cursor: pdfLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onMouseEnter={e => { if (!pdfLoading) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff' }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
          >
            {pdfLoading
              ? <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Generating PDF...</>
              : <>📄 Download Report</>}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Result