const API_URL = 'http://localhost:5000/api'
const FLASK_URL = 'http://localhost:5001'

// Get auth token
const getToken = () => localStorage.getItem('token')

// Predict retina (Flask)
export const predictRetina = async (imageFile) => {
  const formData = new FormData()
  formData.append('image', imageFile)
  const res = await fetch(`${FLASK_URL}/predict`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Prediction failed')
  return res.json()
}

// Save scan to MongoDB (Node backend)
export const saveScan = async (result) => {
  const token = getToken()
  if (!token) return // not logged in, skip
  try {
    await fetch(`${API_URL}/scans/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        predictedClass: result.predicted_class,
        level: result.level,
        confidence: result.confidence,
        allProbabilities: result.all_probabilities,
        message: result.message,
        urgency: result.urgency,
        emoji: result.emoji,
        gradcam: result.gradcam,
      }),
    })
  } catch (err) {
    console.error('Save scan error:', err)
  }
}

// Get scan history
export const getScanHistory = async () => {
  const token = getToken()
  const res = await fetch(`${API_URL}/scans/history`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch history')
  return res.json()
}

export const getAIRecommendations = async (scanResult) => {
  const token = getToken()
  if (!token) return null
  const res = await fetch(`${API_URL}/scans/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ scanResult }),
  })
  if (!res.ok) throw new Error('Failed to get recommendations')
  return res.json()
}