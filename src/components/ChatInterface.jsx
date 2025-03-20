import { useState, useRef, useEffect } from 'react';
import { useModel } from '../context/ModelContext';
import './ChatInterface.css';

const ChatInterface = () => {
  const { messages, sendMessage, isLoading, error, clearChat } = useModel();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };
  
  const formatMessage = (content) => {
    // Simple formatting for code blocks
    return content.split('\n').map((line, i) => (
      <span key={i}>{line}<br /></span>
    ));
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AI ChatBot</h2>
        <button 
          className="clear-button" 
          onClick={clearChat}
          disabled={isLoading || messages.length === 0}
        >
          Clear Chat
        </button>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>Welcome to the AI chatbot</h3>
            <p>I'm here to assist with any issuess you might have.</p>
            <p>Type 'help' for assistance on how to use this chatbot effectively.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-header">
                <strong>{msg.role === 'user' ? 'You' : 'AI Chatbot'}</strong>
              </div>
              <div className="message-content">
                {formatMessage(msg.content)}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message assistant-message loading">
            <div className="message-header">
              <strong>AI Support</strong>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
            <p>The support system is currently unavailable. Please try again later.</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="input-form" onSubmit={handleSubmit}>
        <textarea
          className="message-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message here..."
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button 
          className="send-button" 
          type="submit" 
          disabled={isLoading || !inputMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;