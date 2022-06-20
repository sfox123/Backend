const mongoose = require("mongoose");

const FingerPrintSchema = new mongoose.Schema({
  name: { type: String },
  biometric: { type: String },
  signature: { type: String },
  unit: { type: String },
  items: { type: Array, default: [] },
});

mongoose.model("FingerPrint", FingerPrintSchema);
