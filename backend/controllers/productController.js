const fs = require("fs");
const path = require("path");
const { db } = require("../utils/database");
const { products } = require("../shared/schema.js");
const { eq, and } = require("drizzle-orm");
const woocommerceService = require("../services/woocommerce");
const { NotFoundError, WooCommerceError } = require("../utils/errors");

const createProduct = async (req, res, next) => {
    try {
        const { name, description, price } = req.body;
        const userId = req.user.id;
        const imageUrl = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : null;

        const [newProduct] = await db
            .insert(products)
            .values({
                name,
                description,
                price,
                imageUrl,
                userId,
                status: "created_locally"
            })
            .returning();

        try {
            const wcProduct = await woocommerceService.createProduct({
                name,
                description,
                price,
                imageUrl
            });

            const [updatedProduct] = await db
                .update(products)
                .set({
                    woocommerceId: wcProduct.id,
                    status: "synced_to_woocommerce",
                    updatedAt: new Date()
                })
                .where(eq(products.id, newProduct.id))
                .returning();

            res.status(201).json({
                message: "Product created and synced to WooCommerce successfully",
                product: updatedProduct
            });
        } catch (wcError) {
            await db
                .update(products)
                .set({
                    status: "sync_failed",
                    updatedAt: new Date()
                })
                .where(eq(products.id, newProduct.id));

            console.error("WooCommerce sync failed:", wcError.message);

            res.status(201).json({
                message: "Product created locally but failed to sync with WooCommerce",
                product: { ...newProduct, status: "sync_failed" },
                warning: "WooCommerce sync failed: " + wcError.message
            });
        }
    } catch (error) {
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userProducts = await db
            .select()
            .from(products)
            .where(eq(products.userId, userId));

        res.json({
            products: userProducts
        });
    } catch (error) {
        next(error);
    }
};

const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [product] = await db
            .select()
            .from(products)
            .where(and(eq(products.id, parseInt(id)), eq(products.userId, userId)))
            .limit(1);

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        res.json({
            product
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        const [product] = await db
            .select()
            .from(products)
            .where(and(eq(products.id, parseInt(id)), eq(products.userId, userId)))
            .limit(1);

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        if (req.file) {
            if (product.imageUrl) {
                const oldImagePath = path.join(__dirname, "..", "uploads", path.basename(product.imageUrl));
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.warn("Failed to delete old image:", err.message);
                });
            }

            updates.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        const [updatedProduct] = await db
            .update(products)
            .set({
                ...updates,
                updatedAt: new Date()
            })
            .where(eq(products.id, parseInt(id)))
            .returning();

        if (product.woocommerceId && product.status === "synced_to_woocommerce") {
            try {
                await woocommerceService.updateProduct(product.woocommerceId, updates);

                res.json({
                    message: "Product updated and synced to WooCommerce successfully",
                    product: updatedProduct
                });
            } catch (wcError) {
                await db
                    .update(products)
                    .set({
                        status: "sync_failed",
                        updatedAt: new Date()
                    })
                    .where(eq(products.id, parseInt(id)));

                console.error("WooCommerce sync failed:", wcError.message);

                res.json({
                    message: "Product updated locally but failed to sync with WooCommerce",
                    product: { ...updatedProduct, status: "sync_failed" },
                    warning: "WooCommerce sync failed: " + wcError.message
                });
            }
        } else {
            res.json({
                message: "Product updated successfully",
                product: updatedProduct
            });
        }
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [product] = await db
            .select()
            .from(products)
            .where(and(eq(products.id, parseInt(id)), eq(products.userId, userId)))
            .limit(1);

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        if (product.woocommerceId && product.status === "synced_to_woocommerce") {
            try {
                await woocommerceService.deleteProduct(product.woocommerceId);
            } catch (wcError) {
                console.error("WooCommerce deletion failed:", wcError.message);
            }
        }

        await db
            .delete(products)
            .where(eq(products.id, parseInt(id)));

        res.json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

const syncProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [product] = await db
            .select()
            .from(products)
            .where(and(eq(products.id, parseInt(id)), eq(products.userId, userId)))
            .limit(1);

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        if (product.status === "synced_to_woocommerce") {
            return res.json({
                message: "Product is already synced with WooCommerce",
                product
            });
        }

        try {
            let wcProduct;

            if (product.woocommerceId) {
                wcProduct = await woocommerceService.updateProduct(product.woocommerceId, {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    imageUrl: product.imageUrl
                });
            } else {
                wcProduct = await woocommerceService.createProduct({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    imageUrl: product.imageUrl
                });
            }

            const [updatedProduct] = await db
                .update(products)
                .set({
                    woocommerceId: wcProduct.id,
                    status: "synced_to_woocommerce",
                    updatedAt: new Date()
                })
                .where(eq(products.id, parseInt(id)))
                .returning();

            res.json({
                message: "Product synced to WooCommerce successfully",
                product: updatedProduct
            });
        } catch (wcError) {
            await db
                .update(products)
                .set({
                    status: "sync_failed",
                    updatedAt: new Date()
                })
                .where(eq(products.id, parseInt(id)));

            throw new WooCommerceError("Failed to sync product to WooCommerce: " + wcError.message);
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    syncProduct
};