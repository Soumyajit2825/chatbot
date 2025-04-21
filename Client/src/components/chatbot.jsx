import { useState, useEffect } from "react";
import { Send, User, Bot } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [trendingCommands, setTrendingCommands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commandsLoading, setCommandsLoading] = useState(true);

  useEffect(() => {
    // Fetch trending commands when component mounts
    const fetchTrendingCommands = async () => {
      setCommandsLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:3001/api/trendingcommands"
        );
        console.log("Fetched trending commands:", response.data);
        setTrendingCommands(response.data);
      } catch (error) {
        console.error("Error fetching trending commands:", error);
      } finally {
        setCommandsLoading(false);
      }
    };

    fetchTrendingCommands();
  }, []);

  // Handle trending command clicks
  const handleTrendingCommand = (command) => {
    setInput(command);
    handleSend(command);
  };

  const handleSend = async (customInput = null) => {
    const messageText = customInput || input;
    if (messageText.trim() === "") return;

    const userMessage = { sender: "user", text: messageText };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/api/command", {
        prompt: messageText,
      });
      const botMessage = { sender: "bot", text: response.data };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching response from backend:", error);
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I encountered an error processing your request. Please try again.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-semibold mb-2">AI Assistant</h2>
              <p>Ask me anything or try one of the trending commands below.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end space-x-2 mb-4 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <Bot size={24} className="text-gray-600 mt-1" />
              )}
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800"
                } shadow-md`}
              >
                {msg.sender === "bot" ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
              {msg.sender === "user" && (
                <User size={24} className="text-blue-500 mt-1" />
              )}
            </div>
          ))
        )}
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-2 mb-4">
            <Bot size={24} className="text-gray-600 mt-1" />
            <div className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with trending commands and input */}
      <div className="border-t border-gray-200 bg-white p-4">
        {/* Trending commands section */}
        {commandsLoading ? (
          <div className="mb-4 text-center text-sm text-gray-500">
            Loading trending commands...
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {trendingCommands.map((command, index) => (
                <button
                  key={index}
                  onClick={() => handleTrendingCommand(command)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full 
                           hover:bg-blue-200 transition-colors duration-200 mb-1"
                >
                  {command}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading}
            className={`text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
