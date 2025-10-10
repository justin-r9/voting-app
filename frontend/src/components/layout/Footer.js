import React from 'react';

const Footer = () => {
  const footerStyle = {
    backgroundColor: '#0d47a1', // Dark blue from user theme
    color: 'white',
    textAlign: 'center',
    padding: '20px',
    position: 'fixed',
    left: '0',
    bottom: '0',
    width: '100%',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.2)'
  };

  return (
    <footer style={footerStyle}>
      <p>&copy; {new Date().getFullYear()} Voting Platform. All Rights Reserved.</p>
      <p>A secure and anonymous online voting system.</p>
    </footer>
  );
};

export default Footer;