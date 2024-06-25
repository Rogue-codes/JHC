import multer from "multer";

const storage = multer.memoryStorage();

export const uploadImg = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, //5mb
  },
});
