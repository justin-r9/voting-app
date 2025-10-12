import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './User.css';

const ElectionCountdown = () => {
  const [electionSettings, setElectionSettings] = useState({});
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        setElectionSettings(res.data);
      } catch (error) {
        console.error('Failed to fetch election settings:', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const { votingStartDate, votingEndDate } = electionSettings;
    if (!votingStartDate || !votingEndDate) {
      setTimeLeft('Voting time has not been set.');
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(votingStartDate);
      const end = new Date(votingEndDate);

      if (now < start) {
        const diff = start - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`Voting starts in: ${d}d ${h}h ${m}m ${s}s`);
      } else if (now >= start && now <= end) {
        const diff = end - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`Voting ends in: ${d}d ${h}h ${m}m ${s}s`);
      } else {
        setTimeLeft('Voting is not currently ongoing.');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [electionSettings]);

  return (
    <div className="countdown-container">
      <h3>Election Status</h3>
      <p className="countdown-timer">{timeLeft}</p>
    </div>
  );
};

export default ElectionCountdown;