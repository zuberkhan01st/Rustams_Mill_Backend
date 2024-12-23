const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    item:{
        type:String,
        required: true,
    },
    address: {
        type: String,
        trim: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
