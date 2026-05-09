const express = require('express')
const router = express.Router()
const {
  saveScan, getScanHistory,
  getScanById, deleteScan, getRecommendations
} = require('../controllers/scanController')
const { protect } = require('../middleware/authMiddleware')

router.post('/save', protect, saveScan)
router.post('/recommendations', protect, getRecommendations)
router.get('/history', protect, getScanHistory)
router.get('/:id', protect, getScanById)
router.delete('/:id', protect, deleteScan)

module.exports = router