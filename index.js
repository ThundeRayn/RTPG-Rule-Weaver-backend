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
  keyFilename: "vertex-AI-account-key-rule-weaver.json",
});

// Initialize the Generative Model
const model = "gemini-2.5-flash";
const generativeModel = ai.getGenerativeModel({ model });

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    // Use generateContent method with a simple text message
    const response = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    // 👇 ADD THIS LINE TO SEE WHAT THE MODEL ACTUALLY SENT
   console.log("Vertex AI Raw Response:", JSON.stringify(response, null, 2));

    // Extract the text reply
    const reply = response.text;
    res.json({ reply });

  } catch (error) {
    console.error("Vertex AI error details:", error);
    res.status(500).json({
      error: "Vertex AI request failed",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));