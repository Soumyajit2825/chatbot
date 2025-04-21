import React, { useState, useEffect } from "react";

const Assistant = () => {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [textToSpeech, setTextToSpeech] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      if ("webkitSpeechRecognition" in window) {
        const newRecognition = new window.webkitSpeechRecognition();
        newRecognition.continuous = false;
        newRecognition.lang = "en-US";
        newRecognition.interimResults = false;
        newRecognition.maxAlternatives = 1;
        setRecognition(newRecognition);
      } else {
        throw new Error("Speech recognition not supported in this browser.");
      }

      if ("speechSynthesis" in window) {
        setTextToSpeech(window.speechSynthesis);
      } else {
        throw new Error("Speech synthesis not supported in this browser.");
      }
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: error.message, sender: "server" },
      ]);
    }
  }, []);

  useEffect(() => {
    if (recognition) {
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Recognized speech:", transcript);
        // Here you would send the transcript to the server
        sendMessageToServer(transcript);
      };

      recognition.onstart = () => {
        setIsRecording(true);
        console.log("Voice recognition started.");
      };

      recognition.onend = () => {
        setIsRecording(false);
        console.log("Voice recognition ended.");
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };
    }
  }, [recognition]);

  const startRecording = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const sendMessageToServer = async (message) => {
    if (isLoading) return;

    setIsLoading(true);

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, sender: "user" },
    ]);
    setMessageInput("");

    try {
      const response = await fetch("http://localhost:3001/api/voiceCommand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ command: message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update messages with server response
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data, sender: "server" },
      ]);

      // Handle text-to-speech
      if (textToSpeech) {
        const utterance = new SpeechSynthesisUtterance(data);
        textToSpeech.speak(utterance);
      }
    } catch (error) {
      console.error("Error sending message to server:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Sorry, there was an error processing your request.",
          sender: "server",
        },
      ]);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>
      <div className="mb-4">
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
        >
          {isLoading
            ? "Processing..."
            : isRecording
            ? "Stop Recording"
            : "Start Recording"}
        </button>
        <p className="text-gray-500 text-sm mt-2">
          {isRecording ? "Recording..." : "Click to start recording"}
        </p>
      </div>
      <div className="mb-4">
        {messages.map((msg, index) => (
          <p
            key={index}
            className={msg.sender === "user" ? "text-right" : "text-left"}
          >
            {msg.text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Assistant;
