import Variant from "../models/Variant.js";
import { variantValid } from "../validation/variant.js";

export const getAll = async (req, res) => {
  try {
    const data = await Variant.find({}).populate("products");
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No Variant",
      });
    }
    return res.status(200).json({
      message: "Variant has been",
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
    const data = await Variant.findById(req.params.id).populate("products");
    if (!data) {
      return res.status(404).json({
        message: "No Variant",
      });
    }
    return res.status(200).json({
      message: "Variant has been",
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
    const { error } = variantValid.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }
    const data = await Variant.create(req.body);
    if (!data) {
      return res.status(404).json({
        message: "Create variant Not Successful",
      });
    }
    return res.status(200).json({
      message: "Create variant Successful",
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
    const { error } = variantValid.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }
    const data = await Variant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) {
      return res.status(404).json({
        message: "Update Variant Not Successful",
      });
    }
    return res.status(200).json({
      message: "Update Variant Successful",
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
    const data = await Variant.findByIdAndDelete(req.params.id);
    if (!data) {
      return res.status(404).json({
        message: "Delete Variant Not Successful",
      });
    }
    return res.status(200).json({
      message: "Delete Variant Successful",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};
