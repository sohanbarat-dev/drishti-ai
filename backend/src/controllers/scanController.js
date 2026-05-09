const Scan = require('../models/Scan')
const { getAIRecommendations } = require('../services/groqService')

// POST /api/scans/save
const saveScan = async (req, res) => {
  try {
    const {
      predictedClass, level, confidence,
      allProbabilities, message, urgency, emoji, gradcam
    } = req.body

    const scan = await Scan.create({
      userId: req.user._id,
      predictedClass,
      level,
      confidence,
      allProbabilities: {
        noDR: allProbabilities['No DR'],
        lowDR: allProbabilities['Low DR'],
        highDR: allProbabilities['High DR'],
      },
      message,
      urgency,
      emoji,
      gradcam: gradcam || null,
    })

    res.status(201).json({ message: 'Scan saved ✅', scan })
  } catch (err) {
    console.error('Save scan error:', err)
    res.status(500).json({ message: 'Failed to save scan' })
  }
}

// POST /api/scans/recommendations
const getRecommendations = async (req, res) => {
  try {
    const { scanResult } = req.body
    const userProfile = req.user

    console.log('🤖 Generating Gyaan AI recommendations...')
    const aiResult = await getAIRecommendations(scanResult, userProfile)

    res.json({
      recommendations: aiResult.recommendations,
      summary: aiResult.summary,
      generatedBy: 'Gyaan AI (Llama 3.3)',
    })
  } catch (err) {
    console.error('Recommendations error:', err)
    res.status(500).json({ message: 'Failed to generate recommendations' })
  }
}

// GET /api/scans/history
const getScanHistory = async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-gradcam')

    res.json({ scans, total: scans.length })
  } catch (err) {
    console.error('Get history error:', err)
    res.status(500).json({ message: 'Failed to fetch history' })
  }
}

// GET /api/scans/:id
const getScanById = async (req, res) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
    if (!scan) return res.status(404).json({ message: 'Scan not found' })
    res.json({ scan })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch scan' })
  }
}

// DELETE /api/scans/:id
const deleteScan = async (req, res) => {
  try {
    const scan = await Scan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    })
    if (!scan) return res.status(404).json({ message: 'Scan not found' })
    res.json({ message: 'Scan deleted ✅' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete scan' })
  }
}

module.exports = { saveScan, getScanHistory, getScanById, deleteScan, getRecommendations }