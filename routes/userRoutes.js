const express = require('express');
//const { register, bookService, login } = require('../controller/userController');
const router = express.Router();
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authenticate = require('../middleware/authenticateAdmin');
const emailService = require('../services/emailService');
const crypto = require('crypto');

const otpStore = new Map();

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
    const { username } = req.query; // Fetching 'name' from query params

    if (!username) {
        return res.status(400).json({ message: 'Name parameter is required' });
    }

    try {
        const bookings = await Booking.find({ username }).sort({ createdAt: -1 });

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

router.post('/request-otp', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username is required." });
    }

    try {
        // Check if the username exists in the database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "The username doesn't exist." });
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Store the OTP temporarily with a timeout
        otpStore.set(username, otp);
        setTimeout(() => otpStore.delete(username), 5 * 60 * 1000); // OTP expires in 5 minutes

        // Send the OTP via email

        const sendEmail = async()=>{

       
            const subject = "Rustam's Mill - OTP for Password Change";
            const text = `
            Hello ${user.username},

            Use the following OTP to change your password: ${otp}
            This OTP is valid for 5 minutes.

            Regards,
            Rustam's Mill Support Team
            `;

            const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">🔑 Your OTP for Password Change</h2>
                <p>Hello <strong>${user.username}</strong>,</p>
                <p>Use the following OTP to change your password:</p>
                <h1 style="color: #333; text-align: center;">${otp}</h1>
                <p>This OTP is valid for <strong>5 minutes</strong>.</p>
                <p>Regards,<br>Rustam's Mill Support Team</p>
            </div>
            `;

            await emailService(user.email, subject, text, html);
        }
        sendEmail();
        console.log(otp);
        res.status(200).json({ message: "OTP sent to your registered email." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
});

router.patch('/changepass', async (req,res)=>{
    const {username, newPassword, otp} = req.body;

    if(!otp || !username || !newPassword){
        return res.status(400).json({message: "Enter details properly"});
    }

    try{
        const storedOtp = otpStore.get(username);

        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "The username doesn't exist." });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password in the database
        user.password = hashedPassword;
        await user.save();

        // Remove OTP from storage
        otpStore.delete(username);

        // Notify the user

        const sendEmail = async () =>{

        
            const subject = "Password Changed Successfully";
            const text = `
            Hello ${user.username},

            Your password has been successfully updated. If you did not request this change, please contact support immediately.

            Regards,
            Rustam's Mill Support Team
            `;

            const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">🔒 Password Changed Successfully</h2>
                <p>Hello <strong>${user.username}</strong>,</p>
                <p>Your password has been successfully updated.</p>
                <p>If you did not request this change, please contact support immediately.</p>
                <p>Regards,<br>Rustam's Mill Support Team</p>
            </div>
            `;

            await emailService(user.email, subject, text, html);
        }

        sendEmail();
        res.status(200).json({ message: "Password changed successfully and notification email sent." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
});

module.exports = router;
