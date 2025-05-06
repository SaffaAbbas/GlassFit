// import multer from "multer";
// const MB = 1024 * 1024;

// const FILE_CONFIG = {
//     files: {
//         types: ["image/jpeg", "image/png", "image/jpg", "image/svg+xml", "image/svga"],
//         maxSize: 5 * MB, maxCount: 5
//     },
// };

// const fileFilter = (req, file, cb) => {
//     const config = FILE_CONFIG[file.fieldname];
//     if (!config) {
//         return cb(new Error("Please upload a valid field."), false);
//     }
//     if (!config.types.includes(file.mimetype)) {
//         return cb(new Error(`Please provide a valid file format.`), false);
//     }
//     const fileSize = parseInt(req.headers["content-length"]);
//     if (fileSize > config.maxSize) {
//         return cb(new Error(`File size is too large`), false);
//     }
//     cb(null, true);
// };

// const storage = multer.memoryStorage();
// const upload = multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 30 * MB }
// });
// export const multipleUpload = upload.array("files", FILE_CONFIG.files.maxCount);
// export default {
//     multipleUpload,
// };
import multer from "multer";

const MB = 1024 * 1024;

const FILE_CONFIG = {
    photos: {
        types: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
        maxSize: 5 * MB,
        maxCount: 5
    },
    frame: {
        types: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
        maxSize: 5 * MB,
        maxCount: 3
    }
};

const fileFilter = (req, file, cb) => {
    const config = FILE_CONFIG[file.fieldname];

    if (!config) {
        return cb(new Error(`Invalid field name: ${file.fieldname}. Use 'photos' or 'frame'`), false);
    }

    if (!config.types.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type for ${file.fieldname}. Only ${config.types.join(', ')} allowed`), false);
    }

    cb(null, true);
};

const storage = multer.memoryStorage();

export const productUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * MB, // Per-file limit
        files: 8 // Total files (5 photos + 3 frames)
    }
}).fields([
    { name: 'photos', maxCount: FILE_CONFIG.photos.maxCount },
    { name: 'frame', maxCount: FILE_CONFIG.frame.maxCount }
]);

// For other generic uploads
export const multipleUpload = multer({
    storage,
    fileFilter: (req, file, cb) => fileFilter(req, file, cb),
    limits: { fileSize: 30 * MB }
}).array("files", 5);

export default {
    productUpload,
    multipleUpload
};