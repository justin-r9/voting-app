const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

// API Routes
app.use('/uploads', express.static('uploads'));
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const votingRoutes = require('./routes/voting');
const userRoutes = require('./routes/users'); // Added new user routes

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/voting', votingRoutes);
app.use('/api/users', userRoutes); // Use the new user routes

app.get('/', (req, res) => {
  res.send('Welcome to the Voting App API');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});