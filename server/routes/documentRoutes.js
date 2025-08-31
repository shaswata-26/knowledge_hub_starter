const express = require('express');
const {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  generateDocumentSummary,
  generateDocumentTags,
  searchDocuments,
  answerQuestion,
  getRecentActivity
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/')
  .get(protect, getDocuments)
  .post(protect, createDocument);

router.route('/:id')
  .get(protect, getDocument)
  .put(protect, updateDocument)
  .delete(protect, deleteDocument);

router.route('/:id/summary')
  .post(protect, generateDocumentSummary);

router.route('/:id/tags')
  .post(protect, generateDocumentTags);

router.route('/search/query')
  .post(protect, searchDocuments);

router.route('/qa/answer')
  .post(protect, answerQuestion);

router.route('/activity/recent')
  .get(protect, getRecentActivity);

module.exports = router;