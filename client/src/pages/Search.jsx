import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { searchDocuments, answerQuestion } from '../services/api';
import DocumentCard from '../components/DocumentCard';
import Layout from '../components/Layout';

const Search = () => {
  const [query, setQuery] = useState('');
  const [semantic, setSemantic] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query) {
      return setError('Please enter a search query');
    }

    try {
      setLoading(true);
      setError('');
      const response = await searchDocuments(query, semantic);
      setSearchResults(response.data.documents);
    } catch (error) {
      setError('Failed to search documents');
      console.error('Error searching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    
    if (!question) {
      return setError('Please enter a question');
    }

    try {
      setLoading(true);
      setError('');
      const response = await answerQuestion(question);
      setAnswer(response.data.answer);
    } catch (error) {
      setError('Failed to get answer');
      console.error('Error getting answer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Paper sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Search Documents" />
          <Tab label="Team Q&A" />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Search Knowledge Base
            </Typography>
            <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Search query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ minWidth: 100 }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={semantic}
                    onChange={(e) => setSemantic(e.target.checked)}
                  />
                }
                label="Use semantic search (AI-powered)"
              />
            </Box>

            <Typography variant="h6" gutterBottom>
              Results ({searchResults.length})
            </Typography>

            {searchResults.length === 0 ? (
              <Typography>No results found. Try a different search term.</Typography>
            ) : (
              searchResults.map(document => (
                <DocumentCard
                  key={document._id}
                  document={document}
                  onDelete={() => {}}
                  onGenerateSummary={() => {}}
                  onGenerateTags={() => {}}
                />
              ))
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Team Q&A
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Ask questions about your team's knowledge base, and AI will answer using your documents as context.
            </Typography>
            
            <Box component="form" onSubmit={handleAskQuestion} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Ask a question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={loading}
                  multiline
                  rows={2}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ minWidth: 100 }}
                >
                  {loading ? 'Asking...' : 'Ask'}
                </Button>
              </Box>
            </Box>

            {answer && (
              <Paper sx={{ p: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  Answer
                </Typography>
                <Typography variant="body1">{answer}</Typography>
              </Paper>
            )}
          </Box>
        )}
      </Paper>
    </Layout>
  );
};

export default Search;