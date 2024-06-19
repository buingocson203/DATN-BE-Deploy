import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productDetails: [
      {
        productId: { type: mongoose.Types.ObjectId, required: true },
        productName: { type: String },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        sizeId: { type: mongoose.Types.ObjectId, required: true },
        sizeName: { type: String, required: true },
        productDetailId: { type: mongoose.Types.ObjectId, required: true },
        productName: { type: String, required: true },
        quantityOrders: { type: Number, default: 1 }, // Thay đổi từ quantity thành quantityOrders
        _id: false,
      },
    ],
    orderStatus: {
      type: String,
      enum: ["pending", "waiting", "delivering", "done", "cancel"],
      default: "pending",
    },
    reason: { type: String },
    total_price: {
      type: Number,
      required: true,
    },
    total_amount_paid: { type: Number, default: 0 },

    paymentMethod: {
      type: String,
      enum: ["cod", "vnpay"],
      default: "cod"
    },
    codeOrders: { type: String }
  },
  {
    timestamps: true,
    collection: "Orders",
  }
);

export default mongoose.model("Order", orderSchema);