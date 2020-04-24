const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const {Issue} = require("../models/Issue");

const ProjectSchema = new Schema({
  project: { type: String, required: true },
  issues: { type: Array, value: {Issue} }
});

const Project = mongoose.model("Project", ProjectSchema);

module.exports.Project = Project;