import React, { useEffect, useState } from 'react';
import { DirectLine } from 'botframework-directlinejs';
import axios from 'axios';

const FledeAgent = () => {
  const [directLine, setDirectLine] = useState(null);
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState([]); // For storing conversation messages

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get('http://localhost:3001/token');  // FastAPI token endpoint
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
            console.log('Bot says:', activity.text);
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
          console.log('Posted activity, assigned ID:', id);
          setMessages(prevMessages => [...prevMessages, { from: 'user', text: message }]);  // Add user message
        },
        error => console.error('Error posting activity:', error)
      );
      setMessage('');
    }
  };

  return (
    <div className="App" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Chat with Bot</h1>

      {/* Display the conversation */}
      <div style={{ marginBottom: '20px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.from === 'user' ? 'right' : 'left' }}>
            <p><strong>{msg.from === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}</p>
          </div>
        ))}
      </div>

      {/* Input field to enter your prompt */}
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type a message..."
        style={{ padding: '10px', width: '300px' }}
      />

      {/* Button to send the prompt */}
      <button onClick={sendMessage} style={{ padding: '10px', marginLeft: '10px' }}>
        Send
      </button>

      <p>Conversation ID: {conversationId}</p>
    </div>
  );
};

export default FledeAgent;
