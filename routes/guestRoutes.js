const express = require('express');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const router = express.Router();

// Route to book a service for guest users
router.post('/book', async (req, res) => {
    const { name, phone, address, item } = req.body;

    // Validate the input fields
    if (!name || !phone || !address || !item) {
        return res.status(400).json({ message: 'Name, phone, address, and item are required' });
    }

    try {
        // Check if the item exists in the Product collection

        // Create a new booking object
        const newBooking = new Booking({
            name,
            phone,
            address,
            item,
        });

        // Save the new booking to the database
        await newBooking.save();

        // Respond with success message
        res.json({ message: 'Booking successfully made', booking: newBooking });
    } catch (error) {
        // Handle unexpected errors
        return res.status(500).json({ error: error.message });
    }
});

router.get('/bookings',async (req,res)=>{
    try{
        const bookings = await Booking.find().sort({createdAt:-1});

        if(bookings.length === 0){
            return res.status(401).json({message:'No bookings found'});
        }

        res.json(bookings);
    }
    catch(error){
        res.status(500).json({message: error.message});
    }

    }
);

module.exports = router;
