import fs from "fs";
import { BadRequestError } from "../errors/BadRequestError";

import "fastify";
import { File } from "fastify-multer/lib/interfaces";
import multer from "fastify-multer";
import { FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    file: File;
    files: File[];
  }
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const dest = "uploads/candidate/profile";

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    callback(null, dest);
  },
  filename(req, file, callback) {
    let replacedName: string;
    const { name } = req.body as { name: string };
    if (!name) {
      callback(
        new BadRequestError(
          "filed 'name' required. Input Candidate Name First! Place Input Name Above Photo Profile File "
        ),
        ""
      );
    } else {
      replacedName = name.replace(/\s+/g, "-");
      callback(
        null,
        "PP_" + replacedName + file.mimetype.replace("image/", ".")
      );
    }
  },
});

const multerOption = {
  storage: storage,
  fileFilter(req: FastifyRequest, file: File, callback: Function) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true);
    } else {
      callback(new BadRequestError("Only JPEG and PNG images are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
};

export default multerOption;
