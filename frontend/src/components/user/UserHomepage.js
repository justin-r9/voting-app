import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './User.css'; // Import the new CSS file

const UserHomepage = () => {
  const [user, setUser] = useState(null);
  const [electionSettings, setElectionSettings] = useState({});
  const [timeLeft, setTimeLeft] = useState('');
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [voteMessage, setVoteMessage] = useState('');
  const navigate = useNavigate();

  // Effect to fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
        const settingsRes = await api.get('/admin/settings');
        setElectionSettings(settingsRes.data);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        handleLogout();
      }
    };
    fetchInitialData();
  }, []);

  // Effect for countdown timer
  useEffect(() => {
    const { votingStartDate, votingEndDate } = electionSettings;
    if (!votingStartDate || !votingEndDate) return;

    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(votingStartDate);
      const end = new Date(votingEndDate);

      if (now < start) {
        const diff = start - now;
        setTimeLeft(`${Math.floor(diff / (1000 * 60 * 60 * 24))}d ${Math.floor((diff / (1000 * 60 * 60)) % 24)}h ${Math.floor((diff / 1000 / 60) % 60)}m ${Math.floor((diff / 1000) % 60)}s`);
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
        await api.post('/voting/initiate-vote');
        setVoteMessage('Success! Redirecting to the voting page...');
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
    return (
        <div className="user-container">
            <p>Loading user data...</p>
        </div>
    );
  }

  return (
    <div className="user-container">
      <header className="homepage-header">
        <h2>Voter Homepage</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <section className="user-section">
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

      <section className="user-section">
        <h3>Election Status</h3>
        <p>{timeLeft}</p>
        {isVotingOpen && !user.hasVoted && (
          <button onClick={handleVoteClick} className="vote-button">
            VOTE
          </button>
        )}
        {user.hasVoted && <p><strong>You have already voted. Thank you for your participation.</strong></p>}
        {voteMessage && <p className="user-message">{voteMessage}</p>}
      </section>
    </div>
  );
};

export default UserHomepage;