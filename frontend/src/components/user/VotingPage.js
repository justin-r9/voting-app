import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VotingPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  // Fetch candidates when the component loads
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        // This endpoint is public for fetching candidate lists
        const res = await axios.get('http://localhost:5000/api/admin/candidates');
        setCandidates(res.data);
      } catch (error) {
        setMessage('Failed to load candidates. Please try refreshing the page.');
        console.error('Error fetching candidates:', error);
      }
    };
    fetchCandidates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !selectedCandidate) {
      setMessage('Please enter your verification code and select a candidate.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/voting/cast-vote', {
        code,
        candidateId: selectedCandidate,
      });
      setMessage(res.data.message);
      // Disable the form after a successful vote
      e.target.elements.submitButton.disabled = true;
    } catch (error) {
      setMessage(error.response ? error.response.data.message : 'An unexpected error occurred.');
      console.error('Error casting vote:', error);
    }
  };

  return (
    <div>
      <h2>Cast Your Vote</h2>
      <p>Enter the 6-character verification code sent to your WhatsApp and select your preferred candidate.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Verification Code:</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength="6"
            required
            style={{ marginLeft: '10px' }}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>Candidates</h3>
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <div key={candidate._id}>
                <input
                  type="radio"
                  name="candidate"
                  id={candidate._id}
                  value={candidate._id}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  required
                />
                <label htmlFor={candidate._id}>{candidate.name} - {candidate.position}</label>
              </div>
            ))
          ) : (
            <p>Loading candidates...</p>
          )}
        </div>

        <button type="submit" name="submitButton" style={{ marginTop: '20px' }}>
          Cast Final Vote
        </button>
      </form>

      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
};

export default VotingPage;