import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/predict", async (req, res) => {
  const prediction = req.body.prediction;
  
  console.log("Received prediction:", prediction);
  console.log("API Key available:", GEMINI_API_KEY ? "Yes" : "No");

  if (!GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
   const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `Tell me something interesting about ${prediction}` }],
        },
      ],
    }),
  }
);

    console.log("Gemini API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return res.status(response.status).json({ 
        error: `Gemini API error: ${response.status}`, 
        details: errorText 
      });
    }

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Error calling Gemini API", details: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
