import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import './ElectionSettings.css';

const ElectionSettings = () => {
  const [settings, setSettings] = useState({
    votingStartDate: '',
    votingEndDate: '',
    registrationEndDate: '',
  });
  const [message, setMessage] = useState('');

  const handleApiError = useCallback((error, defaultMessage) => {
    const errorMsg = error.response?.data?.message || defaultMessage;
    setMessage(errorMsg);
    console.error('API Error:', error);
    setTimeout(() => setMessage(''), 4000);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data && Object.keys(res.data).length > 0) {
        // Format dates for datetime-local input
        const formatForInput = (date) => date ? new Date(new Date(date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
        const formattedSettings = {
          votingStartDate: formatForInput(res.data.votingStartDate),
          votingEndDate: formatForInput(res.data.votingEndDate),
          registrationEndDate: formatForInput(res.data.registrationEndDate),
        };
        setSettings(formattedSettings);
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch settings.');
    }
  }, [handleApiError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/settings', settings);
      setMessage('Settings saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      handleApiError(error, 'Failed to save settings.');
    }
  };

  return (
    <div className="election-settings">
      <h2>Election Timeline Settings</h2>
      <p>Set the key dates for the election. All times are in your local timezone.</p>
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="registrationEndDate">Registration End Date:</label>
          <input
            id="registrationEndDate"
            className="form-input"
            type="datetime-local"
            name="registrationEndDate"
            value={settings.registrationEndDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="votingStartDate">Voting Start Date:</label>
          <input
            id="votingStartDate"
            className="form-input"
            type="datetime-local"
            name="votingStartDate"
            value={settings.votingStartDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="votingEndDate">Voting End Date:</label>
          <input
            id="votingEndDate"
            className="form-input"
            type="datetime-local"
            name="votingEndDate"
            value={settings.votingEndDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="btn">Save Settings</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ElectionSettings;
