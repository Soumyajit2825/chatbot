import { useState } from "react";
import { Send, User, Bot } from "lucide-react";
import axios from "axios";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    // Simulating AI response
    try {
        const response = await axios.post("http://localhost:3001/api/command", {
          prompt: input,
        });
        const botMessage = { sender: "bot", text: response.data };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error("Error fetching response from backend:", error);
      }
  
      setInput("");
    };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-y-hidden">
      <div className="flex-1 overflow-y-hidden p-4 border-gray border-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end space-x-2 mb-4 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <Bot size={24} className="text-gray-600 mb-2" />
            )}
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              } shadow-md`}
            >
              {msg.text}
            </div>
            {msg.sender === "user" && (
              <User size={24} className="text-blue-500 mb-2" />
            )}
          </div>
        ))}
      </div>
      <div className="bg-white p-4 shadow-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;