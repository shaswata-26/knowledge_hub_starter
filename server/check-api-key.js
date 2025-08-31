// check-api-key.js
require('dotenv').config();
const axios = require('axios');

async function checkAPIKey() {
  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in .env file');
    return;
  }

  console.log('Checking API key validity...');
  
  try {
    // Simple test request
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
      { timeout: 5000 }
    );
    
    console.log('✅ API key is valid!');
    console.log('Available models:', response.data.models.map(m => m.name).join(', '));
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ API key error: ${error.response.status} - ${error.response.data.error?.message}`);
      
      if (error.response.status === 404) {
        console.log('This might be a region availability issue.');
      } else if (error.response.status === 403) {
        console.log('API key might be invalid or missing required permissions.');
      }
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

checkAPIKey();