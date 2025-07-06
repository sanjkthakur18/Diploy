const express = require("express");
const path = require("path")
const multer = require("multer");
const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    syncProduct
} = require("../controllers/productController");
const { productValidation, productUpdateValidation, validateRequest } = require("../utils/validation");
const authMiddleware = require("../middleware/auth");

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

router.use(authMiddleware);

router.post("/create", upload.single("image"), productValidation, validateRequest, createProduct);

router.get("/getall", getProducts);

router.get("/get/:id", getProduct);

router.put("/update/:id", upload.single("image"), productUpdateValidation, validateRequest, updateProduct);

router.delete("/delete/:id", deleteProduct);

router.post("/:id/sync", syncProduct);

module.exports = router;
