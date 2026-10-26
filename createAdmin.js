
require("dotenv").config()

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("./models/User")

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected")

    const name = "Apex Admin"
    const email = "admin@apex.com"
    const password = "ChangeMe@12345"

    const hashedPassword = await bcrypt.hash(password, 10)

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    })

    if (existingUser) {
      existingUser.name = name
      existingUser.password = hashedPassword
      existingUser.role = "admin"

      await existingUser.save()

      console.log("Existing account updated to Admin")
    } else {
      await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin"
      })

      console.log("New Admin account created successfully")
    }

    console.log("Email:", email)
    console.log("Password:", password)
  } catch (error) {
    console.error("Admin creation failed:", error.message)
  } finally {
    await mongoose.disconnect()
  }
}

createAdmin()
