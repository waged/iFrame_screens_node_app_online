import express, { Request, Response } from "express";
import { Product } from "../models/Product"; // Update the path as needed
import authorize, { AuthenticatedRequest } from "../middlewares/authorise";
import authorise from "../middlewares/authorise";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "storage/"); // Destination folder: 'storage'
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname); // Get file extension
        cb(null, `image-${uniqueSuffix}${ext}`); // Generated file name
    },
});

const upload = multer({ storage });

// Add a New Product
router.post("/add", authorize, async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            ownerID,
            companyID,
            name,
            commercialName,
            material,
            producer,
            suppliers,
            origin,
            category,
            components,
            price,
            profitPercent,
            manufactureYear,
            productionYear,
            isUsed,
            weight,
            stock,
            dimensions,
            sizes,
            purity,
            linkedQR,
            description,
            imagesID,
            videosID,
        } = req.body;

        if (!ownerID || !companyID || !name || !producer || !price || !profitPercent || !manufactureYear || !productionYear || !stock) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const newProduct = new Product({
            ownerID,
            companyID,
            name,
            producer,
            price,
            profitPercent,
            manufactureYear,
            productionYear,
            commercialName,
            material,
            suppliers,
            origin,
            category,
            components,
            isUsed,
            weight,
            stock,
            dimensions,
            sizes,
            purity,
            linkedQR,
            description,
            imagesID,
            videosID,
        });

        await newProduct.save();
        res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error });
    }
});

// Edit a Product
router.put("/edit/:id", authorize, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userID } = req;
        const { ...updates } = req.body;

        // console.log(`productID : ${id} and ownerID: ${userID}`);

        const product = await Product.findOneAndUpdate(
            { _id: id, ownerID: userID },
            updates,
            { new: true, runValidators: true } // Return the updated document
        );

        if (!product) {
            res.status(404).json({ message: "Product not found or unauthorized" });
            return;
        }

        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error });
    }
});

// Delete a Product
router.delete("/delete/:id", authorize, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userID } = req;

        const product = await Product.findOneAndDelete({ _id: id, owenerID: userID });

        if (!product) {
            res.status(404).json({ message: "Product not found or unauthorized" });
            return;
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error });
    }
});

// Retrieve All Products by OwnerID
router.get("/all/:ownerID", authorize, async (req: Request, res: Response): Promise<void> => {
    try {
        const { ownerID } = req.params;

        const products = await Product.find({ ownerID });

        if (!products.length) {
            res.status(404).json({ message: "No products found for this owner" });
            return;
        }

        res.status(200).json({ message: "Products retrieved successfully", products });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error });
    }
});


// Get products by User and it's company
router.get("/get/:companyID", authorise, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { companyID } = req.params;
        const { userID, email } = req;

        if (!userID && !email) {
            res.status(400).json({ message: "User ID or email is required" });
            return;
        }

        const query = { ownerID: userID, companyID };

        const products = await Product.find(query);
        if (!products || products.length === 0) {
            res.status(404).json({ message: "No products found for the given user" });
            return;
        }

        res.status(200).json({ message: "Products retrieved successfully", products });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});


router.get(
    "/get/product/:companyID/:productID", authorise, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { companyID } = req.params;
            const { userID, email } = req;

            if (!userID && !email) {
                res.status(400).json({ message: "User ID or email is required" });
                return;
            }

            const query = { ownerID: userID, companyID };

            const products = await Product.find(query);
            if (!products || products.length === 0) {
                res.status(404).json({ message: "No products found for the given user" });
                return;
            }

            res.status(200).json({ message: "Products retrieved successfully", products });
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error });
        }
    });


//post request to upload pictures.



//get product by the _id.
router.get(
    "/get/one/:productID",
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { productID } = req.params;
            const query = { _id: productID };
            const product = await Product.findOne(query);

            if (!product) {
                res.status(404).json({ message: "Product not found for the given company" });
                return;
            }
            res.status(200).json({ message: "Product retrieved successfully", product });
        } catch (error) {
            console.error("Error retrieving product:", error);
            res.status(500).json({ message: "Internal server error", error: error });
        }
    }
);



//get product by the linked QR-code.
router.get(
    "/get/qr/:linkedQR",
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { linkedQR } = req.params;

            const query = { linkedQR };
            const product = await Product.findOne(query);

            if (!product) {
                res.status(404).json({ message: "Product not found for the given company" });
                return;
            }
            res.status(200).json({ message: "Product retrieved successfully", product });
        } catch (error) {
            console.error("Error retrieving product:", error);
            res.status(500).json({ message: "Internal server error", error: error });
        }
    }
);

