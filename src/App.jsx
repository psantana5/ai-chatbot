import { useState, useEffect } from 'react'
import './App.css'
import ChatInterface from './components/ChatInterface'
import SettingsPanel from './components/SettingsPanel'
import ChatHistorySidebar from './components/ChatHistorySidebar'
import { ModelProvider } from './context/ModelContext'
import irbLogo from './assets/irb-logo.svg'

function App() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <ModelProvider>
      <div className="app-container">
        <header className="app-header">
          <div className="logo-container">
            <img src={irbLogo} alt="IRB Barcelona Logo" className="irb-logo" />
            <h1></h1>
          </div>
          <button 
            className="settings-button"
            onClick={() => setShowSettings(!showSettings)}
          >
            {showSettings ? 'Close Settings' : 'Settings'}
          </button>
        </header>
        
        <main className="app-main">
          {showSettings ? (
            <SettingsPanel />
          ) : (
            <div className="app-content">
              <ChatHistorySidebar />
              <div className="main-content">
                <ChatInterface />
              </div>
            </div>
          )}
        </main>
        
        <footer className="app-footer">
          <p>IRB Barcelona IT Support Assistant</p>
        </footer>
      </div>
    </ModelProvider>
  )
}

export default App