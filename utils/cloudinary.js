import { v2 as cloudinary } from 'cloudinary';
import DataURIParser from 'datauri/parser.js';
import path from 'path';

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.heic', '.svga'];

export const getDataUri = (file) => {
    const parser = new DataURIParser();
    const extName = path.extname(file.originalname).toLowerCase();
    return parser.format(extName, file.buffer);
};

const validateFile = (file) => {
    if (!file?.buffer || !file?.originalname) {
        throw new Error('Invalid file object provided');
    }

    const extension = path.extname(file.originalname).toLowerCase();
    const isImage = SUPPORTED_FORMATS.includes(extension);

    if (!isImage) {
        throw new Error(`Unsupported file format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`);
    }
};

export const uploadToCloudinary = async (file, options = {}) => {
    try {
        validateFile(file);
        const dataUri = getDataUri(file);

        const defaultOptions = {
            resource_type: 'image',
            quality: 'auto',
            fetch_format: 'auto',
        };

        const uploadOptions = {
            ...defaultOptions,
            ...options,
        };

        const result = await cloudinary.uploader.upload(dataUri.content, uploadOptions);
        return {
            success: true,
            message: 'Upload successful',
            data: {
                public_id: result.public_id,
                url: result.secure_url,
                thumbnail: null,
            },
            meta: {
                resourceType: 'image',
                format: result.format,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: `Cloudinary upload failed: ${error.message}`,
        };
    }
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image',
        });
        return result;
    } catch (error) {
        throw new Error(`Cloudinary deletion failed`);
    }
};
