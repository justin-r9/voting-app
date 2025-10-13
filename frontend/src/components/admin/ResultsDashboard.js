import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
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

  // Calculate overall gender statistics for charts
  let totalMaleVotes = 0;
  let totalFemaleVotes = 0;
  if (results && results.demographics && results.demographics.byGender) {
    results.demographics.byGender.forEach(item => {
      if (item.gender === 'Male') {
        totalMaleVotes += item.count;
      } else if (item.gender === 'Female') {
        totalFemaleVotes += item.count;
      }
    });
  }

  const genderChartData = [
    { name: 'Male', votes: totalMaleVotes },
    { name: 'Female', votes: totalFemaleVotes },
  ];
  const COLORS = ['#0088FE', '#00C49F'];

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
                <td>{classDemographics[name]['200L'] || 0}</td>
                <td>{classDemographics[name]['300L'] || 0}</td>
                <td>{classDemographics[name]['400L'] || 0}</td>
                <td>{classDemographics[name]['500L'] || 0}</td>
                <td>{classDemographics[name]['600L'] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4>Demographics by Gender</h4>
      <div className="gender-demographics-container">
        <div className="gender-summary-text">
          <p><strong>Total Male Votes:</strong> {totalMaleVotes}</p>
          <p><strong>Total Female Votes:</strong> {totalFemaleVotes}</p>
        </div>
        <div className="charts-container">
          <div className="chart-wrapper">
            <h5>Gender Distribution (Pie Chart)</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="votes"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {genderChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrapper">
            <h5>Gender Distribution (Bar Chart)</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genderChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="votes" fill="#8884d8">
                  {genderChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
