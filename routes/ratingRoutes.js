const express = require("express")

const {
  addOrUpdateRating,
  getMovieRating,
  getUserMovieRating
} = require("../controllers/ratingController")

const protect = require("../middleware/authMiddleware")

const router = express.Router()


// Add or update rating
router.post(
  "/:movieId",
  protect,
  addOrUpdateRating
)


// Get average rating
router.get(
  "/:movieId",
  getMovieRating
)


// Get current user's rating
router.get(
  "/:movieId/my",
  protect,
  getUserMovieRating
)


module.exports = router