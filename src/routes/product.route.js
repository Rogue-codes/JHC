import express from "express";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { addProduct, createProduct, deleteProduct, getAllProducts, modifyProduct } from "../controllers/product.controller.js";
import { reservationMiddleware } from "../middlewares/resrvation.middleware.js";
import multer from "multer";
import { UploadBulkProducts } from "../controllers/bulk.products.controller.js";


const productRoute = express.Router();

const upload = multer({ dest: "uploads/" });


productRoute.post("/product/create", adminMiddleware, createProduct);
productRoute.post("/product/bulk-create", adminMiddleware, upload.single('file'), UploadBulkProducts);
productRoute.get("/products/all", reservationMiddleware, getAllProducts);
productRoute.put("/product/update/:id", adminMiddleware, modifyProduct);
productRoute.delete("/product/delete/:id", adminMiddleware, deleteProduct);
productRoute.delete("/product/add/:id", adminMiddleware, addProduct);

export default productRoute