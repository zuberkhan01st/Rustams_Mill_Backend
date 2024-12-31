const express = require('express');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const guestRoutes = require('./routes/guestRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Basic route to check if server is working
app.get('/', (req, res) => {
    res.json({ message: "Server is working!" });
});

// Routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/guest', guestRoutes);
app.use('/chatbot', chatbotRoutes);

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('MongoDB URI is missing. Please check your .env file.');
    process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Export your Express app as a serverless function
const serverless = require('serverless-http');
module.exports.handler = serverless(app);
