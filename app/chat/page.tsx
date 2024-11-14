'use client'
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketConnection = io('http://localhost:3001'); // Ensure this matches your backend URL
    setSocket(socketConnection);

    socketConnection.on('connect', () => {
      console.log('Connected to socket server:', socketConnection.id);
    });

    socketConnection.on('message', (msg) => {
      console.log('Received message:', msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Cleanup on dismount
    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (socket && message) {
      socket.emit('message', message); // Emit message to backend
      setMessage(''); // Clear input after sending
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-4 p-4">
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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

        <div className="space-y-2">
          {messages.map((msg, index) => (
            <div key={index} className="p-2 bg-gray-200 rounded">
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
