const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// const authRoutes = require('./routes/auth');
const authRoutes = require('./routes/auth')
const snippetRoutes = require('./routes/snippets');
const authMiddleware = require('./middleware/auth');

const app = express();

// Basic route to test server is running
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3002', 
    'http://192.168.142.154:3002',
    'https://deploy-frontend-nu.vercel.app',  // Add your production frontend URL here
    process.env.FRONTEND_URL  // You can also use an environment variable
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
console.log("Server initialized, setting up routes...")
app.use('/auth', authRoutes);
app.use('/api/snippets', authMiddleware, snippetRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// MongoDB connection
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit if cannot connect to database
  });

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
}); 