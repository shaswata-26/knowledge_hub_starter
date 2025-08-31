// test-gemini.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
    
    // Use the correct model that works
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Hello, can you summarize this test message about project management?");
    const response = await result.response;
    
    console.log('✅ Gemini API test passed:');
    console.log('Response:', response.text());
    return true;
  } catch (error) {
    console.error('❌ Gemini API test failed:');
    console.error('Error:', error.message);
    return false;
  }
}

testGemini();