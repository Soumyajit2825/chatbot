import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const Assistant = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(null);
  const [isRecording, setIsRecording] = useState(false); // UI feedback for recording state
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastWakeWordTime, setLastWakeWordTime] = useState(null);
  const messagesEndRef = useRef(null);
  const commandExecutedRef = useRef(false); // Flag to track if a predefined command ran
  const listeningAfterWakeWordRef = useRef(false); // Flag to track if listening for a command post-wake word

  // --- Command Handler Wrapper ---
  // Wraps original handlers to set the commandExecuted flag
  const createCommandHandler = (handler, ...args) => {
    return () => {
      console.log(
        `Command matched, executing: ${handler.name || "anonymous handler"}`
      );
      commandExecutedRef.current = true; // Mark command as executed
      listeningAfterWakeWordRef.current = false; // End command mode
      handler(...args); // Call the original handler
      resetTranscript(); // Clear transcript after handling command
    };
  };

  // --- Define Voice Commands ---
  const commands = [
    {
      command: ["open youtube", "go to youtube", "launch youtube"],
      callback: createCommandHandler(
        handleOpenWebsite,
        "YouTube",
        "https://www.youtube.com"
      ),
      matchInterim: false,
    },
    {
      command: ["open google", "go to google", "launch google"],
      callback: createCommandHandler(
        handleOpenWebsite,
        "Google",
        "https://www.google.com"
      ),
      matchInterim: false,
    },
    {
      command: ["open facebook", "go to facebook", "launch facebook"],
      callback: createCommandHandler(
        handleOpenWebsite,
        "Facebook",
        "https://www.facebook.com"
      ),
      matchInterim: false,
    },
    {
      command: ["open gmail", "check email"],
      callback: createCommandHandler(
        handleOpenWebsite,
        "Gmail",
        "https://mail.google.com"
      ),
      matchInterim: false,
    },
    {
      command: ["open github", "go to github"],
      callback: createCommandHandler(
        handleOpenWebsite,
        "GitHub",
        "https://github.com"
      ),
      matchInterim: false,
    },
    {
      command: ["open maps", "show maps"],
      callback: createCommandHandler(
        handleOpenWebsite,
        "Google Maps",
        "https://maps.google.com"
      ),
      matchInterim: false,
    },
    {
      command: ["open twitter", "go to twitter"],
      callback: createCommandHandler(
        handleOpenWebsite,
        "Twitter",
        "https://twitter.com"
      ),
      matchInterim: false,
    },
    {
      command: ["what time is it", "tell me the time", "current time"],
      callback: createCommandHandler(handleGetTime),
      matchInterim: false,
    },
    {
      command: ["tell me a joke", "say something funny"],
      callback: createCommandHandler(handleTellJoke),
      matchInterim: false,
    },
    {
      command: ["open calculator", "launch calculator"],
      callback: createCommandHandler(
        handleOpenApplication,
        "Calculator",
        "calc"
      ),
      matchInterim: false,
    },
    {
      command: ["open notepad", "launch notepad"],
      callback: createCommandHandler(
        handleOpenApplication,
        "Notepad",
        "notepad"
      ),
      matchInterim: false,
    },
    {
      command: ["open paint", "launch paint"],
      callback: createCommandHandler(handleOpenApplication, "Paint", "mspaint"),
      matchInterim: false,
    },
    {
      command: ["open control panel", "launch control panel"],
      callback: createCommandHandler(
        handleOpenApplication,
        "Control Panel",
        "control"
      ),
      matchInterim: false,
    },
    {
      command: ["open task manager", "launch task manager"],
      callback: createCommandHandler(
        handleOpenApplication,
        "Task Manager",
        "taskmgr"
      ),
      matchInterim: false,
    },
    {
      command: ["jarvis", "hey jarvis", "okay jarvis"], // Wake word
      callback: () => {
        const now = Date.now();
        // Debounce wake word detection (e.g., 1.5 second cooldown)
        if (now - (lastWakeWordTime || 0) > 1500) {
          console.log("Wake word detected");
          setLastWakeWordTime(now);
          handleWakeWord();
        } else {
          console.log("Wake word detected too soon, debouncing.");
        }
      },
      matchInterim: false, // Match only final wake word phrase
      isFuzzyMatch: true, // Allow slight mispronunciations
      fuzzyMatchingThreshold: 0.8, // Adjust threshold as needed
    },
  ];

  // --- Speech Recognition Hook ---
  const {
    transcript, // Current interim transcript
    listening, // Boolean: Is microhpone actively listening?
    resetTranscript, // Function to clear the transcript
    browserSupportsSpeechRecognition, // Boolean: Browser capability
    finalTranscript, // Transcript available after listening stops
  } = useSpeechRecognition({ commands });

  // --- Initialization Effect (Speech Synthesis & Welcome) ---
  useEffect(() => {
    if (!isInitialized) {
      // Check for speech synthesis availability
      if ("speechSynthesis" in window) {
        setTextToSpeech(window.speechSynthesis);

        // Ensure voices are loaded before trying to use them
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            console.log(
              "Voices loaded:",
              voices.map((v) => `${v.name} (${v.lang})`)
            );
            // Add welcome message after a slight delay after voices are loaded
            setTimeout(() => {
              const welcomeMessage =
                "JARVIS online. How may I assist you today, Soumyajit?";
              setMessages([{ text: welcomeMessage, sender: "assistant" }]);
              speakResponse(welcomeMessage);
            }, 500);
          } else {
            console.log("Waiting for voices to load...");
            // Some browsers load voices asynchronously, try again shortly
            setTimeout(loadVoices, 150);
          }
        };

        // Add event listener for browsers where voices load async
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices(); // Initial attempt
      } else {
        console.error("Speech synthesis not supported in this browser.");
        setMessages([
          {
            text: "Speech synthesis not supported in this browser.",
            sender: "system",
          },
        ]);
      }
      setIsInitialized(true);
    }
    // Ensure synth object is stable or add it to dependencies if needed
  }, [isInitialized]);

  // --- Auto-scroll Effect ---
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // --- Action Handlers ---

  // Handle Website Navigation
  function handleOpenWebsite(siteName, url) {
    const message = `Opening ${siteName}, Soumyajit.`;
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: `Open ${siteName}`, sender: "user" },
      { text: message, sender: "assistant" },
    ]);
    speakResponse(message);
    window.open(url, "_blank");
    // resetTranscript(); // Now handled by wrapper
  }

  // Handle Time Requests
  function handleGetTime() {
    const now = new Date();
    const time = now.toLocaleTimeString("en-IN", {
      // Use Indian locale if preferred
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    const message = `The current time is ${time}, Soumyajit.`;
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: "What time is it?", sender: "user" },
      { text: message, sender: "assistant" },
    ]);
    speakResponse(message);
    // resetTranscript(); // Now handled by wrapper
  }

  // Handle Joke Requests (using backend)
  function handleTellJoke() {
    setMessages((prev) => [
      ...prev,
      { text: "Tell me a joke", sender: "user" },
    ]);
    setIsLoading(true);
    fetch("http://localhost:3001/api/voiceCommand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: "tell me a joke" }),
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`Joke fetch failed: ${response.statusText}`);
        return response.text();
      })
      .then((joke) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: joke, sender: "assistant" },
        ]);
        speakResponse(joke);
      })
      .catch((error) => {
        console.error("Error getting joke:", error);
        const errorMessage =
          "I seem to have forgotten all my jokes, Soumyajit.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: errorMessage, sender: "assistant" },
        ]);
        speakResponse(errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
        // resetTranscript(); // Now handled by wrapper
      });
  }

  // Handle Application Opening (using backend)
  function handleOpenApplication(appName, command) {
    const message = `Opening ${appName}, Soumyajit.`;
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: `Open ${appName}`, sender: "user" },
      { text: message, sender: "assistant" },
    ]);

    // Send request to server to open application
    fetch("http://localhost:3001/api/openApp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    })
      .then((response) => {
        if (!response.ok) {
          console.error(
            `Server error opening ${appName}: ${response.statusText}`
          );
          // Optionally notify user about backend failure
          speakResponse(
            `I encountered an issue trying to open ${appName}, Soumyajit.`
          );
        }
      })
      .catch((error) => {
        console.error(`Workspace error opening ${appName}:`, error);
        speakResponse(
          `I couldn't reach the service to open ${appName}, Soumyajit.`
        );
      });

    speakResponse(message); // Speak confirmation immediately
    // resetTranscript(); // Now handled by wrapper
  }

  // --- Speech Synthesis ---
  const speakResponse = (text) => {
    if (textToSpeech && text) {
      // Cancel any ongoing speech immediately to prevent overlap
      textToSpeech.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Attempt to find a suitable male voice (customize as needed)
      const voices = textToSpeech.getVoices();
      // Try specific, often higher-quality voices first
      let chosenVoice = voices.find(
        (voice) => voice.name === "Microsoft David - English (United States)"
      );
      if (!chosenVoice)
        chosenVoice = voices.find(
          (voice) => voice.name === "Google UK English Male"
        );
      // Fallback to more generic search
      if (!chosenVoice) {
        chosenVoice = voices.find(
          (voice) =>
            voice.lang.startsWith("en") &&
            (voice.name.includes("Male") ||
              voice.name.includes("David") ||
              voice.name.includes("Mark") ||
              voice.name.includes("James"))
        );
      }
      // Final fallback to the first available English voice or default
      if (!chosenVoice)
        chosenVoice = voices.find((voice) => voice.lang.startsWith("en"));

      if (chosenVoice) {
        console.log("Using voice:", chosenVoice.name);
        utterance.voice = chosenVoice;
      } else {
        console.log("Suitable English voice not found, using browser default.");
      }

      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch

      // Optional: Log errors or completion
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
      };
      utterance.onend = () => {
        console.log("Speech finished for:", text.substring(0, 40) + "...");
      };

      textToSpeech.speak(utterance);
    } else if (!text) {
      console.warn("speakResponse called with empty text.");
    } else {
      console.error("Speech synthesis not available or not initialized.");
    }
  };

  // --- Wake Word Handler ---
  const handleWakeWord = () => {
    console.log("Handling wake word activation...");
    // Stop continuous background listening if it's active
    // Use abortListening for a more immediate stop if needed
    if (listening) {
      SpeechRecognition.stopListening();
    }

    // Reset transcript & flags before responding/listening again
    resetTranscript();
    commandExecutedRef.current = false;

    // Respond to wake word
    speakResponse("Yes, Soumyajit?");

    // Flag that we are now listening for a command
    listeningAfterWakeWordRef.current = true;

    // Start listening specifically for a command AFTER speaking completes (approx)
    setTimeout(() => {
      console.log("Starting to listen for command after wake word response.");
      handleVoiceInput(true); // Pass flag indicating this is post-wake-word
    }, 1500); // Delay to allow TTS to potentially finish
  };

  // --- Voice Input Trigger ---
  // This function primarily STARTS the listening process.
  // The result processing happens via callbacks or the useEffect below.
  const handleVoiceInput = async (isWakeWordTriggered = false) => {
    // Prevent starting if already listening (can happen with rapid clicks/triggers)
    if (listening) {
      console.log("Already listening, ignoring duplicate request.");
      return;
    }

    console.log(
      `handleVoiceInput called. Is wake word triggered: ${isWakeWordTriggered}`
    );
    setIsRecording(true); // Update UI button state/visuals
    commandExecutedRef.current = false; // Reset command flag for this new session
    resetTranscript(); // Clear any previous transcript remnants

    try {
      // Start listening for a single phrase/command (non-continuous)
      // Specify language for potentially better accuracy (e.g., 'en-IN', 'en-US', 'en-GB')
      await SpeechRecognition.startListening({
        continuous: false,
        language: "en-IN",
      });
      console.log("Started listening for command (continuous: false)...");
    } catch (error) {
      console.error("Speech recognition error on start:", error);
      setIsRecording(false); // Reset UI on error
      listeningAfterWakeWordRef.current = false; // Reset command mode flag on error
      speakResponse("There was an error starting the microphone, Soumyajit.");
      // Consider specific error handling, e.g., permissions
      if (error.error === "not-allowed" || error.error === "security") {
        speakResponse(
          "Microphone access seems blocked. Please check browser permissions."
        );
      }
    }
  };

  // --- Effect to Handle End of Listening & Process Results ---
  useEffect(() => {
    // Update the visual recording state based on the library's listening status
    setIsRecording(listening);

    if (!listening) {
      // --- Processing logic when listening has stopped ---
      if (
        finalTranscript &&
        listeningAfterWakeWordRef.current &&
        !commandExecutedRef.current
      ) {
        // Case 1: Listening stopped after wake word, got final transcript, but NO predefined command matched.
        console.log(
          `Listening stopped. No command matched. Final transcript: "${finalTranscript}"`
        );
        handleServerQuery(finalTranscript); // Send to backend as a general query
      } else if (commandExecutedRef.current) {
        // Case 2: Listening stopped, and a predefined command WAS executed.
        console.log("Listening stopped. Command callback was executed.");
        // Flag is reset within the wrapper, but ensure command mode flag is off
        listeningAfterWakeWordRef.current = false;
      } else if (listeningAfterWakeWordRef.current && !finalTranscript) {
        // Case 3: Listening stopped after wake word, but no speech was detected (or recognized).
        console.log(
          "Listening stopped after wake word, but no final transcript captured."
        );
        speakResponse("Sorry, I didn't catch that, Soumyajit.");
        listeningAfterWakeWordRef.current = false; // Exit command mode
      } else {
        // Case 4: Listening stopped for other reasons (e.g., manual stop, background stop)
        // or initial state before first interaction. Usually requires no action here.
        console.log(
          `Listening stopped. Mode: ${
            listeningAfterWakeWordRef.current ? "Command" : "Background"
          }, Command Ran: ${commandExecutedRef.current}, FinalTranscript: ${
            finalTranscript ? '"' + finalTranscript + '"' : "Empty"
          }`
        );
      }

      // --- Reset flags and potentially restart background listening ---
      commandExecutedRef.current = false; // Ensure flag is reset for next interaction

      // If listening stopped and we are NOT in command mode anymore, restart background listening.
      if (
        !listeningAfterWakeWordRef.current &&
        browserSupportsSpeechRecognition &&
        isInitialized
      ) {
        // Add a small delay to prevent immediate restart issues or conflicts
        const restartTimer = setTimeout(() => {
          startBackgroundListening();
        }, 500); // 500ms delay before restarting background listener
        return () => clearTimeout(restartTimer); // Cleanup timer if effect re-runs quickly
      }
    }
  }, [
    listening,
    finalTranscript,
    browserSupportsSpeechRecognition,
    isInitialized,
  ]); // Dependencies for this effect

  // --- Background Listening Management ---
  const startBackgroundListening = async () => {
    // Only start if not already listening, browser supports it, and not in command mode
    if (
      !listening &&
      browserSupportsSpeechRecognition &&
      !listeningAfterWakeWordRef.current
    ) {
      console.log(
        "Attempting to start background listening (continuous: true)..."
      );
      try {
        // Optional: Abort previous session if any lingering state exists, though stopListening should handle it.
        // await SpeechRecognition.abortListening();
        resetTranscript(); // Clear transcript before starting background listening
        await SpeechRecognition.startListening({
          continuous: true,
          language: "en-IN",
        }); // Continuous for wake word
        console.log("Background listening started successfully.");
      } catch (error) {
        console.error("Error starting background listening:", error);
        // Handle cases like microphone permission denied after initial load
        if (error.error === "not-allowed" || error.error === "security") {
          // Avoid speaking if synth isn't ready or spamming errors
          // Maybe update UI instead?
          console.error(
            "Microphone access is blocked for background listening."
          );
          setMessages((prev) => [
            ...prev,
            {
              text: "Microphone access issue. Cannot listen for wake word.",
              sender: "system",
            },
          ]);
        } else if (error.error === "aborted") {
          console.log(
            "Background listening start aborted, likely due to rapid restart."
          );
        } else if (error.error === "audio-capture") {
          console.error("Background listening failed - audio capture issue.");
          setMessages((prev) => [
            ...prev,
            {
              text: "Audio capture problem. Cannot listen for wake word.",
              sender: "system",
            },
          ]);
        } else {
          // Generic error
          setMessages((prev) => [
            ...prev,
            {
              text: "Issue activating background listening.",
              sender: "system",
            },
          ]);
        }
      }
    } else {
      // Log why background listening wasn't started
      if (listening)
        console.log("Skipping background listening start: Already listening.");
      if (!browserSupportsSpeechRecognition)
        console.log(
          "Skipping background listening start: Browser not supported."
        );
      if (listeningAfterWakeWordRef.current)
        console.log("Skipping background listening start: In command mode.");
    }
  };

  // Start background listening initially after initialization & handle unmount
  useEffect(() => {
    if (isInitialized && browserSupportsSpeechRecognition) {
      console.log("Component initialized, starting background listening.");
      startBackgroundListening();
    }

    // Cleanup function to stop listening when the component unmounts
    return () => {
      if (browserSupportsSpeechRecognition) {
        console.log("Component unmounting, stopping all listening.");
        // Use abort for a more immediate stop than stopListening
        SpeechRecognition.abortListening();
      }
    };
  }, [isInitialized, browserSupportsSpeechRecognition]); // Dependencies for initial start/unmount

  // --- General Query Handler (Backend) ---
  const handleServerQuery = async (query) => {
    // Prevent empty queries or sending while already loading
    if (!query || query.trim().length === 0 || isLoading) {
      console.log(
        `Skipping server query. Query: "${query}", Loading: ${isLoading}`
      );
      listeningAfterWakeWordRef.current = false; // Still exit command mode
      resetTranscript();
      return;
    }

    console.log(`Sending general query to server: "${query}"`);
    setIsLoading(true);
    listeningAfterWakeWordRef.current = false; // Ensure we exit command mode

    // Add user message immediately to UI
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: query, sender: "user" },
    ]);
    // Reset transcript now that it's captured and being processed
    resetTranscript();

    try {
      const response = await fetch("http://localhost:3001/api/voiceCommand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json", // Indicate expected response type if applicable
        },
        // credentials: "include", // Uncomment if your backend requires cookies/auth session
        body: JSON.stringify({ command: query }),
      });

      if (!response.ok) {
        // Handle HTTP errors (e.g., 404, 500)
        throw new Error(
          `HTTP error! status: ${response.status} ${response.statusText}`
        );
      }

      // Assuming the backend sends back plain text response
      const data = await response.text();

      // Add assistant response to UI
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data || "[Received empty response]", sender: "assistant" }, // Handle empty but OK response
      ]);
      // Speak the response
      speakResponse(data || "I received a response, but it was empty.");
    } catch (error) {
      console.error("Error sending message to server:", error);
      const errorMessage =
        "My apologies, Soumyajit. I encountered an error trying to process that request.";
      // Add error message to UI
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: errorMessage, sender: "assistant" },
      ]);
      // Speak the error message
      speakResponse(errorMessage);
    } finally {
      // Ensure loading state is turned off regardless of success or error
      setIsLoading(false);
      // Make sure transcript is clear after processing attempt
      resetTranscript();
    }
  };

  // --- Browser Support Check ---
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
        <h1 className="text-3xl font-bold mb-4 text-red-400">
          J.A.R.V.I.S. Offline
        </h1>
        <p>Unfortunately, your browser does not support the Web Speech API.</p>
        <p className="mt-2 text-sm text-gray-400">
          Please try using Google Chrome or Microsoft Edge.
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Also ensure microphone access has been granted if prompted.
        </p>
      </div>
    );
  }

  // --- Component Rendering ---
  return (
    <div className="p-4 flex flex-col items-center justify-center h-screen bg-gray-900 text-white font-sans">
      {" "}
      {/* Added font */}
      <div className="w-full max-w-2xl flex flex-col h-full bg-gray-850 shadow-2xl rounded-lg overflow-hidden">
        {" "}
        {/* Added bg, shadow, rounded */}
        {/* Header */}
        <div className="p-3 bg-gradient-to-r from-blue-800 to-indigo-900 text-center shadow-md">
          <h1 className="text-2xl font-bold text-blue-200 tracking-wider">
            J.A.R.V.I.S.
          </h1>
        </div>
        {/* Message Display Area */}
        <div
          className="flex-grow w-full p-4 bg-gray-800 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 260px)" }}
        >
          {" "}
          {/* Adjusted max height calculation */}
          {messages.length === 0 && !isInitialized ? (
            <p className="text-gray-400 text-center italic">
              Initializing JARVIS interface... Please wait.
            </p>
          ) : messages.length === 0 && isInitialized ? (
            <p className="text-gray-400 text-center italic">
              Awaiting your command, Soumyajit.
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 p-3 rounded-lg clear-both max-w-[80%] ${
                  msg.sender === "user"
                    ? "ml-auto float-right bg-blue-900 text-white text-right shadow" /* User style */
                    : msg.sender === "system"
                    ? "mx-auto bg-red-900 text-gray-200 text-center shadow text-xs italic py-2" /* System style */
                    : "mr-auto float-left bg-gray-700 text-gray-100 text-left shadow" /* Assistant style */
                }`}
              >
                <p className="text-sm break-words">{msg.text}</p>{" "}
                {/* Ensure long words wrap */}
              </div>
            ))
          )}
          {/* Invisible element to trigger scroll */}
          <div ref={messagesEndRef} style={{ height: "1px" }} />
        </div>
        {/* Controls and Info Area */}
        <div className="p-4 border-t border-gray-700 bg-gray-850">
          {/* Listening Indicator / Transcript */}
          <div className="h-8 mb-3 text-center">
            {" "}
            {/* Fixed height container */}
            {listening && transcript && (
              <div className="p-1 bg-gray-700 rounded-lg inline-block">
                <p className="text-blue-300 text-sm px-2 animate-pulse">
                  Listening... "{transcript}"
                </p>
              </div>
            )}
            {/* Briefly show final transcript if it wasn't a matched command */}
            {!listening &&
              finalTranscript &&
              !commandExecutedRef.current &&
              !isLoading &&
              listeningAfterWakeWordRef.current && (
                <div className="p-1 bg-gray-600 rounded-lg inline-block">
                  <p className="text-gray-300 text-xs italic px-2">
                    {/* You said: "{finalTranscript}" */}{" "}
                    {/* Can uncomment if needed */}
                  </p>
                </div>
              )}
          </div>

          {/* Action Button */}
          <div className="flex justify-center items-center mb-3">
            <button
              title={listening ? "Stop Listening" : "Start Listening (Manual)"}
              className={`bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ${
                isLoading ? "opacity-50 cursor-not-allowed" : "opacity-100"
              } ${
                listening
                  ? "ring-2 ring-red-500 ring-offset-2 ring-offset-gray-850"
                  : ""
              }`} // Ring effect when listening
              onClick={() => {
                if (isLoading) return; // Don't do anything if processing
                if (listening) {
                  SpeechRecognition.stopListening();
                  console.log("Manual stop listening requested via button.");
                } else {
                  listeningAfterWakeWordRef.current = true; // Treat button press like wake word activation
                  handleVoiceInput(false); // Start listening for a command
                }
              }}
              disabled={isLoading} // Disable only when processing backend request
            >
              {/* Microphone Icon */}
              <svg
                className={`w-7 h-7 transition-colors ${
                  listening ? "text-red-400 animate-pulse" : "text-white"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z"
                  clipRule="evenodd"
                />{" "}
                {/* Simple mic icon */}
              </svg>
              {/* Loading Spinner Overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="animate-spin h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Status Text */}
          <p className="text-gray-400 text-xs text-center h-4">
            {" "}
            {/* Fixed height */}
            {isLoading
              ? "Processing..."
              : listening
              ? "Listening..."
              : 'Say "Hey JARVIS" or click the button'}
          </p>

          {/* Example Commands (Optional Section) */}
          <div className="text-xs text-gray-500 text-center mt-4 border-t border-gray-700 pt-3">
            <span className="font-semibold mb-1 block">Example Commands:</span>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 max-w-md mx-auto">
              <span>"Open YouTube"</span>
              <span>"What time is it?"</span>
              <span>"Tell me a joke"</span>
              <span>"Open Calculator"</span>
              <span>"Who are you?"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
