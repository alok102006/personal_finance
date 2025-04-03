// check_models.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const models = await genAI.listModels();
        console.log("Available Models:", models);
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
