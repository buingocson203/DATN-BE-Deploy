
import mongoose from "mongoose";
const DetailNewSchema = new mongoose.Schema({
  account: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  }
});

const NewSchema = new mongoose.Schema({
  img: {
    type: String, // Assuming this is a URL or a path to the image
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  detailNew: [DetailNewSchema],
});

export default mongoose.model('New', NewSchema);

