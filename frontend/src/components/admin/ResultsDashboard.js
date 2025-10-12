import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './ResultsDashboard.css';

const ResultsDashboard = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get('/admin/results');
      setResults(res.data);
    } catch (err) {
      setError('Failed to fetch results. Please ensure the server is running and you are authorized.');
      console.error('Error fetching results:', err);
    }
  };

  if (error) {
    return <p style={{ color: 'var(--error-color)' }}>{error}</p>;
  }

  if (!results) {
    return <p>Loading results...</p>;
  }

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
    <div className="results-dashboard">
      <div className="results-header">
        <h2>Live Election Results</h2>
        <button onClick={fetchResults} className="btn">Refresh Results</button>
      </div>

      <div className="total-votes-card">
        <h4>Total Votes Cast</h4>
        <p>{results.totalVotes}</p>
      </div>

      <h4>Overall Standings</h4>
      <div className="table-responsive">
        <table className="results-table">
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
      </div>

      <h4>Demographics by Class Level</h4>
      <div className="table-responsive">
        <table className="results-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>JSS1</th>
              <th>JSS2</th>
              <th>JSS3</th>
              <th>SS1</th>
              <th>SS2</th>
              <th>SS3</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(classDemographics).map(name => (
              <tr key={name}>
                <td>{name}</td>
                <td>{classDemographics[name]['JSS1'] || 0}</td>
                <td>{classDemographics[name]['JSS2'] || 0}</td>
                <td>{classDemographics[name]['JSS3'] || 0}</td>
                <td>{classDemographics[name]['SS1'] || 0}</td>
                <td>{classDemographics[name]['SS2'] || 0}</td>
                <td>{classDemographics[name]['SS3'] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4>Demographics by Gender</h4>
      <div className="table-responsive">
        <table className="results-table">
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
    </div>
  );
};

export default ResultsDashboard;
