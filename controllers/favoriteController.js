
const mongoose = require("mongoose");
const Favorite = require("../models/Favorite");

// JWT payload se user ID nikalo
const getUserId = (req) => {
  return req.user?._id || req.user?.id || req.user?.userId || null;
};

// Get logged-in user's favorites
const getMyFavorites = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User ID missing. Please login again.",
      });
    }

    const favorites = await Favorite.find({
      user: userId,
    }).populate("movie");

    return res.status(200).json(favorites);
  } catch (error) {
    console.error("Get favorites error:", error);
    return res.status(500).json({
      message: "Failed to fetch favorites",
    });
  }
};

// Add movie to favorites
const addFavorite = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { movieId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "User ID missing. Please login again.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(movieId)
    ) {
      return res.status(400).json({
        message: "Invalid user ID or movie ID",
      });
    }

    const existingFavorite = await Favorite.findOne({
      user: userId,
      movie: movieId,
    });

    if (existingFavorite) {
      return res.status(200).json({
        message: "Movie is already in favorites",
        favorite: existingFavorite,
      });
    }

    const favorite = await Favorite.create({
      user: userId,
      movie: movieId,
    });

    const populatedFavorite = await Favorite.findById(
      favorite._id
    ).populate("movie");

    return res.status(201).json({
      message: "Movie added to favorites",
      favorite: populatedFavorite,
    });
  } catch (error) {
    console.error("Add favorite error:", error);

    if (error.code === 11000) {
      return res.status(200).json({
        message: "Movie is already in favorites",
      });
    }

    return res.status(500).json({
      message: "Failed to add favorite",
    });
  }
};

// Remove movie from favorites
const removeFavorite = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { movieId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "User ID missing. Please login again.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(movieId)
    ) {
      return res.status(400).json({
        message: "Invalid user ID or movie ID",
      });
    }

    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      movie: movieId,
    });

    if (!favorite) {
      return res.status(404).json({
        message: "Favorite movie not found",
      });
    }

    return res.status(200).json({
      message: "Movie removed from favorites",
    });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return res.status(500).json({
      message: "Failed to remove favorite",
    });
  }
};

module.exports = {
  getMyFavorites,
  addFavorite,
  removeFavorite,
};
