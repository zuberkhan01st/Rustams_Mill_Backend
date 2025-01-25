const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Greviance = require('../models/grievance');
const sendEmail = require('../services/emailService');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage configuration for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'rustams_mill', // Cloudinary folder name
        allowed_formats: ['jpg', 'png', 'jpeg'], // Supported file types
    },
});

const upload = multer({ storage: storage });

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded.' });
        }

        const imageUrl = req.file.path; // Cloudinary URL

        res.status(200).json({
            message: 'Image uploaded successfully!',
            imageUrl: imageUrl, // Return Cloudinary URL
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Image upload failed.' });
    }
};

const emailfunc = async (grievance,adminMail="ji.7768977983@gmail.com") => {
    const subject = "Rustam's Mill (Grievance Raised)";
    const text = `
    Grievance Notification

    Dear Admin,
    A new grievance has been submitted. Here are the details:

    - Name: ${grievance.name}
    - Contact Number: ${grievance.number}
    - Title: ${grievance.title}
    - Description: ${grievance.description}
    - Submitted At: ${grievance.createdAt.toLocaleString()}
    - Image URL: ${grievance.imageURL}

    Please log in to your admin panel for further details.
    `;

    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">📢 New Grievance Notification</h2>
        <p>Dear Admin,</p>
        <p>A new grievance has been submitted. Here are the details:</p>
        <ul style="list-style-type: none; padding: 0;">
            <li><strong>Name:</strong> ${grievance.name}</li>
            <li><strong>Contact Number:</strong> ${grievance.no}</li>
            <li><strong>Title:</strong> ${grievance.title}</li>
            <li><strong>Description:</strong> ${grievance.description}</li>
            <li><strong>Submitted At:</strong> ${grievance.createdAt.toLocaleString()}</li>
        </ul>
        ${
            grievance.imageURL
                ? `<p><strong>Attached Image:</strong></p>
                   <img src="${grievance.imageURL}" alt="Grievance Image" style="max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 8px;" />`
                : `<p>No image attached.</p>`
        }
        <p style="color: #555;">Please log in to your admin panel for further details.</p>
    </div>
    `;

    await sendEmail(adminMail, subject, text, html);
}

const uploadGrevience = async (req,res)=>{
    try{
        const { title, description,name,no }= req.body;

        if(!title || !description){
            return res.status(400).json({ error: 'Greviance Title and description is missing!'})
        }

        if(!req.file){
            return res.status(400).json({error: 'No image file uploaded'});

        }

        const imageURL = req.file.path;

        const newGrievance = new Greviance({
            title,
            description,
            imageURL,
            name,
            no
        });

        await newGrievance.save();

        emailfunc(newGrievance);

        res.status(200).json({
            message: "Greviance successfully raised!", data:{ title, description, imageURL, name, no}
        })
    }
    catch(error){
        console.error('Error Uploading greviance: ',error);
        res.status(500).json({error: 'Grievance upload failed'});
    }
};

// Export the upload middleware and controller
module.exports = { upload ,uploadGrevience};