//get product by the auto generated QR-code.
router.get(
    "/get/qr-auto/:autoQR",
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { autoQR } = req.params;

            const query = { autoQR };
            const product = await Product.findOne(query);

            if (!product) {
                res.status(404).json({ message: "Product not found for the given company" });
                return;
            }
            res.status(200).json({ message: "Product retrieved successfully", product });
        } catch (error) {
            console.error("Error retrieving product:", error);
            res.status(500).json({ message: "Internal server error", error: error });
        }
    }
);


// Upload Images and Link to Product
router.post(
    "/upload-images/:productID",
    authorise,
    upload.array("images", 5), // Accept up to 5 files with field name 'images'
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { productID } = req.params;
            const userID = req;

            if (!req.files || !(req.files instanceof Array)) {
                res.status(400).json({ message: "No images uploaded" });
                return;
            }

            // Validate the product exists and belongs to the authenticated user
            const product = await Product.findOne({ _id: productID, ownerID: userID });
            if (!product) {
                res.status(404).json({ message: "Product not found or unauthorized" });
                return;
            }

            // Extract file names
            const fileNames = req.files.map((file: Express.Multer.File) => file.filename);

            // Update the product's imagesID array
            product.imagesID = [...(product.imagesID || []), ...fileNames];
            await product.save();

            res.status(200).json({
                message: "Images uploaded successfully",
                images: fileNames,
                product,
            });
        } catch (error) {
            console.error("Image Upload Error:", error);
            res.status(500).json({ message: "Internal server error", error: error });
        }
    }
);


// Delete Picture and Remove from Product's imagesID Array
router.delete(
    "/delete-image/:productID/:filename",
    authorise,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { productID, filename } = req.params;
            const userID = req;

            // Validate Product Exists and Belongs to the User
            const product = await Product.findOne({ _id: productID, ownerID: userID });
            if (!product) {
                res.status(404).json({ message: "Product not found or unauthorized" });
                return;
            }

            // Check if the file exists in imagesID
            if (!product.imagesID || !product.imagesID.includes(filename)) {
                res.status(400).json({ message: "Image not associated with this product" });
                return;
            }

            // Construct the file path
            const filePath = path.join(__dirname, "..", "storage", filename);

            // Delete the file from the file system
            fs.unlink(filePath, async (err) => {
                if (err) {
                    console.error("File Deletion Error:", err);
                    res.status(500).json({ message: "Failed to delete the file", error: err.message });
                    return;
                }

                // Remove the filename from imagesID array
                product.imagesID = (product.imagesID || []).filter((img) => img !== filename);
                await product.save();

                res.status(200).json({ message: "Image deleted successfully", filename });
            });
        } catch (error) {
            console.error("Delete Image Error:", error);
            res.status(500).json({ message: "Internal server error", error: error });
        }
    }
);

// Get Images of a Product
router.get(
    "/get-images/:productID",
    authorise,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { productID } = req.params;
            const userID = req;

            // Find the product and ensure it belongs to the authenticated user
            const product = await Product.findOne({ _id: productID, ownerID: userID });

            if (!product) {
                res.status(404).json({ message: "Product not found or unauthorized" });
                return;
            }

            // Retrieve imagesID array
            const images = product.imagesID || [];

            // Optional: Construct full image URLs if serving static files
            const imageUrls = images.map((filename) => {
                return `${req.protocol}://${req.get("host")}/storage/${filename}`;
            });

            res.status(200).json({
                message: "Product images retrieved successfully",
                images: imageUrls,
            });
        } catch (error) {
            console.error("Get Images Error:", error);
            res.status(500).json({ message: "Internal server error", error: error });
        }
    }
);

// Get a specific image of a product by name
router.get(
    "/get-image/:productID/:imageName",
    authorise,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { productID, imageName } = req.params;
            const userID = req;

            // Find the product and ensure it belongs to the authenticated user
            const product = await Product.findOne({ _id: productID, ownerID: userID });

            if (!product) {
                res.status(404).json({ message: "Product not found or unauthorized" });
                return;
            }

            // Check if the image exists in the product's imagesID array
            if (!product.imagesID || !product.imagesID.includes(imageName)) {
                res.status(404).json({ message: "Image not found in this product" });
                return;
            }

            // Construct the file path
            const filePath = path.join(__dirname, "..", "storage", imageName);

            // Check if the file exists
            if (!fs.existsSync(filePath)) {
                res.status(404).json({ message: "Image file does not exist on the server" });
                return;
            }

            // Serve the image file
            res.sendFile(filePath);
        } catch (error) {
            console.error("Get Specific Image Error:", error);
            res.status(500).json({ message: "Internal server error", error: error });
        }
    }
);

export default router;
