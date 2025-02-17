import React, { useEffect, useState } from 'react';
import { DirectLine } from 'botframework-directlinejs';
import axios from 'axios';
import './css/styles.css'; // External CSS for better styling

const FledeAgent = () => {
  const [directLine, setDirectLine] = useState(null);
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState([]); // For storing conversation messages

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get('http://localhost:3001/token');
        const token = response.data.token;
        const directLineInstance = new DirectLine({ token });
        setDirectLine(directLineInstance);

        directLineInstance.connectionStatus$.subscribe(status => {
          if (status === 2) { // Connected
            setConversationId(directLineInstance.conversationId);
          }
        });

        directLineInstance.activity$.subscribe(activity => {
          if (activity.type === 'message' && activity.from.id !== 'user') {
            setMessages(prevMessages => [...prevMessages, { from: 'bot', text: activity.text }]);
          }
        });
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    fetchToken();
  }, []);

  const sendMessage = () => {
    if (directLine && message) {
      directLine.postActivity({
        from: { id: 'user', name: 'User' },
        type: 'message',
        text: message
      }).subscribe(
        id => {
          setMessages(prevMessages => [...prevMessages, { from: 'user', text: message }]);  // Add user message
        },
        error => console.error('Error posting activity:', error)
      );
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">Chat with Bot</h1>

      {/* Display the conversation */}
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.from}`}>
            <div className="message-bubble">
              <strong>{msg.from === 'user' ? 'You' : 'Bot'}:</strong>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input field to enter your prompt */}
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="input-box"
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>

      {/* Display conversation ID */}
      <p className="conversation-id">Conversation ID: {conversationId}</p>
    </div>
  );
};

export default FledeAgent;
