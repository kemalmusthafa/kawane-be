"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLookbookCloudinary = void 0;
const multer_1 = __importDefault(require("multer"));
// Multer configuration untuk lookbook images
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Validasi tipe file
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only image files are allowed"));
    }
};
exports.uploadLookbookCloudinary = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter,
});
