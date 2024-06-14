import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["thumbnail", "gallery"],
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default mongoose.model("Image", imageSchema);