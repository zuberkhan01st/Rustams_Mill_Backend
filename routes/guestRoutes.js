const express = require('express');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const sendEmail = require('../services/emailService');
const { upload, uploadGrevience } = require('../controller/uploadController'); // Import controller
const router = express.Router();

// POST route for uploading an image to Cloudinary
router.post('/grevience', upload.single('image'), uploadGrevience);

router.post('/book', async (req, res) => {
    const { name, phone, address, item } = req.body;

    // Validate the input fields
    if (!name || !phone || !address || !item) {
        return res.status(400).json({ message: 'Name, phone, address, and item are required' });
    }

    try {
        // Create a new booking object
        const newBooking = new Booking({
            name,
            phone,
            address,
            item,
        });

        const adminMail = process.env.ADMIN_EMAIL;

        // Save the new booking to the database
        await newBooking.save();

        const emailfunc = async () => {
            const subject = "Rustam's Mill (Booking)";
            const text = `
            New Booking Notification

            Dear Admin,
            A new booking has been made. Here are the details:

            - Name: ${newBooking.name}
            - Phone: ${newBooking.phone}
            - Address: ${newBooking.address}
            - Item: ${newBooking.item}
            - Created At (Date): ${newBooking.createdAt.toLocaleString()}

            Please log in to your admin panel for further details.
            `;

            const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">📢 New Booking Notification</h2>
                <p>Dear Admin,</p>
                <p>A new booking has been made. Here are the details:</p>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Name:</strong> ${newBooking.name}</li>
                    <li><strong>Phone:</strong> ${newBooking.phone}</li>
                    <li><strong>Address:</strong> ${newBooking.address}</li>
                    <li><strong>Item:</strong> ${newBooking.item}</li>
                    <li><strong>Created At (Date):</strong> ${newBooking.createdAt.toLocaleString()}</li>
                </ul>
                <p style="color: #555;">Please log in to your admin panel for further details.</p>
            </div>
            `;

            await sendEmail(adminMail, subject, text, html);
        }

        emailfunc();

        // Respond with success message
        res.json({ message: 'Booking successfully made', booking: newBooking });
    } catch (error) {
        // Handle unexpected errors
        return res.status(500).json({ error: error.message });
    }
});

router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });

        if (bookings.length === 0) {
            return res.status(401).json({ message: 'No bookings found' });
        }

        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/contactus', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const adminMail = process.env.ADMIN_EMAIL;

        const emailfunc2 = async () => {
            const subject = "Rustam's Mill (Contact Us / Enquiry)";
            const text = `
            New Contact US/ Enquiry

            Dear Admin,
            A new contact us message has been received. Here are the details:

            - Name: ${name}
            - Email: ${email}
            - Message: ${message}
            `;

            const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">📢 New Contact Us/ Enquiry Notification</h2>
                <p>Dear Admin,</p>
                <p>A new contact us message has been received. Here are the details:</p>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Message:</strong> ${message}</li>
                </ul>
                <p style="color: #555;">Please log in to your admin panel for further details.</p>
            </div>
            `;

            await sendEmail(adminMail, subject, text, html);
        }

        emailfunc2();

        // Respond with success message
        res.json({ message: 'Successfully sent the message' });
    } catch (error) {
        // Handle unexpected errors
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
