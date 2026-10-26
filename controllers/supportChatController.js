const mongoose = require("mongoose");
const SupportMessage = require("../models/SupportMessage");

const getUserId = (req) =>
  req.user?._id || req.user?.id || req.user?.userId || req.user?.sub;

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(String(id || ""));

const sendJsonError = (res, status, message) =>
  res.status(status).json({ message });

exports.getMyMessages = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!isValidId(userId)) {
      return sendJsonError(res, 401, "Invalid user token.");
    }

    const messages = await SupportMessage.find({ user: userId })
      .sort({ createdAt: 1 })
      .limit(500)
      .lean();

    return res.json(messages);
  } catch (error) {
    console.error("getMyMessages:", error);
    return sendJsonError(res, 500, "Unable to load messages.");
  }
};

exports.sendUserMessage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const message = String(req.body.message || "").trim();

    if (!isValidId(userId)) {
      return sendJsonError(res, 401, "Invalid user token.");
    }

    if (!message) {
      return sendJsonError(res, 400, "Please enter a message.");
    }

    if (message.length > 3000) {
      return sendJsonError(res, 400, "Message must be 3000 characters or less.");
    }

    const saved = await SupportMessage.create({
      user: userId,
      senderId: userId,
      senderRole: "user",
      message,
      readByUser: true,
      readByAdmin: false,
    });

    return res.status(201).json(saved);
  } catch (error) {
    console.error("sendUserMessage:", error);
    return sendJsonError(res, 500, "Unable to send message.");
  }
};

exports.getAdminInbox = async (req, res) => {
  try {
    const inbox = await SupportMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$user",
          lastMessage: { $first: "$message" },
          lastMessageAt: { $first: "$createdAt" },
          lastSenderRole: { $first: "$senderRole" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$senderRole", "user"] },
                    { $eq: ["$readByAdmin", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    return res.json(inbox);
  } catch (error) {
    console.error("getAdminInbox:", error);
    return sendJsonError(res, 500, "Unable to load support inbox.");
  }
};

exports.getAdminConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return sendJsonError(res, 400, "Invalid user ID.");
    }

    const messages = await SupportMessage.find({ user: userId })
      .sort({ createdAt: 1 })
      .limit(500)
      .lean();

    return res.json(messages);
  } catch (error) {
    console.error("getAdminConversation:", error);
    return sendJsonError(res, 500, "Unable to load conversation.");
  }
};

exports.sendAdminMessage = async (req, res) => {
  try {
    const adminId = getUserId(req);
    const { userId } = req.body;
    const message = String(req.body.message || "").trim();

    if (!isValidId(adminId)) {
      return sendJsonError(res, 401, "Invalid admin token.");
    }

    if (!isValidId(userId)) {
      return sendJsonError(res, 400, "A valid user ID is required.");
    }

    if (!message) {
      return sendJsonError(res, 400, "Please enter a message.");
    }

    if (message.length > 3000) {
      return sendJsonError(res, 400, "Message must be 3000 characters or less.");
    }

    const saved = await SupportMessage.create({
      user: userId,
      senderId: adminId,
      senderRole: "admin",
      message,
      readByUser: false,
      readByAdmin: true,
    });

    return res.status(201).json(saved);
  } catch (error) {
    console.error("sendAdminMessage:", error);
    return sendJsonError(res, 500, "Unable to send reply.");
  }
};

exports.markMyMessagesRead = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!isValidId(userId)) {
      return sendJsonError(res, 401, "Invalid user token.");
    }

    await SupportMessage.updateMany(
      { user: userId, senderRole: "admin", readByUser: false },
      { $set: { readByUser: true } }
    );

    return res.json({ message: "Messages marked as read." });
  } catch (error) {
    console.error("markMyMessagesRead:", error);
    return sendJsonError(res, 500, "Unable to update read status.");
  }
};

exports.markConversationReadByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return sendJsonError(res, 400, "Invalid user ID.");
    }

    await SupportMessage.updateMany(
      { user: userId, senderRole: "user", readByAdmin: false },
      { $set: { readByAdmin: true } }
    );

    return res.json({ message: "Conversation marked as read." });
  } catch (error) {
    console.error("markConversationReadByAdmin:", error);
    return sendJsonError(res, 500, "Unable to update read status.");
  }
};