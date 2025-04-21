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

const allowedOrigins = ['https://5173-idx-chatbot-1745212439037.cluster-6dx7corvpngoivimwvvljgokdw.cloudworkstations.dev/'];

app.use(cors({
  origin: function(origin, callback){
    if(!origin || allowedOrigins.includes(origin)){
      callback(null, true);
    }else{
      callback(new Error('Not allowed by CORS'));
    }}}));
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

// Modifying handle_open_youtube
function handle_open_youtube() {
  const command = 'open https://www.youtube.com'; // macOS command

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error opening YouTube: ${error}`);
    }
  });
  console.log('Opening YouTube...');
  return 'Opening YouTube...';
}

function handle_get_time() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const formattedTime = `The time is ${time}`;
    console.log(formattedTime);
    return formattedTime;
}

function handle_get_weather() {
  const city = "Kolkata"; // Default location
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

  return fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const temperature = data.main.temp;
      const conditions = data.weather[0].description;
      const humidity = data.main.humidity;
      const formattedWeather = `The weather in ${city} is currently ${temperature} degrees Fahrenheit, ${conditions} with humidity of ${humidity}%.`;
      console.log(formattedWeather);
      return formattedWeather;
    })
    .catch(error => {
      console.error("Error fetching weather:", error);
      return "Sorry, I couldn't fetch the weather information right now.";
    });
}


async function get_weather_response() {
  const weather = await handle_get_weather()
  return weather
}

app.post('/api/voiceCommand', (req, res) => {
  const { command } = req.body;
  console.log('Received voice command:', command);
  
  const lowerCaseCommand = command.toLowerCase();
  let action = null;
  let responseMessage = "I didn't understand that command.";
  
  // Rule-based NLU
  if (lowerCaseCommand.includes("open youtube")) {
    action = "open_youtube";
  } else if (lowerCaseCommand.includes("what time is it") || lowerCaseCommand.includes("tell me the time")) {
    action = "get_time";
  } else if (lowerCaseCommand.includes("what's the weather") || lowerCaseCommand.includes("fetch weather")) {
    action = "get_weather";
  }

  // Execute action and generate response
  switch (action) {
    case "open_youtube":
      responseMessage = handle_open_youtube();
      break;
    case "get_time":
      responseMessage = handle_get_time();
      break;
    case "get_weather":
      get_weather_response().then(weather_response => res.send(weather_response))
      break;
    default:
        responseMessage = "I didn't understand that command.";
      break;
  }

  res.send(responseMessage);
}); 

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
