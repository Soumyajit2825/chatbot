import "dotenv/config";
import express from "express";
import { exec, execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = 3001;

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const WEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Sample trending commands for UI display
const trendingCommands = [
  "Tell me a joke",
  "What's the weather?",
  "Current tech trends",
  "Write a poem",
  "Explain quantum computing",
  "Give me a recipe",
  "Open YouTube",
  "What time is it?",
  "Tell me about AI",
  "Fun facts about space",
];

app.use(
  cors({
    origin: "http://localhost:5173", // Update this if your React app uses a different port
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("JARVIS AI Assistant Server Online");
});

app.get("/api/trendingcommands", (req, res) => {
  res.json(trendingCommands);
});

// Process text commands
app.post("/api/command", async (req, res) => {
  const { prompt } = req.body;
  const lowerPrompt = prompt.toLowerCase();

  try {
    // Process system commands first
    if (isSystemCommand(lowerPrompt)) {
      const response = await handleSystemCommand(lowerPrompt);
      return res.send(response);
    } else {
      // For general conversations, use Gemini
      const response = await generateGeminiResponse(prompt);
      return res.send(response);
    }
  } catch (error) {
    console.error(`Error processing command:`, error);
    res
      .status(500)
      .send(
        "I've encountered an issue processing your request, Sir. Please try again."
      );
  }
});

// Process voice commands
app.post("/api/voiceCommand", async (req, res) => {
  const { command } = req.body;
  console.log("Received voice command:", command);

  const lowerCaseCommand = command.toLowerCase();

  try {
    // Check if it's a system command
    if (isSystemCommand(lowerCaseCommand)) {
      const response = await handleSystemCommand(lowerCaseCommand);
      return res.send(response);
    } else {
      // For general conversations
      const response = await generateGeminiResponse(command);
      return res.send(response);
    }
  } catch (error) {
    console.error("Error processing voice command:", error);
    res
      .status(500)
      .send(
        "I apologize, Sir. I encountered an error processing your request."
      );
  }
});

// For opening applications
app.post("/api/openApp", (req, res) => {
  const { command } = req.body;

  exec(command, (error) => {
    if (error) {
      console.error(`Error opening application: ${error}`);
      return res.status(500).send(`Failed to open application`);
    }
    res.send("Application opened successfully");
  });
});

// Check if command is a system command
function isSystemCommand(command) {
  return (
    command.includes("open") ||
    command.includes("launch") ||
    command.includes("what time") ||
    command.includes("tell me a joke") ||
    command.includes("weather") ||
    command.includes("calculator") ||
    command.includes("notepad") ||
    command.includes("paint") ||
    command.includes("task manager") ||
    command.includes("control panel")
  );
}

// Handle system commands
async function handleSystemCommand(command) {
  // Open websites
  if (command.includes("open youtube") || command.includes("launch youtube")) {
    return openWebsite("YouTube", "https://www.youtube.com");
  }
  if (command.includes("open google") || command.includes("launch google")) {
    return openWebsite("Google", "https://www.google.com");
  }
  if (
    command.includes("open facebook") ||
    command.includes("launch facebook")
  ) {
    return openWebsite("Facebook", "https://www.facebook.com");
  }
  if (command.includes("open gmail") || command.includes("check email")) {
    return openWebsite("Gmail", "https://mail.google.com");
  }
  if (command.includes("open github") || command.includes("go to github")) {
    return openWebsite("GitHub", "https://github.com");
  }
  if (command.includes("open maps") || command.includes("show maps")) {
    return openWebsite("Google Maps", "https://maps.google.com");
  }
  if (command.includes("open twitter") || command.includes("go to twitter")) {
    return openWebsite("Twitter", "https://twitter.com");
  }

  // Time
  if (
    command.includes("what time") ||
    command.includes("tell me the time") ||
    command.includes("current time")
  ) {
    return getTime();
  }

  // Jokes
  if (
    command.includes("tell me a joke") ||
    command.includes("say something funny")
  ) {
    return tellJoke();
  }

  // Windows applications
  if (
    command.includes("open calculator") ||
    command.includes("launch calculator")
  ) {
    return openWindowsApp("Calculator", "calc");
  }
  if (command.includes("open notepad") || command.includes("launch notepad")) {
    return openWindowsApp("Notepad", "notepad");
  }
  if (command.includes("open paint") || command.includes("launch paint")) {
    return openWindowsApp("Paint", "mspaint");
  }
  if (
    command.includes("open control panel") ||
    command.includes("launch control panel")
  ) {
    return openWindowsApp("Control Panel", "control");
  }
  if (
    command.includes("open task manager") ||
    command.includes("launch task manager")
  ) {
    return openWindowsApp("Task Manager", "taskmgr");
  }

  if (command.includes("weather")) {
    async function getWeather() {
      try {
        const city = "Kolkata";
        const url = `${WEATHER_API_BASE_URL}?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Weather API response was not ok");
        }

        const data = await response.json();
        const temperature = Math.round(data.main.temp);
        const condition = data.weather[0].main;
        const description = data.weather[0].description;

        return `Current weather in ${city}: ${temperature}°C with ${description}. 
        Overall conditions are ${condition}, Sir.`;
      } catch (error) {
        console.error("Error fetching weather:", error);
        return "I apologize, Sir. I'm having trouble accessing the weather information at the moment.";
      }
    }
  }

  // If we got here, it wasn't recognized as a specific system command
  return generateGeminiResponse(command);
}

// Open website helper function
function openWebsite(siteName, url) {
  try {
    const { execSync } = require("child_process");
    console.log(`Opening ${siteName}...`);
    execSync(`cmd /c start ${url}`);
    return `Opening ${siteName} for you, Sir.`;
  } catch (err) {
    console.error(`Command execution error: ${err.message}`);
    return `I encountered an issue opening ${siteName}: ${err.message}`;
  }
}

// Open Windows application helper function
function openWindowsApp(appName, command) {
  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        console.error(`Error opening ${appName}: ${error}`);
        resolve(`I tried to open ${appName}, but encountered an issue.`);
      } else {
        resolve(`${appName} is now open, Sir.`);
      }
    });
  });
}

// Get current time helper function
function getTime() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  return `The time is ${time}, Sir.`;
}

// Tell joke helper function
function tellJoke() {
  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "How does Iron Man keep his suit clean? With a JARVIS-washing machine.",
    "What's a computer's favorite snack? Microchips.",
    "What do you call an AI that sings? Artificial harmonies.",
    "Why did the smartphone go to therapy? It had too many app-xiety issues.",
    "What did one server say to the other server? Want to join my private cloud?",
    "I would tell you a joke about artificial intelligence, but I'm afraid you wouldn't get it.",
    "Why did the computer show up late to work? It had a hard drive.",
    "What do you call it when your digital assistant takes control? A smart home invasion.",
  ];

  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  return joke;
}

export async function generateGeminiResponse(prompt) {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are JARVIS, Tony Stark's witty and intelligent AI assistant. Respond as a helpful, loyal assistant and call the user 'Soumyajit' occasionally. Be concise, informative, and add charm.",
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return "I apologize, Sir. My system seems to be experiencing some turbulence.";
  }
}

app.listen(port, () => {
  console.log(`JARVIS is now online at http://localhost:${port}`);
});
