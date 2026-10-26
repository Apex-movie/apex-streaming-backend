const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getMyMessages,
  sendUserMessage,
  getAdminInbox,
  getAdminConversation,
  sendAdminMessage,
  markMyMessagesRead,
  markConversationReadByAdmin,
} = require("../controllers/supportChatController");

const router = express.Router();

// Logged-in user endpoints
router.get("/me", protect, getMyMessages);
router.post("/send", protect, sendUserMessage);
router.patch("/me/read", protect, markMyMessagesRead);

// Admin-only endpoints
router.get("/admin/inbox", protect, adminOnly, getAdminInbox);
router.get(
  "/admin/conversation/:userId",
  protect,
  adminOnly,
  getAdminConversation
);
router.post("/admin/send", protect, adminOnly, sendAdminMessage);
router.patch(
  "/admin/conversation/:userId/read",
  protect,
  adminOnly,
  markConversationReadByAdmin
);

module.exports = router;