const express = require("express");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

let resumeText = "";

// Load and extract text from the resume
fs.readFile("./Resume.pdf", async (err, data) => {
  if (err) {
    console.error("❌ Error reading PDF:", err);
    return;
  }
  const parsed = await pdfParse(data);
  resumeText = parsed.text;
  console.log("✅ Resume loaded successfully. First 500 chars:");
  console.log(resumeText.substring(0, 4000)); // Log a sample
});

// API to return the extracted resume text
app.get("/resume-text", (req, res) => {
  res.json({ text: resumeText });
});

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// API to interact with Gemini model
app.post("/chat", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  if (!resumeText) {
    return res
      .status(500)
      .json({ error: "Resume text not loaded yet. Try again later." });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // you can also use gemini-1.5-pro for more powerful responses
    });

    const prompt = `You are a resume assistant. Here is Anil's resume:\n${resumeText}\n\nQuestion: ${question}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });
  } catch (error) {
    console.error("❌ Error communicating with Gemini:", error.message);
    res.status(500).json({ error: "Failed to get response from Gemini AI" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



// const express = require("express");
// const fs = require("fs");
// const pdfParse = require("pdf-parse");
// const cors = require("cors");
// const axios = require("axios");
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// let resumeText = "";

// // Load and extract text from the resume
// fs.readFile("./Resume.pdf", async (err, data) => {
//     if (err) {
//       console.error("❌ Error reading PDF:", err);
//       return;
//     }
//     const parsed = await pdfParse(data);
//     resumeText = parsed.text;
//     console.log("✅ Resume loaded successfully. First 500 chars:");
//     console.log(resumeText.substring(0, 500)); // Log a sample
//   });
  

// // API to return the extracted resume text
// app.get("/resume-text", (req, res) => {
//   res.json({ text: resumeText });
// });

// // API to interact with Together AI's model
// app.post("/chat", async (req, res) => {
//     const { question } = req.body;
  
//     if (!question) {
//       return res.status(400).json({ error: "Question is required" });
//     }
  
//     if (!resumeText) {
//       return res.status(500).json({ error: "Resume text not loaded yet. Try again later." });
//     }
  
//     try {
//       const response = await axios.post(
//         "https://api.together.xyz/v1/chat/completions",
//         {
//           model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
//           messages: [
//             { role: "system", content: `You are a resume assistant. Here is Anil's resume:\n${resumeText}` },
//             { role: "user", content: question }
//           ],
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.TOGETHER_AI_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
  
//       res.json({ answer: response.data.choices[0].message.content });
//     } catch (error) {
//       console.error("❌ Error communicating with AI:", error.response?.data || error.message);
//       res.status(500).json({ error: "Failed to get response from AI" });
//     }
//   });
  

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


