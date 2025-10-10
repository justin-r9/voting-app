import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const UserHomepage = () => {
  const [user, setUser] = useState(null);
  const [electionSettings, setElectionSettings] = useState({});
  const [timeLeft, setTimeLeft] = useState('');
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [voteMessage, setVoteMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch user data from the new protected endpoint
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);

        // Fetch election settings
        const settingsRes = await api.get('/admin/settings');
        setElectionSettings(settingsRes.data);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        // If we fail to get user data, it likely means the token is invalid or expired.
        // Log the user out.
        handleLogout();
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
        const diff = start - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        setIsVotingOpen(false);
      } else if (now >= start && now <= end) {
        setTimeLeft('Voting is now open!');
        setIsVotingOpen(true);
      } else {
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
        // The API call is now automatically authenticated by the api utility
        await api.post('/voting/initiate-vote');
        setVoteMessage('Success! Redirecting to the voting page...');
        // Redirect to the separate, anonymous voting page
        setTimeout(() => navigate('/vote'), 1500);
      } catch (error) {
        setVoteMessage(error.response ? error.response.data.message : 'An unexpected error occurred.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) {
    return <p>Loading user data...</p>;
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Voter Homepage</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <section>
        <h3>My Biodata</h3>
        <ul>
          <li><strong>Name:</strong> {user.name}</li>
          <li><strong>Registration Number:</strong> {user.regNumber}</li>
          <li><strong>Phone Number:</strong> {user.phoneNumber}</li>
          <li><strong>Class:</strong> {user.classLevel}</li>
          <li><strong>Email:</strong> {user.email}</li>
          <li><strong>Gender:</strong> {user.gender}</li>
          <li><strong>Age:</strong> {user.age}</li>
        </ul>
      </section>

      <section>
        <h3>Election Status</h3>
        <p>{timeLeft}</p>
        {isVotingOpen && !user.hasVoted && (
          <button
            onClick={handleVoteClick}
            style={{ backgroundColor: 'green', color: 'white', padding: '15px 30px', fontSize: '1.2em', border: 'none', cursor: 'pointer' }}
          >
            VOTE
          </button>
        )}
        {user.hasVoted && <p><strong>You have already voted. Thank you for your participation.</strong></p>}
        {voteMessage && <p>{voteMessage}</p>}
      </section>
    </div>
  );
};

export default UserHomepage;