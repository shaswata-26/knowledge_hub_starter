const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  content: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  summary: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  versions: [versionSchema]
}, {
  timestamps: true
});

// Add the latest version to versions array before update
documentSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.versions.push({
      content: this.content,
      updatedBy: this._id, // In a real app, you'd track who made the change
      updatedAt: new Date()
    });
    
    // Keep only last 10 versions
    if (this.versions.length > 10) {
      this.versions = this.versions.slice(-10);
    }
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema);