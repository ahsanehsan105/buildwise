const express = require('express')
const projectController = require('../controllers/projectController')
const { requireAuth } = require('../middleware/authMiddleware')
const asyncHandler = require('../utils/asyncHandler')

const router = express.Router()

router.use(requireAuth)
router.get('/', asyncHandler(projectController.listProjects))
router.post('/', asyncHandler(projectController.createProject))
router.get('/:projectId/entries', asyncHandler(projectController.listEntries))
router.post('/:projectId/entries', asyncHandler(projectController.createEntry))
router.patch('/:projectId/entries/:entryId', asyncHandler(projectController.updateEntry))
router.delete('/:projectId/entries/:entryId', asyncHandler(projectController.deleteEntry))

module.exports = router
