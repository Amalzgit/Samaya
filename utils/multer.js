
const multer = require('multer');

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const brandStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/brands');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const uploadProduct = multer({
    storage: productStorage,
    limits: { fileSize: 1024 * 1024 * 5 } 
});

const uploadBrand = multer({
    storage: brandStorage,
    limits: { fileSize: 1024 * 1024 * 5 } 
});

module.exports = {
    uploadProduct,
    uploadBrand
};
