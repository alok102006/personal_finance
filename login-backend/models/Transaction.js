const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link transaction to a user
  type: { type: String, enum: ["income", "expense"], required: true }, // Income or Expense
  amount: { type: Number, required: true }, // Money value
  description: { type: String }, // Details about transaction
  date: { type: Date, default: Date.now } // Auto-set date
});

