const Document = require('../models/Document');
const { generateSummary, generateTags, semanticSearch, answerQuestionApi } = require('../utils/gemini');

// Get all documents
// const getDocuments = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;
    
//     let query = {};
    
//     // Filter by tag if provided
//     if (req.query.tag) {
//       query.tags = { $in: [req.query.tag] };
//     }
    
//     // Filter by search term if provided
//     if (req.query.search) {
//       query.$or = [
//         { title: { $regex: req.query.search, $options: 'i' } },
//         { content: { $regex: req.query.search, $options: 'i' } },
//         { tags: { $in: [new RegExp(req.query.search, 'i')] } }
//       ];
//     }
    
//     const documents = await Document.find(query)
//       .populate('createdBy', 'name email')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
    
//     const total = await Document.countDocuments(query);
    
//     res.json({
//       documents,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//       totalDocuments: total
//     });
//   } catch (error) {
//     console.error('Get documents error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// In getDocuments function - fix the search query
// const getDocuments = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;
    
//     let query = {};
    
//     // Filter by tag if provided
//     if (req.query.tag) {
//       query.tags = { $in: [req.query.tag] };
//     }
    
//     // Filter by search term if provided - FIXED
//     if (req.query.search) {
//       const searchRegex = { $regex: req.query.search, $options: 'i' }; // Use string directly
      
//       query.$or = [
//         { title: searchRegex },
//         { content: searchRegex },
//         { tags: { $in: [req.query.search] } } // For tags, use $in with string
//       ];
//     }
    
//     const documents = await Document.find(query)
//       .populate('createdBy', 'name email')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
    
//     const total = await Document.countDocuments(query);
    
//     res.json({
//       documents,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//       totalDocuments: total
//     });
//   } catch (error) {
//     console.error('Get documents error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



const getDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Filter by tag if provided
    if (req.query.tag) {
      query.tags = { $in: [req.query.tag] };
    }
    
    // Filter by search term if provided
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }
    
    const documents = await Document.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Document.countDocuments(query);
    
    res.json({
      documents,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocuments: total
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ 
      message: 'Failed to load documents',
      error: process.env.NODE_ENV === 'production' ? {} : error.message 
    });
  }
};

// Get single document
const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('versions.updatedBy', 'name');
    
    if (document) {
      res.json(document);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new document
const createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // Generate summary and tags using Gemini AI
    const [summary, tags] = await Promise.all([
      generateSummary(content),
      generateTags(content)
    ]);
    
    const document = new Document({
      title,
      content,
      summary,
      tags,
      createdBy: req.user._id
    });
    
    const createdDocument = await document.save();
    await createdDocument.populate('createdBy', 'name email');
    
    res.status(201).json(createdDocument);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update document
const updateDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user is authorized to update
    if (document.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this document' });
    }
    
    // Update document fields
    document.title = title || document.title;
    
    // Only update content if it's different to avoid creating unnecessary versions
    if (content && content !== document.content) {
      document.content = content;
      
      // Regenerate summary and tags if content changed
      const [summary, tags] = await Promise.all([
        generateSummary(content),
        generateTags(content)
      ]);
      
      document.summary = summary;
      document.tags = tags;
    }
    
    const updatedDocument = await document.save();
    await updatedDocument.populate('createdBy', 'name email');
    await updatedDocument.populate('versions.updatedBy', 'name');
    
    res.json(updatedDocument);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user is authorized to delete
    if (document.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }
    
    await Document.deleteOne({ _id: req.params.id });
    res.json({ message: 'Document removed' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate summary with Gemini
const generateDocumentSummary = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const summary = await generateSummary(document.content);
    res.json({ summary });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate tags with Gemini
const generateDocumentTags = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const tags = await generateTags(document.content);
    res.json({ tags });
  } catch (error) {
    console.error('Generate tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Semantic search
// const searchDocuments = async (req, res) => {
//   try {
//     const { query, semantic } = req.body;
    
//     let documents;
    
//     if (semantic) {
//       // Get all documents for semantic search
//       const allDocuments = await Document.find({})
//         .populate('createdBy', 'name email');
      
//       // Use Gemini for semantic search
//       documents = await semanticSearch(query, allDocuments);
//     } else {
//       // Regular text search
//       documents = await Document.find({
//         $or: [
//           { title: { $regex: query, $options: 'i' } },
//           { content: { $regex: query, $options: 'i' } },
//           { tags: { $in: [new RegExp(query, 'i')] } }
//         ]
//       }).populate('createdBy', 'name email');
//     }
    
//     res.json({ documents });
//   } catch (error) {
//     console.error('Search documents error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// In searchDocuments function - make sure query is a string
const searchDocuments = async (req, res) => {
  try {
    const { query, semantic } = req.body;
    
    // Validate that query is a string
    if (typeof query !== 'string') {
      return res.status(400).json({ message: 'Query must be a string' });
    }
    
    let documents;
    
    if (semantic) {
      // Get all documents for semantic search
      const allDocuments = await Document.find({})
        .populate('createdBy', 'name email');
      
      // Use Gemini for semantic search
      documents = await semanticSearch(query, allDocuments);
    } else {
      // Regular text search - FIXED
      const searchRegex = { $regex: query, $options: 'i' };
      
      documents = await Document.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: { $in: [query] } } // Use string directly for tags
        ]
      }).populate('createdBy', 'name email');
    }
    
    res.json({ documents });
  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Answer question using documents as context
const answerQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    
    // Get all documents to use as context
    const documents = await Document.find({})
      .populate('createdBy', 'name email');
    
    const answer = await answerQuestionApi(question, documents);
    res.json({ answer });
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Get recently updated documents with user info
    const recentDocuments = await Document.find({})
      .populate('createdBy', 'name')
      .sort({ updatedAt: -1 })
      .limit(limit);
    
    // Format activity feed
    const activity = recentDocuments.map(doc => ({
      documentId: doc._id,
      documentTitle: doc.title,
      action: doc.createdAt.getTime() === doc.updatedAt.getTime() ? 'created' : 'updated',
      user: doc.createdBy.name,
      timestamp: doc.updatedAt
    }));
    
    res.json(activity);
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};