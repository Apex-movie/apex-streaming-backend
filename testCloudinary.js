
require("dotenv").config();

const cloudinary = require("./config/cloudinary");

async function testCloudinary() {
  console.log(
    "Cloud name loaded:",
    Boolean(process.env.CLOUDINARY_CLOUD_NAME)
  );

  try {
    const result = await cloudinary.api.ping();
    console.log("Cloudinary API test successful:", result);
  } catch (error) {
    console.error("Cloudinary API test failed:", {
      message: error.message,
      http_code: error.http_code,
    });
  }
}

testCloudinary();
