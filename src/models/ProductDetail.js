import mongoose from "mongoose";

const productDetailSchema = new mongoose.Schema(
  {
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    importPrice: {
      type: Number,
      required: true,
    },
    promotionalPrice: {
      type: Number,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sizes: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Size",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default mongoose.model("ProductDetail", productDetailSchema);