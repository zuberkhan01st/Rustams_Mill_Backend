const express = require('express');
//const { register, bookService, login } = require('../controller/userController');
const router = express.Router();
const Booking = require('../models/Booking');
const Product = require('../models/Product');

/*
// Login Route
router.post('/login', login);

// Register Route
router.post('/register', register);

// Book Service Route
router.post('/book', bookService);
*/

router.post('/login',async (req,res)=>{
    
})

// Get All Products Route
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();

        // If no products are found
        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        // Send the products as a response
        res.json(products);
    } catch (error) {
        // Catch and send errors if there are any
        res.status(500).json({ message: error.message });
    }
});


// Get All Bookings Route (Sorted by Created At - Newest First)
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


// Get Bookings for a Particular User
router.get('/bookings/user', async (req, res) => {
    const { name } = req.query; // Fetching 'name' from query params

    if (!name) {
        return res.status(400).json({ message: 'Name parameter is required' });
    }

    try {
        const bookings = await Booking.find({ name }).sort({ createdAt: -1 });

        if (bookings.length === 0) {
            return res.status(404).json({ message: `No bookings found for user: ${name}` });
        }

        // Send the bookings as a response
        res.json(bookings);
    } catch (error) {
        // Catch and send errors if there are any
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
