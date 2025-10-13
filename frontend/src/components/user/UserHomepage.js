import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import api from '../../utils/api';
import ElectionCountdown from './ElectionCountdown';
import './User.css';

const UserHomepage = () => {
  const [user, setUser] = useState(null);
  const [electionSettings, setElectionSettings] = useState({});
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [voteMessage, setVoteMessage] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [activeTab, setActiveTab] = useState('biodata'); // New state for tabs
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
        const settingsRes = await api.get('/admin/settings');
        setElectionSettings(settingsRes.data);
        const candidatesRes = await api.get('/admin/candidates');
        setCandidates(candidatesRes.data);
        const positionsRes = await api.get('/admin/positions');
        setPositions(positionsRes.data);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        handleLogout();
      }
    };
    fetchInitialData();
  }, [handleLogout]);

  useEffect(() => {
    const { votingStartDate, votingEndDate } = electionSettings;
    if (!votingStartDate || !votingEndDate) return;

    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(votingStartDate);
      const end = new Date(votingEndDate);

      if (now >= start && now <= end) {
        setIsVotingOpen(true);
      } else {
        setIsVotingOpen(false);
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
        <div>
            <Link to="/" className="home-link">Home</Link>
            <Link to="/edit-profile" className="edit-profile-link">Edit Profile</Link>
            <button onClick={handleLogout} className="btn">Logout</button>
        </div>
      </header>

      <nav className="user-tabs">
        <button onClick={() => setActiveTab('biodata')} className={activeTab === 'biodata' ? 'active' : ''}>My Biodata</button>
        <button onClick={() => setActiveTab('candidates')} className={activeTab === 'candidates' ? 'active' : ''}>View Candidates</button>
      </nav>

      {activeTab === 'biodata' && (
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
      )}

      {activeTab === 'candidates' && (
        <section className="user-section">
          <div className="candidate-list-container">
            <h3>Available Candidates</h3>
            {positions.map(position => (
              <div key={position._id} className="position-group">
                <h4>{position.name}</h4>
                <ul className="candidate-list">
                  {candidates.filter(c => c.position._id === position._id).map(candidate => (
                    <li key={candidate._id} className="candidate-item">
                      <img src={`/${candidate.photo}`} alt={candidate.name} className="candidate-photo" />
                      <div className="candidate-info">
                        <span className="candidate-name">{candidate.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="user-section">
        <ElectionCountdown />
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