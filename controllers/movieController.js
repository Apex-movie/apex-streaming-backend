
const mongoose = require("mongoose");
const Movie = require("../models/Movie");
const WatchHistory = require("../models/WatchHistory");
const Favorite = require("../models/Favorite");
const fs = require("fs");
const path = require("path");

// Local uploads folder ka path
const uploadsDir = path.join(__dirname, "..", "uploads");

// Local uploaded file delete karein
const deleteLocalFile = async (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;

  const filename = path.basename(fileUrl);
  const filePath = path.join(uploadsDir, filename);

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("File deletion error:", error.message);
    }
  }
};

// Movie add karein
const addMovie = async (req, res) => {
  let movieCreated = false;

  const posterFile = req.files?.poster?.[0];
  const bannerFile = req.files?.banner?.[0];
  const videoFile = req.files?.video?.[0];

  try {
    const {
      title,
      description,
      category,
      year,
      duration,
      isPremium,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      !year ||
      !duration?.trim() ||
      !posterFile ||
      !bannerFile ||
      !videoFile
    ) {
      return res.status(400).json({
        message:
          "All movie fields, poster, banner and video are required",
      });
    }

    if (
      isPremium !== undefined &&
      isPremium !== "true" &&
      isPremium !== "false"
    ) {
      return res.status(400).json({
        message: "Invalid movie access type",
      });
    }

    if (!videoFile.mimetype?.startsWith("video/")) {
      return res.status(400).json({
        message: "Please upload a valid video file",
      });
    }

    const yearNumber = Number(year);

    if (
      !Number.isInteger(yearNumber) ||
      yearNumber < 1888 ||
      yearNumber > new Date().getFullYear() + 10
    ) {
      return res.status(400).json({
        message: "Please enter a valid movie year",
      });
    }

    const movie = await Movie.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      year: yearNumber,
      duration: duration.trim(),
      isPremium: isPremium === "true",
      posterUrl: `/uploads/${posterFile.filename}`,
      bannerUrl: `/uploads/${bannerFile.filename}`,
      videoUrl: `/uploads/${videoFile.filename}`,
    });

    movieCreated = true;

    return res.status(201).json({
      message: "Movie added successfully",
      movie,
    });
  } catch (error) {
    console.error("Add movie error:", error);

    return res.status(500).json({
      message: "Failed to add movie",
      error: error.message,
    });
  } finally {
    if (!movieCreated) {
      await Promise.all([
        deleteLocalFile(
          posterFile && `/uploads/${posterFile.filename}`
        ),
        deleteLocalFile(
          bannerFile && `/uploads/${bannerFile.filename}`
        ),
        deleteLocalFile(
          videoFile && `/uploads/${videoFile.filename}`
        ),
      ]);
    }
  }
};

// Saari movies fetch karein
const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });

    return res.status(200).json(movies);
  } catch (error) {
    console.error("Get movies error:", error);

    return res.status(500).json({
      message: "Failed to fetch movies",
      error: error.message,
    });
  }
};

// Movie update karein
const updateMovie = async (req, res) => {
  let movieUpdated = false;

  const posterFile = req.files?.poster?.[0];
  const bannerFile = req.files?.banner?.[0];
  const videoFile = req.files?.video?.[0];

  let oldPosterUrl;
  let oldBannerUrl;
  let oldVideoUrl;

  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    const {
      title,
      description,
      category,
      year,
      duration,
      isPremium,
    } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Movie title cannot be empty",
        });
      }

      movie.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          message: "Movie description cannot be empty",
        });
      }

      movie.description = description.trim();
    }

    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({
          message: "Movie category cannot be empty",
        });
      }

      movie.category = category.trim();
    }

    if (duration !== undefined) {
      if (!duration.trim()) {
        return res.status(400).json({
          message: "Movie duration cannot be empty",
        });
      }

      movie.duration = duration.trim();
    }

    if (isPremium !== undefined) {
      if (
        isPremium !== "true" &&
        isPremium !== "false"
      ) {
        return res.status(400).json({
          message: "Invalid movie access type",
        });
      }

      movie.isPremium = isPremium === "true";
    }

    if (year !== undefined && year !== "") {
      const yearNumber = Number(year);

      if (
        !Number.isInteger(yearNumber) ||
        yearNumber < 1888 ||
        yearNumber > new Date().getFullYear() + 10
      ) {
        return res.status(400).json({
          message: "Please enter a valid movie year",
        });
      }

      movie.year = yearNumber;
    }

    if (
      videoFile &&
      !videoFile.mimetype?.startsWith("video/")
    ) {
      return res.status(400).json({
        message: "Please upload a valid video file",
      });
    }

    oldPosterUrl = movie.posterUrl;
    oldBannerUrl = movie.bannerUrl;
    oldVideoUrl = movie.videoUrl;

    if (posterFile) {
      movie.posterUrl = `/uploads/${posterFile.filename}`;
    }

    if (bannerFile) {
      movie.bannerUrl = `/uploads/${bannerFile.filename}`;
    }

    if (videoFile) {
      movie.videoUrl = `/uploads/${videoFile.filename}`;
    }

    await movie.save();
    movieUpdated = true;

    await Promise.all([
      posterFile
        ? deleteLocalFile(oldPosterUrl)
        : Promise.resolve(),
      bannerFile
        ? deleteLocalFile(oldBannerUrl)
        : Promise.resolve(),
      videoFile
        ? deleteLocalFile(oldVideoUrl)
        : Promise.resolve(),
    ]);

    return res.status(200).json({
      message: "Movie updated successfully",
      movie,
    });
  } catch (error) {
    console.error("Update movie error:", error);

    return res.status(500).json({
      message: "Failed to update movie",
      error: error.message,
    });
  } finally {
    if (!movieUpdated) {
      await Promise.all([
        deleteLocalFile(
          posterFile && `/uploads/${posterFile.filename}`
        ),
        deleteLocalFile(
          bannerFile && `/uploads/${bannerFile.filename}`
        ),
        deleteLocalFile(
          videoFile && `/uploads/${videoFile.filename}`
        ),
      ]);
    }
  }
};

