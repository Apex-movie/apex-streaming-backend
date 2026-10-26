require("dotenv").config();
const cloudinary = require("./config/cloudinary");

cloudinary.uploader.upload(
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  { folder: "apex/test" },
  (error, result) => {
    if (error) {
      console.log("Message:", error.message);
      console.log("HTTP code:", error.http_code);
      console.log("Error details:", error.error);
      console.log("Request ID:", error.request_id);
      return;
    }

    console.log("Upload successful:", result.secure_url);
  }
);