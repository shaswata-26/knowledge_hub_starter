// list-models.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log('Listing available models...');
    const models = await genAI.listModels();
    
    console.log('Available models:');
    models.models.forEach(model => {
      console.log(`- ${model.name}: ${model.displayName}`);
      console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
    });
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();