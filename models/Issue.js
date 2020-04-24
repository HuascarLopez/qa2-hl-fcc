const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IssueSchema = new Schema({
  _id: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: { type: Date },
  updated_on: { type: Date },
  created_by: { type: String, required: true },
  assigned_to: { type: String },
  open: { type: Boolean, default: true },
  status_text: { type: String }
});

const Issue = mongoose.model("Issue", IssueSchema);

module.exports.Issue = Issue;