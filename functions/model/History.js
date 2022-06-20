const mongoose = require("mongoose");

const historySchema = mongoose.Schema({
  staff: { type: String },
  assignedBy: { type: String },
  date: { type: String },
  itemName: { type: Array },
  pending: { type: Boolean, default: true },
  remarks: { type: String, default: "" },
  receivedBy: { type: String },
  receivedDate: { type: String },
});

mongoose.model("History", historySchema);
