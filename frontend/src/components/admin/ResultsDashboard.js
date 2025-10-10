import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Import the centralized api utility

const ResultsDashboard = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      // Use the new api utility. The auth token will be sent automatically.
      const res = await api.get('/admin/results');
      setResults(res.data);
    } catch (err) {
      setError('Failed to fetch results. Please ensure the server is running and you are authorized.');
      console.error('Error fetching results:', err);
    }
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!results) {
    return <p>Loading results...</p>;
  }

  // Helper to process and group demographic data
  const groupDemographics = (data, groupBy) => {
    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.name]) {
        grouped[item.name] = {};
      }
      grouped[item.name][item[groupBy]] = item.count;
    });
    return grouped;
  };

  const classDemographics = groupDemographics(results.demographics.byClass, 'classLevel');
  const genderDemographics = groupDemographics(results.demographics.byGender, 'gender');

  return (
    <div>
      <h3>Election Results</h3>
      <button onClick={fetchResults}>Refresh Results</button>

      <h4>Total Votes Cast: {results.totalVotes}</h4>

      <h4>Overall Standings</h4>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Candidate Name</th>
            <th>Position</th>
            <th>Total Votes</th>
          </tr>
        </thead>
        <tbody>
          {results.results.map((result, index) => (
            <tr key={result._id}>
              <td>{index + 1}</td>
              <td>{result.name}</td>
              <td>{result.position}</td>
              <td>{result.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>Demographics by Class Level</h4>
      <table border="1" cellPadding="5" cellSpacing="0">
         <thead>
            <tr>
                <th>Candidate</th>
                <th>100L</th>
                <th>200L</th>
                <th>300L</th>
                <th>400L</th>
                <th>500L</th>
                <th>600L</th>
            </tr>
         </thead>
         <tbody>
            {Object.keys(classDemographics).map(name => (
                <tr key={name}>
                    <td>{name}</td>
                    <td>{classDemographics[name]['100L'] || 0}</td>
                    <td>{classDemographics[name]['200L'] || 0}</td>
                    <td>{classDemographics[name]['300L'] || 0}</td>
                    <td>{classDemographics[name]['400L'] || 0}</td>
                    <td>{classDemographics[name]['500L'] || 0}</td>
                    <td>{classDemographics[name]['600L'] || 0}</td>
                </tr>
            ))}
         </tbody>
      </table>

      <h4>Demographics by Gender</h4>
       <table border="1" cellPadding="5" cellSpacing="0">
         <thead>
            <tr>
                <th>Candidate</th>
                <th>Male</th>
                <th>Female</th>
            </tr>
         </thead>
         <tbody>
            {Object.keys(genderDemographics).map(name => (
                <tr key={name}>
                    <td>{name}</td>
                    <td>{genderDemographics[name]['Male'] || 0}</td>
                    <td>{genderDemographics[name]['Female'] || 0}</td>
                </tr>
            ))}
         </tbody>
      </table>
    </div>
  );
};

export default ResultsDashboard;