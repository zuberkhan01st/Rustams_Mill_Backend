const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');  // Ensure this path is correct

// Register a new user
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login user and generate JWT token
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user exists
        const admin = await User.findOne({ username });

        // If no user found or password doesn't match
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        // Create a JWT token with the user id and name
        const token = jwt.sign(
            { id: admin._id, name: admin.name },  // Include name in token
            process.env.JWT_SECRET,
            { expiresIn: '1h' }  // Token expires in 1 hour
        );

        // Send success response with token
        res.json({ message: 'Login Successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Book a service for the user
exports.bookService = async (req, res) => {
    const { userId, date, service } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        // If no user found
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Push the booking details into the user's bookingDetails array
        user.bookingDetails.push({ date, service });
        await user.save();

        res.json({ message: 'Booking added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Middleware to verify the JWT token and extract the user's ID
exports.verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token is missing or invalid' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user data (id and name) to the request object
        req.user = decoded;

        next();  // Proceed to the next middleware/route handler
    } catch (error) {
        res.status(401).json({ message: 'Token verification failed' });
    }
};

// Fetch bookings for a specific user (using the verified token)
exports.getUserBookings = async (req, res) => {
    try {
        // Fetch user data from the request (attached by verifyToken middleware)
        const user = await User.findById(req.user.id);

        // If no user found
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send user bookings data
        res.json(user.bookingDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
