
const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    watchedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Each user has only one history entry per movie.
// Watching the same movie again updates its watchedAt.
watchHistorySchema.index(
  { user: 1, movie: 1 },
  { unique: true }
);

const WatchHistory = mongoose.model(
  "WatchHistory",
  watchHistorySchema
);

module.exports = WatchHistory;
