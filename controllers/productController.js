import { Product } from '../models/productModel.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

export const createProduct = async (req, res) => {
    let uploadedPhotos = [];
    let uploadedFrames = [];

    try {
        const {
            name, price, category, sizes, description, frameMeasurements, size, material, shape, springHinges, progressiveEligible, gender,
            frameType, lensFeature, polarized } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, and category are required',
            });
        }

        const files = req.files;

        const photoFiles = files?.photos || [];
        const frameFiles = files?.frame || [];

        if (photoFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product photo is required.",
            });
        }

        const photoResults = await Promise.all(
            photoFiles.map(file => uploadToCloudinary(file))
        );

        const failedPhotos = photoResults.filter(r => !r.success);
        if (failedPhotos.length > 0) {
            return res.status(500).json({
                success: false,
                message: `Failed to upload ${failedPhotos.length} photos.`,
                errors: failedPhotos.map(u => u.message),
            });
        }

        uploadedPhotos = photoResults.map(r => ({
            public_id: r.data.public_id,
            url: r.data.url,
        }));

        if (frameFiles.length > 0) {
            const frameResults = await Promise.all(
                frameFiles.map(file => uploadToCloudinary(file))
            );

            const failedFrames = frameResults.filter(r => !r.success);
            if (failedFrames.length > 0) {
                return res.status(500).json({
                    success: false,
                    message: `Failed to upload ${failedFrames.length} frame images.`,
                    errors: failedFrames.map(u => u.message),
                });
            }

            uploadedFrames = frameResults.map(r => ({
                public_id: r.data.public_id,
                url: r.data.url,
            }));
        }

        const sizesArray = sizes ? JSON.parse(sizes) : [];

        let parsedMeasurements = {};
        if (frameMeasurements) {
            try {
                parsedMeasurements = JSON.parse(frameMeasurements);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid frameMeasurements format. Send a valid JSON object.",
                });
            }
        }

        const product = await Product.create({
            name,
            price,
            category,
            photos: uploadedPhotos,
            frame: uploadedFrames,
            sizes: sizesArray,
            description,
            frameMeasurements: parsedMeasurements,
            size,
            material,
            shape,
            springHinges: springHinges === "true",
            progressiveEligible: progressiveEligible === "true",
            gender,
            frameType,
            lensFeature,
            polarized: polarized === "true"
        });

        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product,
        });

    } catch (error) {
        const allUploaded = [...uploadedPhotos, ...uploadedFrames];
        if (allUploaded.length > 0) {
            await Promise.all(
                allUploaded.map(img =>
                    deleteFromCloudinary(img.public_id).catch(e =>
                        console.error('Failed to cleanup image:', e)
                    )
                )
            );
        }

        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating product',
            error: error.message,
        });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    let uploadedPhotos = [];
    let uploadedFrames = [];

    try {
        const existingProduct = await Product.findById(id);

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const {
            name, price, category, sizes, description, frameMeasurements, size, material, shape, springHinges, progressiveEligible,
            gender, frameType, lensFeature, polarized } = req.body;

        const files = req.files;

        const photoFiles = files?.photos || [];
        if (photoFiles.length > 0) {
            const photoResults = await Promise.all(
                photoFiles.map(file => uploadToCloudinary(file))
            );

            const failedPhotos = photoResults.filter(r => !r.success);
            if (failedPhotos.length > 0) {
                return res.status(500).json({
                    success: false,
                    message: `Failed to upload ${failedPhotos.length} photos.`,
                    errors: failedPhotos.map(u => u.message),
                });
            }

            uploadedPhotos = photoResults.map(r => ({
                public_id: r.data.public_id,
                url: r.data.url,
            }));

            await Promise.all(
                existingProduct.photos.map(photo =>
                    deleteFromCloudinary(photo.public_id).catch(e =>
                        console.error("Failed to delete old photo:", e)
                    )
                )
            );
        }

        const frameFiles = files?.frame || [];
        if (frameFiles.length > 0) {
            const frameResults = await Promise.all(
                frameFiles.map(file => uploadToCloudinary(file))
            );

            const failedFrames = frameResults.filter(r => !r.success);
            if (failedFrames.length > 0) {
                return res.status(500).json({
                    success: false,
                    message: `Failed to upload ${failedFrames.length} frame images.`,
                    errors: failedFrames.map(u => u.message),
                });
            }

            uploadedFrames = frameResults.map(r => ({
                public_id: r.data.public_id,
                url: r.data.url,
            }));

            await Promise.all(
                existingProduct.frame.map(frame =>
                    deleteFromCloudinary(frame.public_id).catch(e =>
                        console.error("Failed to delete old frame:", e)
                    )
                )
            );
        }

        const sizesArray = sizes ? JSON.parse(sizes) : existingProduct.sizes;
        let parsedMeasurements = existingProduct.frameMeasurements;

        if (frameMeasurements) {
            try {
                parsedMeasurements = JSON.parse(frameMeasurements);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid frameMeasurements format. Send a valid JSON object.",
                });
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name: name ?? existingProduct.name,
                price: price ?? existingProduct.price,
                category: category ?? existingProduct.category,
                photos: uploadedPhotos.length > 0 ? uploadedPhotos : existingProduct.photos,
                frame: uploadedFrames.length > 0 ? uploadedFrames : existingProduct.frame,
                sizes: sizesArray,
                description: description ?? existingProduct.description,
                frameMeasurements: parsedMeasurements,
                size: size ?? existingProduct.size,
                material: material ?? existingProduct.material,
                shape: shape ?? existingProduct.shape,
                springHinges: springHinges !== undefined ? springHinges === "true" : existingProduct.springHinges,
                progressiveEligible: progressiveEligible !== undefined ? progressiveEligible === "true" : existingProduct.progressiveEligible,
                gender: gender ?? existingProduct.gender,
                frameType: frameType ?? existingProduct.frameType,
                lensFeature: lensFeature ?? existingProduct.lensFeature,
                polarized: polarized !== undefined ? polarized === "true" : existingProduct.polarized,
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct,
        });

    } catch (error) {
        const allUploaded = [...uploadedPhotos, ...uploadedFrames];
        if (allUploaded.length > 0) {
            await Promise.all(
                allUploaded.map(img =>
                    deleteFromCloudinary(img.public_id).catch(e =>
                        console.error("Failed to cleanup uploaded image:", e)
                    )
                )
            );
        }

        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the product",
            error: error.message,
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (product.photos && product.photos.length > 0) {
            await Promise.all(
                product.photos.map((image) =>
                    deleteFromCloudinary(image.public_id).catch((e) =>
                        console.error(`Failed to delete image ${image.public_id}:`, e)
                    )
                )
            );
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting product.",
            error: error.message,
        });
    }
};

export const getAllProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    try {
        const [products, total] = await Promise.all([
            Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Product.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            count: products.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            products,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message,
        });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch product",
            error: error.message,
        });
    }
};