const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const getAIRecommendations = async (scanResult, userProfile) => {
  try {
    const { level, confidence, predicted_class } = scanResult
    const { name, age, diabetesType, diabeticSince, lastHbA1c } = userProfile

    const prompt = `You are Gyaan, an expert AI medical assistant specializing in diabetic retinopathy. 
    
A patient just completed a retina screening. Based on their profile and result, provide personalized recommendations.

PATIENT PROFILE:
- Name: ${name}
- Age: ${age || 'Not specified'} years
- Diabetes Type: ${diabetesType || 'Not specified'}
- Diabetic Since: ${diabeticSince ? diabeticSince + ' years' : 'Not specified'}
- Last HbA1c: ${lastHbA1c ? lastHbA1c + '%' : 'Not specified'}

SCAN RESULT:
- Classification: ${level}
- Confidence: ${confidence}%
- Severity Level: ${predicted_class} (0=No DR, 1=Low DR, 2=High DR)

Provide exactly 5 specific, personalized recommendations. 
Consider their diabetes duration, type, and HbA1c when giving advice.
Be direct, actionable and medically accurate.
Do NOT use generic advice — personalize based on their profile.

Respond in this EXACT JSON format only, no other text:
{
  "recommendations": [
    {"icon": "emoji", "text": "recommendation text"},
    {"icon": "emoji", "text": "recommendation text"},
    {"icon": "emoji", "text": "recommendation text"},
    {"icon": "emoji", "text": "recommendation text"},
    {"icon": "emoji", "text": "recommendation text"}
  ],
  "summary": "One personalized sentence summarizing their situation and most important action"
}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 800,
    })

    const content = completion.choices[0]?.message?.content
    const cleaned = content.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return parsed

  } catch (err) {
    console.error('Groq AI error:', err)
    // Fallback recommendations if Groq fails
    return getFallbackRecommendations(scanResult.predicted_class)
  }
}

const getFallbackRecommendations = (predictedClass) => {
  const recs = {
    0: {
      summary: 'Your retina appears healthy. Keep maintaining your current lifestyle.',
      recommendations: [
        { icon: '👁️', text: 'Continue regular annual eye checkups' },
        { icon: '🩸', text: 'Maintain good blood sugar control' },
        { icon: '🏃', text: 'Exercise regularly and eat a balanced diet' },
        { icon: '💊', text: 'Monitor blood pressure and cholesterol' },
        { icon: '🚨', text: 'Report any vision changes to your doctor immediately' },
      ]
    },
    1: {
      summary: 'Early signs detected. Consult an ophthalmologist within 3-6 months.',
      recommendations: [
        { icon: '🏥', text: 'Consult an ophthalmologist within 3-6 months' },
        { icon: '🩸', text: 'Strictly control blood glucose (HbA1c < 7%)' },
        { icon: '💓', text: 'Monitor blood pressure — keep below 130/80' },
        { icon: '🚭', text: 'Avoid smoking — it accelerates retinopathy' },
        { icon: '📅', text: 'Schedule eye exams every 6 months' },
      ]
    },
    2: {
      summary: 'Significant DR detected. Seek immediate ophthalmologist consultation.',
      recommendations: [
        { icon: '🚨', text: 'Seek immediate ophthalmologist consultation' },
        { icon: '⚠️', text: 'Do NOT delay — untreated High DR can cause blindness' },
        { icon: '💉', text: 'Laser photocoagulation or injections may be needed' },
        { icon: '🩺', text: 'Urgently control blood sugar, pressure and cholesterol' },
        { icon: '📋', text: 'Inform your diabetologist about this result' },
      ]
    }
  }
  return recs[predictedClass] || recs[0]
}

module.exports = { getAIRecommendations }