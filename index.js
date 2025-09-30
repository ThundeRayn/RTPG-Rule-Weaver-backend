const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import Vertex AI client
const { PredictionServiceClient } = require("@google-cloud/aiplatform").v1;

// Initialize Vertex AI client
const client = new PredictionServiceClient({
  keyFilename: "vertex-AI-account-key-rule-weaver.json", // path to your JSON key json file
});

const project = "vertex-chatbot-sa"; // your GCP project ID
const location = "us-central1"; // adjust if needed
const endpoint = `projects/${project}/locations/${location}/publishers/google/models/text-bison`;

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const [response] = await client.predict({
      endpoint,
      instances: [{ content: message }],
    });

    // Vertex AI returns predictions array
    const reply = response.predictions[0].content;
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Vertex AI request failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
