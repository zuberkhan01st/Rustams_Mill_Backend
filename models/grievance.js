const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
    imageURL: { type: String, required: true ,unique:true},
    description: { type: String, required: true },
    title :{ type: String, required:true},
    name:{ type: String,required:true},
    no:{type: Number, required:true},
    createdAt: {
        type: Date,
        default: Date.now
    },

});


module.exports = mongoose.model('Grievance', grievanceSchema);
