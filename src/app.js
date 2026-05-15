

import { GoogleGenAI } from "@google/genai";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import  mediasoup from "mediasoup";
import WebSocket from "ws"
import http from "http";





dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


app.use(express.json());
app.use(cors());
const ai = new GoogleGenAI({ apiKey: process.env.API });
async function media() {
const worker = await mediasoup.createWorker();
const router = await worker.createRouter({
 mediaCodecs: [
 { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2},
 { kind: "video", mimeType: "video/VP8", clockRate: 90000 }
  ]
 });

 wss.on("connection", (ws) => {
 ws.on("message", (message) => {
 const data = JSON.parse(message);

 if (data.type === "getRtpCapabilities") {
 ws.send(JSON.stringify({
 type: "rtpCapabilities",
 rtpCapabilities: router.getRtpCapabilities()
  }));
 }
   });
  });
}

media();


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
 console.log(error);
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

server.listen(process.env.PORT, () => {
  console.log("listening");
});
