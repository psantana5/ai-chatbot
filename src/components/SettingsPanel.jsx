import { useState } from 'react';
import { useModel } from '../context/ModelContext';
import './SettingsPanel.css';

const SettingsPanel = () => {
  const { modelSettings, updateModelSettings } = useModel();
  
  // Local state to manage form values
  const [localSettings, setLocalSettings] = useState({
    ...modelSettings
  });
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Convert number inputs to numbers
    const processedValue = type === 'number' ? parseFloat(value) : value;
    setLocalSettings({
      ...localSettings,
      [name]: processedValue
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    updateModelSettings(localSettings);
    alert('Settings updated successfully!');
  };
  
  return (
    <div className="settings-container">
      <h2>Model Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="modelName">Model Name</label>
          <input
            type="text"
            id="modelName"
            name="modelName"
            value={localSettings.modelName}
            onChange={handleChange}
            placeholder="e.g., support-model"
          />
          <p className="help-text">DeepSeek R1-8b</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="temperature">Temperature</label>
          <input
            type="number"
            id="temperature"
            name="temperature"
            min="0"
            max="2"
            step="0.1"
            value={localSettings.temperature}
            onChange={handleChange}
          />
          <p className="help-text">Controls randomness (0 = deterministic, 1 = creative, 2 = random)</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="maxLength">Max Response Length</label>
          <input
            type="number"
            id="maxLength"
            name="maxLength"
            min="100"
            max="10000"
            step="100"
            value={localSettings.maxLength}
            onChange={handleChange}
          />
          <p className="help-text">Maximum number of tokens in the response</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="systemPrompt">System Prompt</label>
          <textarea
            id="systemPrompt"
            name="systemPrompt"
            value={localSettings.systemPrompt}
            onChange={handleChange}
            rows="4"
            placeholder="Instructions for the AI model..."
          ></textarea>
          <p className="help-text">System instructions that define how the AI behaves</p>
        </div>
        
        <button type="submit" className="save-button">Save Settings</button>
      </form>
      
      <div className="help-section">
        <h3>Help</h3>
        <p>To use this Phoenix-sec.org support chatbot effectively:</p>
        <ul>
          <li>Make sure you have a stable internet connection</li>
          <li>Adjust the settings above to customize the support assistant's behavior</li>
          <li>Return to the chat interface to start interacting with the support assistant</li>
          <li>For urgent issues, please contact Phoenix-sec.org directly</li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsPanel;