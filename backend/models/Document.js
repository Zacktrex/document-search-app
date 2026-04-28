
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  content: { type: String, required: true },
  lastModified: { type: Date, default: Date.now }
});


documentSchema.index({ content: "text" });

module.exports = mongoose.model("Document", documentSchema);