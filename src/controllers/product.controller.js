import ProductModel from "../models/product.model.js";
import { validateProduct } from "../services/validator.js";
import lodash from "lodash";

export const createProduct = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const {
      name,
      price,
      description,
      expiry_date,
      quantity,
      category,
      manufacturer,
      images,
    } = req.body;

    const product = await ProductModel.findOne({ name });
    if (product) {
      return res.status(400).json({
        success: false,
        message: `Product with name: ${name} already exists`,
      });
    }

    const newProduct = await ProductModel.create({
      name,
      price,
      description,
      expiry_date,
      quantity,
      category,
      manufacturer,
      images,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: lodash.pick(newProduct, [
        "name",
        "price",
        "description",
        "expiry_date",
        "manufacturer",
        "image",
        "quantity",
        "_id",
      ]),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    let query = ProductModel.find();

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query = query.find({
        $or: [
          { name: searchRegex },
          { manufacturer: searchRegex },
          { category: searchRegex },
        ],
      });
    }

    if (req.query.sort) {
      const sortField = req.query.sort;
      query = query.sort(sortField);
    } else {
      query = query.sort("-createdAt");
    }

    // Filter by category if the 'category' query parameter is present
    if (req.query.category) {
      query = query.where("category").equals(req.query.category);
    }

    // filter by stock
    if (req.query.stock === "out of stock") {
      query = query.where("quantity").equals(0);
    } else if (req.query.stock === "in stock") {
      query = query.where("quantity").gt(0);
    }

    // filter by manufacturers
    if (req.query.manufacturer) {
      query = query.where("manufacturer").equals(req.query.manufacturer);
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const productsCount = await ProductModel.countDocuments(query.getQuery());
    const last_page = Math.ceil(productsCount / limit);

    if (page > last_page && last_page > 0) {
      throw new Error("This page does not exist");
    }

    const allProducts = await query;

    if (!allProducts.length) {
      return res.status(200).json({
        status: "success",
        message: "No product found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "All products retrieved successfully",
      data: allProducts,
      meta: {
        per_page: limit,
        current_page: page,
        last_page: last_page,
        total: productsCount,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Product id not found",
      });
    }

    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getManufacturers = async (req, res) => {
  try {
    const manufacturers = await ProductModel.distinct("manufacturer");
    res.status(200).json({
      success: true,
      message: "Manufacturers retrieved successfully",
      data: manufacturers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const modifyProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Product id not found",
      });
    }
    const { error } = validateProduct(req.body);

    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: lodash.pick(updatedProduct, [
        "name",
        "price",
        "description",
        "expiry_date",
        "manufacturer",
        "image",
        "quantity",
        "_id",
      ]),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Product ID not found",
      });
    }

    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await ProductModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the product",
    });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { count } = req.body;
    const { id } = req.params;
    

    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Product ID not provided",
      });
    }

    if (count == null) {
      // Check for undefined or null
      return res.status(400).json({
        success: false,
        message: "Count of products to add not provided",
      });
    }

    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.quantity += Number(count);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product count added successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding product count",
    });
  }
};
