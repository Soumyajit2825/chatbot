require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const cors = require('cors'); 
const Together = require('together-ai');

const app = express();
const port = 3001;

const together = new Together({
  apiKey: process.env.TOGETHER_AI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the AI Voice Assistant Server');
});

app.post('/api/command', async (req, res) => {
  const { prompt } = req.body;

  try {
    const stream = await together.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    let aiResponse = '';
    for await (const chunk of stream) {
      aiResponse += chunk.choices[0]?.delta?.content || '';
    }

    // Execute system commands based on the AI response
    if (aiResponse.toLowerCase().includes('open calculator')) {
      exec('calc', (err) => {
        if (err) {
          console.error(`Error opening calculator: ${err}`);
          return res.status(500).send('Failed to open calculator');
        }
        res.send('Calculator opened');
      });
    } else if (aiResponse.toLowerCase().includes('open youtube')) {
      exec('start https://www.youtube.com', (err) => {
        if (err) {
          console.error(`Error opening YouTube: ${err}`);
          return res.status(500).send('Failed to open YouTube');
        }
        res.send('YouTube opened');
      });
    } else {
      res.send(aiResponse);
    }
  } catch (error) {
    console.error(`Error processing command: ${error}`);
    res.status(500).send('Failed to process command');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});