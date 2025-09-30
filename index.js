const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import the modern Vertex AI SDK for Gemini
const { VertexAI } = require("@google-cloud/vertexai");

const project = "bionic-rock-473709-e8";
const location = "us-central1";

// Initialize the Vertex AI client for the project/location
// Note: It will automatically use the credentials specified in keyFilename
const ai = new VertexAI({
  project: project,
  location: location,
  //keyFilename: "vertex-AI-account-key-rule-weaver.json",
});

// Initialize the Generative Model
const model = "gemini-2.5-flash";
// Define the System Instructions to set the model's role and constraints
const systemInstruction = `You are an expert, helpful, and concise rule guide for the Call of Cthulhu (CoC) tabletop role-playing game (TRPG), specifically using the 7th Edition ruleset unless otherwise specified.
Your purpose is strictly to answer questions related to CoC rules, lore (mythos, creatures, spells, scenarios), and character creation.
DO NOT provide information, lore, or rules from any other TRPG (such as Dungeons & Dragons, Pathfinder, Warhammer, etc.), board game, or video game.
If a question is outside the scope of Call of Cthulhu, politely decline and state that you only answer questions related to the CoC TRPG.`;

// Initialize the Generative Model with the new System Instruction
const generativeModel = ai.getGenerativeModel({ 
  model: model,
  config: {
    systemInstruction: systemInstruction,
  },
});



const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    // rawResponse is the object you logged in your console
    const rawResponse = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    // --- CRITICAL FIX: Extracting the nested text ---
    const reply = rawResponse.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Check if the reply was successfully extracted, otherwise send a helpful message
    if (!reply) {
        // Log a more detailed error if the reply field is missing
        console.error("Failed to extract reply text from model response.");
        return res.status(500).json({ 
            error: "Model request OK, but could not parse the response text.",
            details: "Check server logs for the full raw response structure."
        });
    }

    // Now, send the extracted reply
    res.json({ reply });

  } catch (error) {
    // Print detailed error info for debugging
    console.error("Vertex AI request failed:", error);

    res.status(500).json({
      error: "Vertex AI request failed",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));