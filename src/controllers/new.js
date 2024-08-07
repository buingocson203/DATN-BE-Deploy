import New from "../models/New.js";

// Create a new article
export const createNew = async (req, res) => {
  try {
    const { img, title, desc, detailNew } = req.body;

    const newArticle = new New({
      img,
      title,
      desc,
      detailNew,
    });

    await newArticle.save();

    return res.status(201).json({
      message: "New article created successfully",
      data: newArticle,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Fetch all articles
export const getAllNews = async (req, res) => {
  try {
    const news = await New.find();

    return res.status(200).json({
      message: "News fetched successfully",
      data: news,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Fetch a single article by ID
export const getNewById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await New.findById(id);

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    return res.status(200).json({
      message: "Article fetched successfully",
      data: article,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Update an article
export const updateNew = async (req, res) => {
  try {
    const { id } = req.params;
    const { img, title, desc, detailNew } = req.body;

    const updatedArticle = await New.findByIdAndUpdate(id, { img, title, desc, detailNew }, { new: true });

    if (!updatedArticle) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    return res.status(200).json({
      message: "Article updated successfully",
      data: updatedArticle,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Delete an article
export const deleteNew = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedArticle = await New.findByIdAndDelete(id);

    if (!deletedArticle) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    return res.status(200).json({
      message: "Article deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
