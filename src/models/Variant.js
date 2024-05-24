import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
        unique: true,
        defaultValue: "UnCategorized"
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        defaultValue: "UnCategorized"
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ]
},{
    versionKey: false, timestamps: true
})

export default mongoose.model("Variant", variantSchema);