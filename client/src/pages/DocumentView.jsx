import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDocument } from '../services/api';
import Layout from '../components/Layout';

const DocumentView = () => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const response = await fetchDocument(id);
      setDocument(response.data);
    } catch (error) {
      setError('Failed to load document');
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionDialogOpen = () => {
    setVersionDialogOpen(true);
  };

  const handleVersionDialogClose = () => {
    setVersionDialogOpen(false);
  };

  if (loading) {
    return (
      <Layout>
        <Typography>Loading document...</Typography>
      </Layout>
    );
  }

  if (error || !document) {
    return (
      <Layout>
        <Alert severity="error">{error || 'Document not found'}</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4">{document.title}</Typography>
          <Button
            variant="outlined"
            onClick={() => navigate(`/document/${document._id}/edit`)}
          >
            Edit
          </Button>
        </Box>

        <Box sx={{ mb: 2 }}>
          {document.tags.map((tag, index) => (
            <Chip key={index} label={tag} sx={{ mr: 1, mb: 1 }} />
          ))}
        </Box>

        {document.summary && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Typography variant="body1">{document.summary}</Typography>
          </Box>
        )}

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {document.content}
        </Typography>

        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Created by {document.createdBy.name} on {new Date(document.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated on {new Date(document.updatedAt).toLocaleDateString()}
          </Typography>

          {document.versions.length > 0 && (
            <Button
              variant="text"
              size="small"
              onClick={handleVersionDialogOpen}
              sx={{ mt: 1 }}
            >
              View Version History ({document.versions.length})
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={versionDialogOpen} onClose={handleVersionDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Document Version History</DialogTitle>
        <DialogContent>
          <List>
            {document.versions.map((version, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={`Version ${document.versions.length - index}`}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        Updated by {version.updatedBy?.name || 'Unknown'} on {new Date(version.updatedAt).toLocaleString()}
                      </Typography>
                      <Box sx={{ mt: 1, maxHeight: 100, overflow: 'auto' }}>
                        <Typography variant="body2" color="text.secondary">
                          {version.content.length > 200 
                            ? `${version.content.substring(0, 200)}...` 
                            : version.content
                          }
                        </Typography>
                      </Box>
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVersionDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default DocumentView;