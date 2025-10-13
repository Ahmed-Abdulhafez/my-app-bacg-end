const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "اسم المنتج مطلوب"],
      trim: true,
      maxlength: 200,
    },
    desc: {
      type: String,
      required: [true, "وصف المنتج مطلوب"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "السعر مطلوب"],
      default: 0,
    },
    brand: {
      type: String,
      default: "Evo",
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    images: [
      {
        type: Object,
        default:{
          publicId: null
        }
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model("Product", ProductSchema);
