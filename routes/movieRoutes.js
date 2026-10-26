
const express = require("express");

const {
  addMovie,
  getMovies,
  updateMovie,
  deleteMovie,
  incrementMovieViews,
  getMyWatchHistory,
} = require("../controllers/movieController");

const favoriteController = require("../controllers/favoriteController");

const {
  getMyFavorites,
  addFavorite,
  removeFavorite,
} = favoriteController;

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Validate imported handlers early
if (
  typeof getMovies !== "function" ||
  typeof getMyWatchHistory !== "function" ||
  typeof getMyFavorites !== "function" ||
  typeof addFavorite !== "function" ||
  typeof removeFavorite !== "function" ||
  typeof protect !== "function" ||
  typeof adminOnly !== "function"
) {
  throw new Error(
    "A movie route handler is not a function. Check controller exports and middleware imports."
  );
}

// All movies
router.get("/", getMovies);

// Watch history
router.get("/history/me", protect, getMyWatchHistory);

// Favorites
router.get("/favorites/me", protect, getMyFavorites);
router.post("/favorites/:movieId", protect, addFavorite);
router.delete("/favorites/:movieId", protect, removeFavorite);

// Movie views
router.post("/:id/view", protect, incrementMovieViews);

// Upload fields
const movieUploadFields = upload.fields([
  { name: "poster", maxCount: 1 },
  { name: "banner", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

// Admin: add movie
router.post(
  "/",
  protect,
  adminOnly,
  movieUploadFields,
  addMovie
);

// Admin: update movie
router.put(
  "/:id",
  protect,
  adminOnly,
  movieUploadFields,
  updateMovie
);

// Admin: delete movie
router.delete("/:id", protect, adminOnly, deleteMovie);

module.exports = router;
