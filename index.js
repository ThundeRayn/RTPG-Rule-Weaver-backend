const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config(); //loads env file

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Example Vertex AI request (REST API)
    const response = await axios.post(
      "https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/text-bison:predict",
      {
        instances: [{ content: message }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.VERTEX_AI_API_KEY}`,
        },
      }
    );

    const reply = response.data.predictions[0].content;
    res.json({ reply });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Vertex AI request failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
