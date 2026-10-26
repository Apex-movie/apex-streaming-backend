
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Upload folder ensure karein
const uploadDir = path.join(__dirname, "..", "uploads")

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Temporary local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const safeName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, "_")

    cb(
      null,
      `${Date.now()}-${safeName}${path.extname(file.originalname).toLowerCase()}`
    )
  }
})

// Image aur video file validation
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "poster" || file.fieldname === "banner") {
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true)
    }

    return cb(new Error("Poster aur banner ke liye image file upload karein"))
  }

  if (file.fieldname === "video") {
    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-matroska"
    ]

    if (allowedVideoTypes.includes(file.mimetype)) {
      return cb(null, true)
    }

    return cb(
      new Error("Video ke liye MP4, WebM, MOV ya MKV file upload karein")
    )
  }

  return cb(new Error("Invalid upload field"))
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024
  }
})

module.exports = upload
