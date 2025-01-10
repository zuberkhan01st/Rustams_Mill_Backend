const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

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

// Controller function for image upload
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

// Export the upload middleware and controller
module.exports = { upload,uploadImage };
