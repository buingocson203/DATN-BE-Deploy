import multer from "multer";

const storage = multer.memoryStorage(); // Lưu trữ tệp tin trong bộ nhớ

export const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Giới hạn kích thước tệp tin là 50MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File is not an image"), false);
    }
    cb(null, true);
  },
});

