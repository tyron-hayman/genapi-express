// server.js
import express from 'express';
import cors from 'cors'; // Helps with cross-origin requests
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from .env file
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
    'http://localhost:5173', // Your development environment
    'https://tyronhayman.me', // Your deployed Vue app
  ];

// Use CORS to allow requests from your Vue app's origin
app.use(cors({
    origin: allowedOrigins, // Only allow requests from your local Vue app
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json()); // For parsing application/json

// Serve your Vue app's static files
app.use(express.static(path.join(__dirname, 'dist')));

// Get the Gemini API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// The chat endpoint
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.status(200).json({ message: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error generating content from Gemini API.' });
    }
});

// Catch-all to serve the Vue app's index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});