const express = require('express');
const {login} = require('../controller/adminController');
const router = express.Router();
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const Admin = require('../models/admin')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login',async (req, res) => {
    console.log("Login Request!")
    const { username, password } = req.body;
        try {
            const admin = await Admin.findOne({ username });
            if (!admin || !(await bcrypt.compare(password, admin.password))) {
                return res.json({ message: 'Invalid credentials' });
            }
    
            const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
});

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if the username already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin
        const newAdmin = new Admin({
            username,
            password: hashedPassword, // Store the hashed password
        });

        // Save the admin to the database
        await newAdmin.save();

        // Generate a token
        const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Respond with success message and token
        res.status(201).json({ message: 'Signup successful', token });
    } catch (error) {
        // Handle unexpected errors
        res.status(500).json({ error: error.message });
    }
});


router.post('/add_product',async (req,res)=>{
    const { name, description, pricePerKg} = req.body;

    // Validate the input fields
    if (!name || !description || !pricePerKg) {
        return res.status(400).json({ message: 'Name, phone, address, and item are required' });
    }

    try {
        // Check if the item exists in the Product collection

        // Create a new booking object
        const newProduct= new Product({
            name,
            description,
            pricePerKg,
        });

        // Save the new booking to the database
        await newProduct.save();

        // Respond with success message
        res.json({ message: 'Booking successfully made', product: newProduct });
    } catch (error) {
        // Handle unexpected errors
        return res.status(500).json({ error: error.message });
    }
});

router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found' });
        }

        // Send the bookings as a response
        res.json(bookings);
    } catch (error) {
        // Catch and send errors if there are any
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;