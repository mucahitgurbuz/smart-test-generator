import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { AppError } from "../utils/AppError";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow only specific file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed.",
        400
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// POST /api/upload/single - Upload single file
router.post(
  "/single",
  upload.single("file"),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }

      res.json({
        success: true,
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          uploadedBy: req.user?.id,
          uploadedAt: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/upload/multiple - Upload multiple files
router.post(
  "/multiple",
  upload.array("files", 5),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError("No files uploaded", 400);
      }

      const uploadedFiles = files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedBy: req.user?.id,
        uploadedAt: new Date(),
      }));

      res.json({
        success: true,
        data: uploadedFiles,
        count: uploadedFiles.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/upload/avatar - Upload user avatar
router.post(
  "/avatar",
  upload.single("avatar"),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError("No avatar file uploaded", 400);
      }

      // Validate that it's an image
      if (!req.file.mimetype.startsWith("image/")) {
        throw new AppError("Avatar must be an image file", 400);
      }

      res.json({
        success: true,
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          url: `/uploads/${req.file.filename}`,
          uploadedBy: req.user?.id,
          uploadedAt: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/upload/files - Get user's uploaded files
router.get(
  "/files",
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // In a real application, this would fetch from a database
      // For now, return a mock response
      res.json({
        success: true,
        data: [],
        message: "File listing not implemented in this demo",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
