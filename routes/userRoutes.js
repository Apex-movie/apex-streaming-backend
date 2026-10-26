
const express = require("express")

const {
  getTotalUsers,
  changePassword
} = require("../controllers/userController")

const protect = require("../middleware/authMiddleware")
const adminOnly = require("../middleware/adminMiddleware")

const router = express.Router()


// GET TOTAL USERS - ADMIN ONLY

router.get(
  "/total",
  protect,
  adminOnly,
  getTotalUsers
)


// CHANGE PASSWORD - ADMIN ONLY

router.put(
  "/change-password",
  protect,
  adminOnly,
  changePassword
)


module.exports = router
