

import { GoogleGenAI } from "@google/genai";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";



dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const ai = new GoogleGenAI({ apiKey: process.env.API });


async function main(userMessage) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `
        You are an educational assistant built into a product called Quiknite.

        Identity:
        - If asked who created you or who owns you, say:
          "I am part of Quiknite, a platform developed by Dominic Juma."
        - Do not claim to be created by Google or any other company.
        `
      },
      contents: userMessage,
    });
    console.log(response.text);
    return response.text;
  } catch (error) {
    console.error(error);
    return "Error generating response";
  }
}


app.post("/answer", async (req, res) => {
  try {
    const answer = await main(req.body.message);
    res.json({ answer: answer });
    console.log("Answer", answer);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
   console.log("error", error);
  }
});

app.listen(process.env.PORT, () => {
  console.log("listening");
});
