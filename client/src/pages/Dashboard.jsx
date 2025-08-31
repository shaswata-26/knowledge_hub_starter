import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Pagination,
  Alert
} from '@mui/material';
import { Add as AddIcon, History as HistoryIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchDocuments, deleteDocument, generateSummary, generateTags, getRecentActivity } from '../services/api';
import DocumentCard from '../components/DocumentCard';
import Layout from '../components/Layout';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
    loadRecentActivity();
  }, [currentPage, selectedTag]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetchDocuments(currentPage, 10, '', selectedTag);
      setDocuments(response.data.documents);
      setTotalPages(response.data.totalPages);
      
      // Extract all unique tags
      const tags = new Set();
      response.data.documents.forEach(doc => {
        doc.tags.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      setError('Failed to load documents');
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await getRecentActivity(5);
      setRecentActivity(response.data);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        loadDocuments(); // Reload documents after deletion
      } catch (error) {
        setError('Failed to delete document');
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleGenerateSummary = async (id) => {
    try {
      const response = await generateSummary(id);
      // Update the document with new summary
      setDocuments(docs => docs.map(doc => 
        doc._id === id ? { ...doc, summary: response.data.summary } : doc
      ));
    } catch (error) {
      setError('Failed to generate summary');
      console.error('Error generating summary:', error);
    }
  };

  const handleGenerateTags = async (id) => {
    try {
      const response = await generateTags(id);
      // Update the document with new tags
      setDocuments(docs => docs.map(doc => 
        doc._id === id ? { ...doc, tags: response.data.tags } : doc
      ));
      loadDocuments(); // Reload to update tag filters
    } catch (error) {
      setError('Failed to generate tags');
      console.error('Error generating tags:', error);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Knowledge Hub</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/document/new')}
          >
            New Document
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Documents
              </Typography>
              {allTags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label="All"
                    variant={selectedTag === '' ? 'filled' : 'outlined'}
                    onClick={() => setSelectedTag('')}
                    sx={{ mr: 1, mb: 1 }}
                  />
                  {allTags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      variant={selectedTag === tag ? 'filled' : 'outlined'}
                      onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {loading ? (
              <Typography>Loading documents...</Typography>
            ) : documents.length === 0 ? (
              <Typography>No documents found. Create your first document!</Typography>
            ) : (
              <>
                {documents.map(document => (
                  <DocumentCard
                    key={document._id}
                    document={document}
                    onDelete={handleDelete}
                    onGenerateSummary={handleGenerateSummary}
                    onGenerateTags={handleGenerateTags}
                  />
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Activity</Typography>
              </Box>
              {recentActivity.length === 0 ? (
                <Typography variant="body2">No recent activity</Typography>
              ) : (
                <List dense>
                  {recentActivity.map((activity, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={activity.documentTitle}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {activity.user} {activity.action} this document
                            </Typography>
                            <br />
                            {new Date(activity.timestamp).toLocaleString()}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;