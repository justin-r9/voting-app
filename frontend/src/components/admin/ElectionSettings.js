import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

const ElectionSettings = () => {
  const [settings, setSettings] = useState({
    votingStartDate: '',
    votingEndDate: '',
    registrationEndDate: '',
  });
  const [message, setMessage] = useState('');

  const handleApiError = useCallback((error, defaultMessage) => {
    if (error.response) {
      setMessage(`Error: ${error.response.data.message}`);
    } else {
      setMessage(`An unexpected error occurred: ${defaultMessage}`);
    }
    console.error('API Error:', error);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data && Object.keys(res.data).length > 0) {
        const formattedSettings = {
          votingStartDate: res.data.votingStartDate ? new Date(res.data.votingStartDate).toISOString().slice(0, 16) : '',
          votingEndDate: res.data.votingEndDate ? new Date(res.data.votingEndDate).toISOString().slice(0, 16) : '',
          registrationEndDate: res.data.registrationEndDate ? new Date(res.data.registrationEndDate).toISOString().slice(0, 16) : '',
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
    } catch (error) {
      handleApiError(error, 'Failed to save settings.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Registration End Date:</label>
          <input
            type="datetime-local"
            name="registrationEndDate"
            value={settings.registrationEndDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Voting Start Date:</label>
          <input
            type="datetime-local"
            name="votingStartDate"
            value={settings.votingStartDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Voting End Date:</label>
          <input
            type="datetime-local"
            name="votingEndDate"
            value={settings.votingEndDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Save Settings</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ElectionSettings;