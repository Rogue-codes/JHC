import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  expiry_date: {
    type: Date,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ["Inhaler", "Tablet", "Syrup", "Cream", "Capsule", "Soap"],
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
  },
},{
  timestamps: true,
});

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