// Movie delete karein
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    await movie.deleteOne();

    await Promise.all([
      deleteLocalFile(movie.posterUrl),
      deleteLocalFile(movie.bannerUrl),
      deleteLocalFile(movie.videoUrl),
      WatchHistory.deleteMany({ movie: movie._id }),
      Favorite.deleteMany({ movie: movie._id }),
    ]);

    return res.status(200).json({
      message: "Movie deleted successfully",
    });
  } catch (error) {
    console.error("Delete movie error:", error);

    return res.status(500).json({
      message: "Failed to delete movie",
      error: error.message,
    });
  }
};

// Movie views increment karein aur user ki history save karein
const incrementMovieViews = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = req.user._id;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    movie.views = (movie.views || 0) + 1;
    await movie.save();

    await WatchHistory.findOneAndUpdate(
      {
        user: userId,
        movie: movieId,
      },
      {
        $set: {
          watchedAt: new Date(),
        },
        $setOnInsert: {
          user: userId,
          movie: movieId,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Movie views and watch history updated",
      views: movie.views,
    });
  } catch (error) {
    console.error("Increment views error:", error);

    return res.status(500).json({
      message: "Failed to update movie views and watch history",
    });
  }
};

// Sirf logged-in user ki watch history fetch karein
const getMyWatchHistory = async (req, res) => {
  try {
    const history = await WatchHistory.find({
      user: req.user._id,
    })
      .populate("movie")
      .sort({ watchedAt: -1 });

    const validHistory = history.filter(
      (item) => item.movie !== null
    );

    return res.status(200).json(validHistory);
  } catch (error) {
    console.error("Get watch history error:", error);

    return res.status(500).json({
      message: "Failed to fetch watch history",
    });
  }
};

// Logged-in user ki favorite movies fetch karein
const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user._id,
    })
      .populate("movie")
      .sort({ createdAt: -1 });

    const validFavorites = favorites.filter(
      (item) => item.movie !== null
    );

    return res.status(200).json(validFavorites);
  } catch (error) {
    console.error("Get favorites error:", error);

    return res.status(500).json({
      message: "Failed to fetch favorite movies",
    });
  }
};

// Logged-in user ki favorite list mein movie add karein
const addFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        message: "Invalid movie ID",
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    const favorite = await Favorite.findOneAndUpdate(
      {
        user: req.user._id,
        movie: movie._id,
      },
      {
        $setOnInsert: {
          user: req.user._id,
          movie: movie._id,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    ).populate("movie");

    return res.status(200).json({
      message: "Movie added to favorites",
      favorite,
    });
  } catch (error) {
    console.error("Add favorite error:", error);

    if (error.code === 11000) {
      return res.status(200).json({
        message: "Movie is already in favorites",
      });
    }

    return res.status(500).json({
      message: "Failed to add movie to favorites",
    });
  }
};

// Logged-in user ki favorite list se movie remove karein
const removeFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        message: "Invalid movie ID",
      });
    }

    await Favorite.findOneAndDelete({
      user: req.user._id,
      movie: movieId,
    });

    return res.status(200).json({
      message: "Movie removed from favorites",
    });
  } catch (error) {
    console.error("Remove favorite error:", error);

    return res.status(500).json({
      message: "Failed to remove movie from favorites",
    });
  }
};

module.exports = {
  addMovie,
  getMovies,
  updateMovie,
  deleteMovie,
  incrementMovieViews,
  getMyWatchHistory,
  getMyFavorites,
  addFavorite,
  removeFavorite,
};
