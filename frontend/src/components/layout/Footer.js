import React from 'react';

const Footer = () => {
  const footerStyle = {
    backgroundColor: '#0d47a1', // Dark blue from user theme
    color: 'white',
    textAlign: 'center',
    padding: '10px 20px', // Reduced padding
    position: 'fixed',
    left: '0',
    bottom: '0',
    width: '100%',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.15)'
  };

  const pStyle = {
    margin: '5px 0', // Reduced margin between paragraphs
    fontSize: '0.9em' // Reduced font size
  };

  return (
    <footer style={footerStyle}>
      <p style={pStyle}>&copy; {new Date().getFullYear()} Voting Platform. All Rights Reserved.</p>
      <p style={pStyle}>A secure and anonymous online voting system.</p>
    </footer>
  );
};

export default Footer;