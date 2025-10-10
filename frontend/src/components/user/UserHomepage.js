import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserHomepage = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    regNumber: '2023/ABC123',
    // ... other placeholder data
  });
  const [electionSettings, setElectionSettings] = useState({});
  const [timeLeft, setTimeLeft] = useState('');
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [voteMessage, setVoteMessage] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Fetch election settings and user data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch settings
        const settingsRes = await axios.get('http://localhost:5000/api/admin/settings');
        setElectionSettings(settingsRes.data);

        // TODO: Fetch real user data from a protected route like /api/auth/me
        // const userRes = await axios.get('/api/auth/me', { headers: { 'x-auth-token': /* get token from storage */ } });
        // setUser(userRes.data);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Countdown and voting status logic
  useEffect(() => {
    const { votingStartDate, votingEndDate } = electionSettings;
    if (!votingStartDate || !votingEndDate) return;

    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(votingStartDate);
      const end = new Date(votingEndDate);

      if (now < start) {
        // Before voting period
        const difference = start - now;
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        setIsVotingOpen(false);
      } else if (now >= start && now <= end) {
        // During voting period
        setTimeLeft('Voting is now open!');
        setIsVotingOpen(true);
      } else {
        // After voting period
        setTimeLeft('Voting has ended.');
        setIsVotingOpen(false);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [electionSettings]);

  const handleVoteClick = async () => {
    if (window.confirm('You are about to proceed to vote. You cannot go back after this step. Do you want to continue?')) {
      try {
        // TODO: Get the real auth token from localStorage
        const token = 'some-auth-token-from-storage';
        const res = await axios.post('http://localhost:5000/api/voting/initiate-vote', {}, {
          headers: { 'x-auth-token': token }
        });
        setVoteMessage(res.data.message);
        // In a real app, we'd redirect to the voting page. For now, display the code.
        setVerificationCode(`Your verification code is: ${res.data.verificationCode}`);
      } catch (error) {
        setVoteMessage(error.response ? error.response.data.message : 'An unexpected error occurred.');
      }
    }
  };

  const handleLogout = () => { /* ... */ };

  return (
    <div>
      <header>
        <h2>Voter Homepage</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      {/* Biodata Section ... */}

      <section>
        <h3>Election Status</h3>
        <p>{timeLeft}</p>
        {isVotingOpen && (
          <button
            onClick={handleVoteClick}
            style={{ backgroundColor: 'brightgreen', color: 'white', padding: '15px 30px', fontSize: '1.2em', border: 'none', cursor: 'pointer' }}
          >
            VOTE
          </button>
        )}
        {voteMessage && <p>{voteMessage}</p>}
        {verificationCode && <strong>{verificationCode}</strong>}
      </section>
    </div>
  );
};

export default UserHomepage;