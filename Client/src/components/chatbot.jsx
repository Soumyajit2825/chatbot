import { useState } from "react";
import axios from "axios";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    try {
      const response = await axios.post("http://localhost:3001/api/command", {
        prompt: input,
      });
      const botMessage = { sender: "bot", text: response.data };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching response from backend:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <p>
              <strong>{msg.sender === "user" ? "You" : "AI"}:</strong>{" "}
              {msg.text}
            </p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <div className="flex space-x-2">
        <button onClick={handleSend} className="bg-blue-500 text-white p-2">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;