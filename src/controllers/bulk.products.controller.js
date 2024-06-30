import csvtojson from "csvtojson";
import fs from "fs";
import ProductModel from "../models/product.model.js";
import lodash from 'lodash'
export const UploadBulkProducts = async (req, res) => {
  try {
    const filePath = req.file.path;

    csvtojson()
      .fromFile(filePath)
      .then(async (jsonArray) => {
        // Validate and filter data
        const validProducts = [];
        const invalidProducts = [];

        const existingProductNames = new Set(
          (await ProductModel.find({}, "name")).map((product) => product.name)
        );

        for (const row of jsonArray) {
          const {
            name,
            price,
            category,
            description,
            expiry_date,
            quantity,
            manufacturer,
          } = row;

          // Switch statement for validation checks
          let invalidReason = null;

          switch (true) {
            case !name:
              invalidReason = "name is missing";
              break;
            case !price:
              invalidReason = "price is missing";
              break;
            case !category:
              invalidReason = "category is missing";
              break;
            case !description:
              invalidReason = "description is missing";
              break;
            case !expiry_date:
              invalidReason = "expiry_date is missing";
              break;
            case !quantity:
              invalidReason = "quantity is missing";
              break;
            case !manufacturer:
              invalidReason = "manufacturer is missing";
              break;
            case price < 0:
              invalidReason = "price is less than 0";
              break;
          }

          if (invalidReason) {
            invalidProducts.push({
              name: name || "N/A",
              reason: "Invalid Field",
              message: invalidReason,
            });
            continue;
          }

          // Check if product name already exists
          if (existingProductNames.has(name)) {
            invalidProducts.push({
              name,
              reason: "Duplicate Product",
              message: `Product name: ${name} already exists`,
            });
            continue;
          }

          const capitalizedCategory = lodash.capitalize(category);

          // Add valid product to the list
          validProducts.push({
            name,
            price,
            category: capitalizedCategory,
            description,
            expiry_date: new Date(expiry_date),
            quantity,
            manufacturer,
          });

          // Add name to the set to prevent duplicate checks in this batch
          existingProductNames.add(name);
        }

        try {
          await ProductModel.insertMany(validProducts);
          res.status(200).json({
            success: !validProducts.length ? false : true,
            message: !validProducts.length
              ? "No valid product to add"
              : "Products uploaded successfully",
            uploadedCount: validProducts.length,
            failedCount: jsonArray.length - validProducts.length,
            invalidProducts,
          });
        } catch (error) {
          console.error("Error during insertMany:", error); // Log the error
          res.status(500).json({
            error: "Error uploading products",
            details: error.message,
          });
        } finally {
          fs.unlinkSync(filePath); // Remove the uploaded file
        }
      })
      .catch((error) => {
        console.error("Error parsing CSV file:", error); // Log the error
        res
          .status(500)
          .json({ error: "Error parsing CSV file", details: error.message });
        fs.unlinkSync(filePath); // Remove the uploaded file
      });
  } catch (error) {
    console.error("Error in file upload handler:", error); // Log the error
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
