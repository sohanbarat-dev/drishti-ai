import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import Navbar from '../components/Navbar'
import { predictRetina, saveScan } from '../services/api'
import toast from 'react-hot-toast'

function Scan() {
  const navigate = useNavigate()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
  })

  const handleScan = async () => {
    if (!image) return toast.error('Please upload a retina image first')
    setLoading(true)
    try {
      toast.loading('AI is analyzing your retina...', { id: 'scanning' })
      const result = await predictRetina(image)
      await saveScan(result)  // ← auto-save to MongoDB
      toast.success('Scan complete!', { id: 'scanning' })
      navigate('/result', { state: { result, preview } })
    } catch (err) {
      toast.error('Scan failed. Make sure the Flask API is running.', { id: 'scanning' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#060b1a', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar />

      {/* Background */}
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(0, 212, 170, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 2rem', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0, 212, 170, 0.08)', border: '1px solid rgba(0, 212, 170, 0.2)',
            padding: '5px 14px', borderRadius: '100px', marginBottom: '20px',
          }}>
            <div style={{ width: '6px', height: '6px', background: '#00d4aa', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', color: '#00d4aa', fontWeight: '600', letterSpacing: '0.08em' }}>
              AI ANALYSIS READY
            </span>
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '44px', fontWeight: '400',
            color: '#f0f4ff', marginBottom: '12px', lineHeight: 1.1,
          }}>
            Retina Scan 👁️
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            Upload a fundus retina photograph for AI-powered analysis
          </p>
        </div>

        {/* Disclaimer */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.06)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '14px', padding: '16px 20px',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
          marginBottom: '32px',
        }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(245,158,11,0.9)', marginBottom: '3px' }}>
              Medical Disclaimer
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(245,158,11,0.65)', lineHeight: 1.6 }}>
              This tool is for screening purposes only and does not constitute medical advice.
              Always consult a qualified ophthalmologist for diagnosis and treatment.
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px', overflow: 'hidden',
          marginBottom: '24px',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#f0f4ff' }}>Upload Retina Image</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>Supported: PNG, JPG, JPEG</div>
            </div>
            {image && (
              <button
                onClick={() => { setImage(null); setPreview(null) }}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444', padding: '4px 12px', borderRadius: '8px',
                  fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Remove
              </button>
            )}
          </div>

          <div style={{ padding: '24px' }}>
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? '#00d4aa' : preview ? 'rgba(0,212,170,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '16px', padding: preview ? '24px' : '60px 24px',
                textAlign: 'center', cursor: 'pointer',
                background: isDragActive ? 'rgba(0,212,170,0.05)' : preview ? 'rgba(0,212,170,0.03)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s',
              }}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div>
                  <img
                    src={preview}
                    alt="Retina preview"
                    style={{
                      width: '200px', height: '200px', objectFit: 'cover',
                      borderRadius: '16px', margin: '0 auto 16px',
                      border: '1px solid rgba(0,212,170,0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      display: 'block',
                    }}
                  />
                  <div style={{ fontSize: '13px', color: '#00d4aa', fontWeight: '600', marginBottom: '4px' }}>
                    ✅ {image?.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                    Click or drag to replace
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '72px', height: '72px',
                    background: 'rgba(0, 212, 170, 0.08)',
                    border: '1px solid rgba(0, 212, 170, 0.15)',
                    borderRadius: '20px', fontSize: '32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}>
                    👁️
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#f0f4ff', marginBottom: '8px' }}>
                    {isDragActive ? 'Drop your retina image here' : 'Drag & drop retina image'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>
                    or click to browse files
                  </div>
                  <div style={{
                    display: 'inline-flex', gap: '8px',
                  }}>
                    {['PNG', 'JPG', 'JPEG'].map(ext => (
                      <span key={ext} style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        padding: '3px 10px', borderRadius: '6px', fontSize: '11px',
                        color: 'rgba(255,255,255,0.35)', fontWeight: '500',
                      }}>
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div style={{
          background: 'rgba(0, 153, 255, 0.05)',
          border: '1px solid rgba(0, 153, 255, 0.15)',
          borderRadius: '14px', padding: '20px 24px',
          marginBottom: '32px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(96,184,255,0.9)', marginBottom: '12px' }}>
            📋 For best results:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              'Use a high-quality fundus photograph',
              'Ensure the retina is clearly visible and in focus',
              'Avoid blurry or heavily cropped images',
              'Standard retinal fundus images work best',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#0099ff', fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scan button */}
        <button
          onClick={handleScan}
          disabled={!image || loading}
          style={{
            width: '100%',
            background: (!image || loading) ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #00d4aa, #0099ff)',
            color: (!image || loading) ? 'rgba(255,255,255,0.3)' : '#060b1a',
            fontWeight: '700', fontSize: '16px',
            padding: '18px', borderRadius: '14px', border: 'none',
            cursor: (!image || loading) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', letterSpacing: '0.02em',
            boxShadow: (!image || loading) ? 'none' : '0 8px 32px rgba(0, 212, 170, 0.25)',
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => { if (image && !loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 212, 170, 0.4)' }}}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = image && !loading ? '0 8px 32px rgba(0, 212, 170, 0.25)' : 'none' }}
        >
          {loading ? '🧠 AI Analyzing Retina...' : '🔍 Analyze Retina →'}
        </button>

        {loading && (
          <div style={{
            marginTop: '20px',
            background: 'rgba(0, 212, 170, 0.05)',
            border: '1px solid rgba(0, 212, 170, 0.15)',
            borderRadius: '14px', padding: '20px', textAlign: 'center',
          }}>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '12px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#00d4aa', opacity: 0.7,
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            <div style={{ fontSize: '14px', color: '#00d4aa', fontWeight: '600', marginBottom: '4px' }}>
              EfficientNetB3 model is processing your scan...
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              This takes 3-10 seconds
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default Scan