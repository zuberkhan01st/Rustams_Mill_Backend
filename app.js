const express = require('express');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const guestRoutes = require('./routes/guestRoutes');
const cors = require('cors');  // CORS middleware
require('dotenv').config();

const app = express();

// Middleware (Parsing input data to JSON)
app.use(express.json());  // Express built-in JSON parser
app.use(cors());  // Enable Cross-Origin Requests

// Basic route to check if server is working
app.get('/', (req, res) => {
    res.json({ message: "Server is working!" });
});

// Routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/guest', guestRoutes);

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('MongoDB URI is missing. Please check your .env file.');
    process.exit(1);  // Exit process if Mongo URI is missing
}

mongoose.connect("mongodb+srv://zuberkhan01st:O68sZKE7tCJskMkp@cluster0.joyco.mongodb.net/Rustams_Floor_Mill?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);  // Exit process if MongoDB connection fails
    });

// Global error handler for any unhandled routes or errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Starting server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
