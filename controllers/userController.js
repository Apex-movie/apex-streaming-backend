
const User = require("../models/User")
const bcrypt = require("bcryptjs")


// GET TOTAL USERS

const getTotalUsers = async (req, res) => {

  try {

    const totalUsers = await User.countDocuments({
      role: "user"
    })

    res.json({
      totalUsers
    })

  } catch (error) {

    console.error(
      "Get total users error:",
      error
    )

    res.status(500).json({
      message: "Server error",
      error: error.message
    })

  }

}


// CHANGE PASSWORD

const changePassword = async (req, res) => {

  try {

    const {
      currentPassword,
      newPassword
    } = req.body


    // CHECK FIELDS

    if (
      !currentPassword ||
      !newPassword
    ) {

      return res.status(400).json({
        message:
          "Current password and new password are required"
      })

    }


    // PASSWORD LENGTH

    if (newPassword.length < 6) {

      return res.status(400).json({
        message:
          "New password must be at least 6 characters"
      })

    }


    // FIND LOGGED-IN USER

    const user = await User.findById(
      req.user.id
    )

    if (!user) {

      return res.status(404).json({
        message: "User not found"
      })

    }


    // CHECK CURRENT PASSWORD

    const isPasswordCorrect =
      await bcrypt.compare(
        currentPassword,
        user.password
      )

    if (!isPasswordCorrect) {

      return res.status(401).json({
        message:
          "Current password is incorrect"
      })

    }


    // HASH NEW PASSWORD

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      )


    // UPDATE PASSWORD

    user.password = hashedPassword

    await user.save()


    res.json({
      message:
        "Password changed successfully"
    })

  } catch (error) {

    console.error(
      "Change password error:",
      error
    )

    res.status(500).json({
      message: "Server error",
      error: error.message
    })

  }

}


module.exports = {
  getTotalUsers,
  changePassword
}

