const mongoose = require('mongoose')

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  predictedClass: {
    type: Number,
    required: true,  // 0, 1, 2
  },
  level: {
    type: String,
    required: true,  // 'No DR', 'Low DR', 'High DR'
  },
  confidence: {
    type: Number,
    required: true,
  },
  allProbabilities: {
    noDR: Number,
    lowDR: Number,
    highDR: Number,
  },
  message: String,
  urgency: String,
  emoji: String,
  gradcam: {
    type: String,  // base64 string
    default: null,
  },
}, { timestamps: true })

module.exports = mongoose.model('Scan', scanSchema)