// test-gemini-sdk.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGeminiSDK() {
  try {
    console.log('Testing Gemini API with SDK...');
    
    // Try different model names
    const modelsToTest = [
      'gemini-1.5-flash',
      'gemini-1.5-pro', 
      'gemini-pro',
      'gemini-1.0-pro',
      'models/gemini-pro'
    ];

    for (const modelName of modelsToTest) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
          }
        });

        const result = await model.generateContent("Hello, can you help me with a quick test?");
        const response = await result.response;
        
        console.log(`✅ Model ${modelName} works!`);
        console.log('Response:', response.text());
        return true;
        
      } catch (error) {
        console.log(`❌ Model ${modelName} failed: ${error.message}`);
        
        // If it's a model not found error, try next model
        if (error.message.includes('not found') || error.message.includes('not supported')) {
          continue;
        }
        
        // For other errors, check if it's authentication related
        if (error.message.includes('API_KEY') || error.message.includes('permission') || error.message.includes('auth')) {
          console.error('API key issue. Please check your GEMINI_API_KEY.');
          return false;
        }
      }
    }

    console.log('\n💡 Tips:');
    console.log('1. Check if Gemini API is available in your region');
    console.log('2. Verify your API key is correct');
    console.log('3. Ensure billing is enabled if required');
    console.log('4. Try using a VPN if region is restricted');
    
    return false;
    
  } catch (error) {
    console.error('Test failed completely:', error.message);
    return false;
  }
}

testGeminiSDK();