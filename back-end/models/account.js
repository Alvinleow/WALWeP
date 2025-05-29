const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    schoolName: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    completedCourses: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Course",
    },
    enrolledCourses: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Course",
    },
    accountLevel: {
      type: Number,
      required: true,
      default: 0, // 0 for user, 1 for admin
    },
    profilePicUrl: {
      type: String,
      default:
        "https://img.icons8.com/ios-filled/100/ffffff/user-male-circle.png",
    },
    quizResults: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        score: { type: Number },
        totalQuestions: { type: Number },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Account", AccountSchema);
