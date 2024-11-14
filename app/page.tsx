// pages/index.tsx
'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const Home = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleSignup = async () => {
    try {
      await axios.post('http://localhost:3001/api/signup', { username, password });
      setMessage('Signup successful, please login');
    } catch (err) {
      setMessage('Error: ' + err.response.data.error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/login', { username, password });
      setIsLoggedIn(true);
      setMessage('Login successful');
      const socketConnection = io('http://localhost:3001');
      setSocket(socketConnection);
      socketConnection.emit('joinRoom', response.data.username);
      socketConnection.on('connect', () => {
        console.log('Connected to socket server:', socketConnection.id);
      });
      socketConnection.on('message', (msg) => {
        console.log('Received message:', msg);
        setMessages((prevMessages) => [...prevMessages, msg]);
      });
    } catch (err) {
      setMessage('Error: ' + err.response.data.error);
    }
  };

  const handleSendMessage = () => {
    if (socket && chatMessage && recipient) {
      socket.emit('message', { to: recipient, from: username, message: chatMessage });
      setChatMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      {!isLoggedIn ? (
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 border rounded"
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded"
            placeholder="Password"
          />
          <button
            onClick={handleSignup}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Signup
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Login
          </button>
          <div>{message}</div>
        </div>
      ) : (
        <div>
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="p-2 border rounded"
              placeholder="Recipient"
            />
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="p-2 border rounded"
              placeholder="Enter message"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Send
            </button>
          </div>
          <div className="space-y-2 mt-4">
            {messages.map((msg, index) => (
              <div key={index} className="p-2 bg-gray-200 rounded">
                <strong>{msg.from}: </strong>{msg.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
