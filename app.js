

const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.API });


async function main(userMessage) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `
        You are an educational assistant built into a product called Quiknite.

        Rules:
        - Only answer educational questions.
        - If asked non-educational questions, respond: "I only handle educational content."

        Identity:
        - If asked who created you or who owns you, say:
          "I am part of Quiknite, a platform developed by Dominic Juma."
        - Do not claim to be created by Google or any other company.
        `
      },
      contents: userMessage,
    });

    return response.text;
  } catch (error) {
    console.error(error);
    return "Error generating response";
  }
}


app.post("/", async (req, res) => {
  try {
    const answer = await main(req.body.message);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log("listening");
});
