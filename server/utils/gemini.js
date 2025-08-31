const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the correct model name for your region
const TEXT_MODEL = 'gemini-1.5-flash'; // or 'gemini-1.5-pro' or 'gemini-pro'
const EMBEDDING_MODEL = 'embedding-001';

// Generate summary for a document
const generateSummary = async (content) => {
  try {
    if (!content || content.trim().length === 0) {
      return 'No content available for summarization.';
    }

    // Limit content length
    const limitedContent = content.length > 10000 
      ? content.substring(0, 10000) + '...' 
      : content;

    const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
    
    const prompt = `Please provide a concise summary (2-3 sentences) of the following text:\n\n${limitedContent}\n\nSummary:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text().trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Summary could not be generated.';
  }
};

// Generate tags for a document
const generateTags = async (content) => {
  try {
    if (!content || content.trim().length === 0) {
      return [];
    }

    const limitedContent = content.length > 5000 
      ? content.substring(0, 5000) + '...' 
      : content;

    const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
    
    const prompt = `Extract 3-5 relevant tags (comma-separated) from the following text. Return only the tags, no other text:\n\n${limitedContent}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    const tagsText = response.text().trim();
    return tagsText.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5);
  } catch (error) {
    console.error('Error generating tags:', error);
    return [];
  }
};

// Answer questions based on documents
const answerQuestionApi = async (question, documents) => {
  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
    
    // Combine documents content as context
    const context = documents.map(doc => 
      `Document: ${doc.title}\nContent: ${doc.content.substring(0, 1000)}...`
    ).join('\n\n');
    
    const prompt = `Based on the following documents, please answer the question. If the answer cannot be found in the documents, say so.\n\nContext:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error answering question:', error);
    return 'Sorry, I could not process your question at this time.';
  }
};

// Semantic search using embeddings
const semanticSearch = async (query, documents) => {
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    
    // Generate embedding for the query
    const queryResult = await model.embedContent(query);
    const queryEmbedding = queryResult.embedding.values;
    
    // For each document, calculate similarity
    const results = await Promise.all(documents.map(async (doc) => {
      const docResult = await model.embedContent(doc.content);
      const docEmbedding = docResult.embedding.values;
      
      // Calculate cosine similarity
      const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
      
      return {
        document: doc,
        similarity
      };
    }));
    
    // Filter and sort by similarity
    return results
      .filter(result => result.similarity > 0.2)
      .sort((a, b) => b.similarity - a.similarity)
      .map(result => result.document);
  } catch (error) {
    console.error('Error with semantic search:', error);
    return documents; // Fallback to regular search
  }
};

// Helper function for cosine similarity
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  return dotProduct / (magnitudeA * magnitudeB);
}

module.exports = {
  generateSummary,
  generateTags,
  semanticSearch,
  answerQuestionApi
};