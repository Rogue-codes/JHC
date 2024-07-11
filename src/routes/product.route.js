import express from "express";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import {
  addProduct,
  createProduct,
  deleteProduct,
  getAllProducts,
  getManufacturers,
  getProductById,
  modifyProduct,
} from "../controllers/product.controller.js";
import { reservationMiddleware } from "../middlewares/resrvation.middleware.js";
import multer from "multer";
import { UploadBulkProducts } from "../controllers/bulk.products.controller.js";
import { uploadImg } from "../middlewares/uploadimage.middleware.js";

const productRoute = express.Router();

const upload = multer({ dest: "uploads/" });

productRoute.post("/product/create", adminMiddleware, createProduct);
productRoute.post(
  "/product/bulk-create",
  adminMiddleware,
  upload.single("file"),
  UploadBulkProducts
);
productRoute.get("/products/all", reservationMiddleware, getAllProducts);
productRoute.get(
  "/products/manufacturers",
  reservationMiddleware,
  getManufacturers
);
productRoute.put("/product/update/:id", adminMiddleware, modifyProduct);
productRoute.delete("/product/delete/:id", adminMiddleware, deleteProduct);
productRoute.patch(
  "/product/add/:id",
  adminMiddleware,
  addProduct
);
productRoute.get(
  "/product/:id",
  reservationMiddleware,
  getProductById
);
export default productRoute;
