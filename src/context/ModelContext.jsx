import { createContext, useState, useContext, useEffect } from 'react';

const ModelContext = createContext();

export const useModel = () => useContext(ModelContext);

export const ModelProvider = ({ children }) => {
  // Model settings
  const [modelSettings, setModelSettings] = useState({
    modelName: 'deepseek-r1:7b', // Default model
    temperature: 0.7,
    maxLength: 2048,
    responseFormat: 'text',
    systemPrompt: 'You are IRB Support ChatBot, an IT support chatbot for IRB Barcelona, a biomedical research institute, assisting users with basic troubleshooting tasks like password resets, VPN and Wi-Fi connectivity, email setup, software installation, and printer issues. Provide clear, step-by-step solutions and, if needed, instruct users to create a ticket at irb.atlassian.net, ensuring they include their username, device, error messages, and troubleshooting steps already attempted. Always check if the issue is resolved and guide users on tracking their ticket status. If a problem requires advanced support, escalate it by directing users to official IT channels. Remind users not to share passwords or sensitive information in chat. Keep responses concise, professional, and user-friendly to ensure efficient IT support. For password reset requests, direct users to passwordreset.irbbarcelona.org, which is the official IRB Barcelona password reset portal.'
  });

  // Chat state
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Chat history state
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  
  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);
        
        // If there's history, set the most recent chat as active
        if (parsedHistory.length > 0) {
          setActiveChatId(parsedHistory[0].id);
          setMessages(parsedHistory[0].messages || []);
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
      }
    } else {
      // If no history, start with a new chat
      startNewChat();
    }
  }, []);
  
  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Function to send a message to the model
  const sendMessage = async (userMessage) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a new chat if none exists
      if (!activeChatId) {
        startNewChat();
      }
      
      // Add user message to chat
      const newMessages = [...messages, { role: 'user', content: userMessage }];
      setMessages(newMessages);
      
      // Prepare the request to Ollama API
      const OLLAMA_API_URL = import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:11434';
      const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelSettings.modelName,
          prompt: userMessage,
          system: modelSettings.systemPrompt,
          temperature: modelSettings.temperature,
          max_length: modelSettings.maxLength,
          stream: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the response to remove thinking process
      let finalResponse = data.response;
      
      // If the response contains thinking process indicators, extract only the final answer
      // Common patterns include "Thinking:", <think> tags, or multiple paragraphs where only the last ones are the answer
      if (finalResponse.includes('</Thinking:') || finalResponse.includes('thinking:')) {
        // Extract only the part after "Thinking:" sections
        const parts = finalResponse.split(/(?:Thinking:|thinking:)/g);
        finalResponse = parts[parts.length - 1].trim();
      }
      
      // Remove content between <think> and </think> tags
      if (finalResponse.includes('<think>') && finalResponse.includes('</think>')) {
        finalResponse = finalResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      }
      
      // Add AI response to chat (only the final answer, not the thinking process)
      const updatedMessages = [...newMessages, { role: 'assistant', content: finalResponse }];
      setMessages(updatedMessages);
      
      // Save to chat history
      if (activeChatId) {
        const chatIndex = chatHistory.findIndex(chat => chat.id === activeChatId);
        
        if (chatIndex !== -1) {
          // Update existing chat
          const updatedHistory = [...chatHistory];
          updatedHistory[chatIndex] = {
            ...updatedHistory[chatIndex],
            messages: updatedMessages,
            timestamp: Date.now(),
            // Update title based on first user message
            title: updatedMessages.length > 0 && updatedMessages[0].role === 'user' 
              ? updatedMessages[0].content.slice(0, 30) + (updatedMessages[0].content.length > 30 ? '...' : '')
              : 'Untitled Chat'
          };
          
          setChatHistory(updatedHistory);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to communicate with the model');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update model settings
  const updateModelSettings = (newSettings) => {
    setModelSettings({ ...modelSettings, ...newSettings });
  };

  // Function to clear current chat
  const clearChat = () => {
    setMessages([]);
    setError(null);
  };
  
  // Function to start a new chat
  const startNewChat = () => {
    // Save current chat if it has messages
    if (activeChatId && messages.length > 0) {
      saveChatToHistory(activeChatId);
    }
    
    // Create a new chat ID
    const newChatId = Date.now().toString();
    setActiveChatId(newChatId);
    setMessages([]);
    setError(null);
    
    // Add to chat history
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      timestamp: Date.now(),
      messages: []
    };
    
    setChatHistory(prev => [newChat, ...prev]);
  };
  
  // Function to save current chat to history
  const saveChatToHistory = (chatId) => {
    // Find chat in history
    const chatIndex = chatHistory.findIndex(chat => chat.id === chatId);
    
    if (chatIndex !== -1) {
      // Update existing chat
      const updatedHistory = [...chatHistory];
      updatedHistory[chatIndex] = {
        ...updatedHistory[chatIndex],
        messages: [...messages],
        timestamp: Date.now(),
        // Generate title from first message if available
        title: messages.length > 0 && messages[0].role === 'user' 
          ? messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : '')
          : 'Untitled Chat'
      };
      
      setChatHistory(updatedHistory);
    }
  };
  
  // Function to load a chat from history
  const loadChat = (chatId) => {
    // Save current chat if needed
    if (activeChatId && messages.length > 0) {
      saveChatToHistory(activeChatId);
    }
    
    // Find requested chat
    const chat = chatHistory.find(c => c.id === chatId);
    
    if (chat) {
      setActiveChatId(chatId);
      setMessages(chat.messages || []);
      setError(null);
    }
  };
  
  // Function to delete a chat from history
  const deleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    
    // If deleting active chat, start a new one
    if (chatId === activeChatId) {
      startNewChat();
    }
  };

  const value = {
    modelSettings,
    updateModelSettings,
    messages,
    sendMessage,
    isLoading,
    error,
    clearChat,
    chatHistory,
    activeChatId,
    startNewChat,
    loadChat,
    deleteChat
  };

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
};