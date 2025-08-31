import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DocumentCard = ({ document, onDelete, onGenerateSummary, onGenerateTags }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const canEdit = user?.role === 'admin' || document.createdBy._id === user?._id;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {document.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {document.summary || 'No summary available'}
        </Typography>
        <Box sx={{ mb: 1 }}>
          {document.tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary">
          Created by {document.createdBy.name} • {new Date(document.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => navigate(`/document/${document._id}`)}>
          View
        </Button>
        {canEdit && (
          <>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/document/${document._id}/edit`)}
            >
              Edit
            </Button>
            <IconButton
              size="small"
              onClick={() => onGenerateSummary(document._id)}
              title="Generate Summary"
            >
              <AutoAwesomeIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onGenerateTags(document._id)}
              title="Generate Tags"
            >
              <AutoAwesomeIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(document._id)}
              color="error"
              title="Delete"
            >
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </CardActions>
    </Card>
  );
};

export default DocumentCard;