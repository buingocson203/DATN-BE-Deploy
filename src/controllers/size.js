import Size from "../models/Size.js";
import { sizeValid } from "../validation/size.js";

export const getAll = async (req, res) => {
  try {
    const data = await Size.find({}).populate("products");
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No Size",
      });
    }
    return res.status(200).json({
      message: "Size has been",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      size: error.size,
      message: error.message,
    });
  }
};

export const getDetail = async (req, res) => {
  try {
    const data = await Size.findById(req.params.id).populate("products");
    if (!data) {
      return res.status(404).json({
        message: "No Size",
      });
    }
    return res.status(200).json({
      message: "Size has been",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};

export const create = async (req, res) => {
  try {
    const { error } = sizeValid.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }
    const data = await Size.create(req.body);
    if (!data) {
      return res.status(404).json({
        message: "Create Size Not Successful",
      });
    }
    return res.status(200).json({
      message: "Create Size Successful",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      size: error.size,
      message: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    const { error } = sizeValid.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }
    const data = await Size.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) {
      return res.status(404).json({
        message: "Update Size Not Successful",
      });
    }
    return res.status(200).json({
      message: "Update Size Successful",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const data = await Size.findByIdAndDelete(req.params.id);
    if (!data) {
      return res.status(404).json({
        message: "Delete Size Not Successful",
      });
    }
    return res.status(200).json({
      message: "Delete Size Successful",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};
