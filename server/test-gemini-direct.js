// test-gemini-direct.js
require('dotenv').config();
const axios = require('axios');

async function testGeminiDirect() {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    console.log('API Key:', API_KEY ? 'Set' : 'Missing');
    
    if (!API_KEY) {
      console.error('Please set GEMINI_API_KEY in your .env file');
      return;
    }

    // Test with different model endpoints
    const modelsToTest = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.0-pro'
    ];

    for (const modelName of modelsToTest) {
      try {
        console.log(`\nTesting model: ${modelName}`);
        
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
          {
            contents: [{
              parts: [{
                text: "Hello, can you summarize this test message?"
              }]
            }]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        console.log(`✅ Model ${modelName} works!`);
        console.log('Response:', response.data.candidates[0].content.parts[0].text);
        return true;
        
      } catch (error) {
        if (error.response) {
          console.log(`❌ Model ${modelName} failed: ${error.response.status} - ${error.response.data.error?.message}`);
        } else {
          console.log(`❌ Model ${modelName} failed: ${error.message}`);
        }
      }
    }

    console.log('\nAll model attempts failed. Trying to list available models...');
    
    // Try to list models via different endpoint
    try {
      const listResponse = await axios.get(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
        { timeout: 10000 }
      );
      
      console.log('Available models:');
      listResponse.data.models.forEach(model => {
        console.log(`- ${model.name} (${model.displayName})`);
      });
    } catch (listError) {
      console.log('Cannot list models:', listError.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testGeminiDirect();