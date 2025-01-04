const express = require('express');
//const { register, bookService, login } = require('../controller/userController');
const router = express.Router();
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authenticate = require('../middleware/authenticateAdmin');

router.post('/login',async (req,res)=>{
    try{
        const {username, password} = req.body;
        
        const fetchUser = await User.findOne({username});
        
        if (!fetchUser || !(await bcrypt.compare(password, fetchUser.password))) {
            return res.json({ message: 'Invalid credentials' });
        }

        const token =  jwt.sign({id: fetchUser._id},process.env.JWT_SECRET,{expiresIn :'1h'});
        res.json({message: 'Login Successfull',token});

    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
});

router.post('/signup', async(req,res)=>{
    const {username, email ,password} = req.body;
    if(!username || !password){
            return res.status(400).json(
            message, "Please provide username/password properly!"
        );
    }
    console.log("Signing Up!");
    try{
        const existingUser = await User.findOne({username});

        if(existingUser){
            return res.status(400).json({message: "Username already exist"});
        }

        const existingUser1 = await User.findOne({email});
        if(existingUser1){
            return res.status(400).json({message: "Email already exist"});
        }
        
        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            username,
            password: hashedPassword,
            email
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({message: "Signup Succesfull", token});
    }
    catch(error){
        res.status(500).json({error: error.message});
    }

});

// Get All Products Route
router.get('/products',authenticate, async (req, res) => {
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
router.get('/bookings',authenticate, async (req, res) => {
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
router.get('/bookings/user',authenticate, async (req, res) => {
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
