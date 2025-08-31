import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDocument, createDocument, updateDocument } from '../services/api';
import Layout from '../components/Layout';

const DocumentForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      loadDocument();
      setIsEditing(true);
    }
  }, [id]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const response = await fetchDocument(id);
      const document = response.data;
      setTitle(document.title);
      setContent(document.content);
      setTags(document.tags);
    } catch (error) {
      setError('Failed to load document');
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content) {
      return setError('Please fill in title and content');
    }

    try {
      setLoading(true);
      setError('');

      if (isEditing) {
        await updateDocument(id, { title, content, tags });
      } else {
        await createDocument({ title, content, tags });
      }

      navigate('/dashboard');
    } catch (error) {
      setError(isEditing ? 'Failed to update document' : 'Failed to create document');
      console.error('Error saving document:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEditing ? 'Edit Document' : 'Create New Document'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            multiline
            rows={10}
            required
          />

          <Box sx={{ mt: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                label="Add Tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                size="small"
              />
              <Button onClick={handleAddTag} sx={{ ml: 1 }}>
                Add
              </Button>
            </Box>
            <Box>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Document' : 'Create Document')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Layout>
  );
};

export default DocumentForm;