// Core
import fs from "node:fs";
// multer
import multer, { FileFilterCallback } from "multer";
import { type Request } from "express";
import { AllowedFileExtensions } from "../common/constants/file.common";
import { BadRequestException } from "../utils/response/error.response";
import { FileTypes } from "../common/enums/filetype.enum";

const checkOrCreate = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};
export const localUpload = (dest?: string, fileCount: number = 1) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const finalPath = `uploads/${req.user?._id}/${dest}`;
      checkOrCreate(finalPath);
      cb(null, finalPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "__" + file.originalname);
    },
  });
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void => {
    const fileKey = file.mimetype.split("/")[0];
    const fileType = FileTypes[fileKey as FileTypes];
    const fileExtensions = file.mimetype.split("/")[1];
    if (!fileType) {
      cb(new BadRequestException("please set valid type of file"));
    } else {
      if (
        !AllowedFileExtensions[fileKey as FileTypes].includes(fileExtensions)
      ) {
        cb(new BadRequestException("please set valid extensions of file"));
      } else {
        cb(null, true);
      }
    }
  };
  return multer({
    limits:{
        files:fileCount,
        // fileSize:1024*5
    },
    fileFilter,
    storage,
  });
};
