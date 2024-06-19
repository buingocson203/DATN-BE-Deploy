import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    idAccount: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
},
{
    timestamps: true,
    collection: "Reviews"
})

export default mongoose.model("Review", reviewSchema);