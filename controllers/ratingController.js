const Rating = require("../models/Rating")

const addOrUpdateRating = async (req, res) => {
  try {
    const { movieId } = req.params
    const { rating } = req.body
    const userId = req.user.id

    if (!rating) {
      return res.status(400).json({
        message: "Rating is required"
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      })
    }

    const existingRating =
      await Rating.findOne({
        user: userId,
        movie: movieId
      })

    if (existingRating) {
      existingRating.rating = rating
      await existingRating.save()
    } else {
      await Rating.create({
        user: userId,
        movie: movieId,
        rating
      })
    }

    const result =
      await Rating.aggregate([
        {
          $match: {
            movie: existingRating
              ? existingRating.movie
              : require("mongoose")
                  .Types.ObjectId
                  .createFromHexString(movieId)
          }
        },
        {
          $group: {
            _id: "$movie",
            averageRating: {
              $avg: "$rating"
            },
            totalRatings: {
              $sum: 1
            }
          }
        }
      ])

    const averageRating =
      result.length > 0
        ? Number(
            result[0].averageRating.toFixed(1)
          )
        : 0

    const totalRatings =
      result.length > 0
        ? result[0].totalRatings
        : 0

    res.json({
      message: existingRating
        ? "Rating updated successfully"
        : "Rating added successfully",
      averageRating,
      totalRatings
    })
  } catch (error) {
    console.error(
      "Add/update rating error:",
      error
    )

    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}


const getMovieRating = async (req, res) => {
  try {
    const { movieId } = req.params

    const result =
      await Rating.aggregate([
        {
          $match: {
            movie:
              require("mongoose")
                .Types.ObjectId
                .createFromHexString(movieId)
          }
        },
        {
          $group: {
            _id: "$movie",
            averageRating: {
              $avg: "$rating"
            },
            totalRatings: {
              $sum: 1
            }
          }
        }
      ])

    if (result.length === 0) {
      return res.json({
        averageRating: 0,
        totalRatings: 0
      })
    }

    res.json({
      averageRating:
        Number(
          result[0].averageRating.toFixed(1)
        ),
      totalRatings:
        result[0].totalRatings
    })
  } catch (error) {
    console.error(
      "Get movie rating error:",
      error
    )

    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}


const getUserMovieRating = async (req, res) => {
  try {
    const { movieId } = req.params
    const userId = req.user.id

    const rating =
      await Rating.findOne({
        user: userId,
        movie: movieId
      })

    res.json({
      rating: rating
        ? rating.rating
        : 0
    })
  } catch (error) {
    console.error(
      "Get user rating error:",
      error
    )

    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}


module.exports = {
  addOrUpdateRating,
  getMovieRating,
  getUserMovieRating
}