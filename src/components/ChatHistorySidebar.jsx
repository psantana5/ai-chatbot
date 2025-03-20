import { useState, useEffect } from 'react';
import { useModel } from '../context/ModelContext';
import './ChatHistorySidebar.css';

const ChatHistorySidebar = () => {
  const { chatHistory, activeChatId, startNewChat, loadChat, deleteChat } = useModel();
  
  return (
    <div className="chat-history-sidebar">
      <div className="sidebar-header">
        <h3>Chat History</h3>
        <button 
          className="new-chat-button" 
          onClick={startNewChat}
        >
          <span className="plus-icon">+</span> New Chat
        </button>
      </div>
      
      <div className="chat-list">
        {chatHistory.length === 0 ? (
          <div className="empty-history">
            <p>No previous chats</p>
          </div>
        ) : (
          chatHistory.map((chat) => (
            <div 
              key={chat.id} 
              className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
              onClick={() => loadChat(chat.id)}
            >
              <div className="chat-item-title">
                {chat.title || 'Untitled Chat'}
              </div>
              <div className="chat-item-date">
                {new Date(chat.timestamp).toLocaleDateString()}
              </div>
              <button 
                className="delete-chat-button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;