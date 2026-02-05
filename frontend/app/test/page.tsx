"use client";

import React, { useEffect, useRef, useState } from "react";

const WebSocketChat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const userId = "12345"; // get this from login or JWT
    const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`); // replace with your server URL
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (wsRef.current && input.trim() !== "") {
      wsRef.current.send(input);
      setInput("");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>WebSocket Chat</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
        style={{ width: "70%", padding: "8px" }}
      />
      <button
        onClick={sendMessage}
        style={{ padding: "8px 16px", marginLeft: "5px" }}
      >
        Send
      </button>
    </div>
  );
};

export default WebSocketChat;
