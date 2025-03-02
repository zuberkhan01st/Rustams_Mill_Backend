const express = require('express');
const router = express.Router();
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({model:'gemini-1.5-pro'});

router.post('/chat',async (req,res)=>{
    try {
        const message = req.body.message;
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();
        res.status(200).json({ text: text });
    
      } catch (error) {
          console.error("Error generating text: ", error);
          throw error; 
      }


})

module.exports = router;