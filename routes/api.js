/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var ObjectId = require("mongodb").ObjectID;

const mongoose = require("mongoose");
const mongo = require("mongodb");
const config = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
};

const {Project} = require("../models/Project");

mongoose.connect(process.env.DATABASE, config);

module.exports = function(app) {
  app
    .route("/api/issues/:project")
    .get(function(req, res) {
      const myProject = req.params;
      Project.findOne(myProject, (err, project) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
        if (!project) return res.status(400).send(`Unknown: ${myProject}`);

        let issues = project.issues;

        for (let filter in req.query) {
          if (filter !== "open")
            issues = issues.filter(
              issue => issue[filter] === req.query[filter]
            );
          else
            issues = issues.filter(
              issue => issue[filter] === (req.query[filter] === "true")
            );
        }
        return res.status(200).send(issues);
      });
    })

    .post(function(req, res) {
      const myProject = req.params;
      const {_id} = { _id: generateID()};
      const issue_title = req.body.issue_title;
      const issue_text = req.body.issue_text;
      const created_by = req.body.created_by;
      const assigned_to = req.body.assigned_to ? req.body.assigned_to : "";
      const status_text = req.body.status_text ? req.body.status_text : "";
      const open = { open: true };

      const { created_on, updated_on } = {
        created_on: new Date(),
        updated_on: new Date()
      };

      const issue = {
        _id,
        issue_title,
        issue_text,
        created_on,
        updated_on,
        created_by,
        assigned_to,
        open,
        status_text
      };

      const newProject = new Project(myProject);

      const condition1 = !issue_title;
      const condition2 = !issue_text;
      const condition3 = !created_by;

      if (condition1 || condition2 || condition3) {
        return res.status(200).send("missing inputs");
      }

      Project.findOne(myProject, (err, project) => {
        if (err) {
          console.log("Error");
        }

        if (project) {
          project.issues.push(issue);
          project.save((err, pro) => {
            if (err) {
              console.log("Error");
            }
            const index = pro.issues.length - 1;
            return res.status(200).json(pro.issues[index]);
          });
        } else {
          newProject.issues.push(issue);
          newProject.save((err, pro) => {
            if (err) {
              console.log("Error");
            }
            const index = pro.issues.length - 1;
            return res.status(200).json(pro.issues[index]);
          });
        }
      });
    })

    .put(function(req, res) {
      const myProject = req.params;
      const { _id } = req.body;

      Project.findOne(myProject, (err, project) => {
        if (err) {
          console.log("Error");
        }

        if (!project) {
          return res.status(400).send(`Unknown: ${myProject}`);
        }

        const index = project.issues.findIndex(issue => issue._id === _id);

        const update = project.issues[index];

        if (!update) {
          return res.status(400).send("no update field sent");
        }

        for (let el in req.body) {
          if (el !== "open" && el !== "_id") update[el] = req.body[el];
          else if (el === "open") update[el] = req.body[el] === "true";
        }

        update.updated_on = new Date();
        project.markModified("issues");

        project.save((err, updatedProject) => {
          if (err) {
            return res.status(400).send(`could not update ${_id}`);
          }
          return res.status(200).send("successfully updated");
        });
      });
    })

    .delete(function(req, res) {
      const myProject = req.params;
      const { _id } = req.body;

      if (!_id) {
        return res.status(400).send("_id error");
      }

      Project.findOne(myProject, async (err, project) => {
        if (err) {
          console.log("Error");
        }

        if (!project) {
          return res.status(400).send(`Unkown Project: ${project}`);
        }

        const index = project.issues.findIndex(issue => issue._id === _id);
        const remove = project.issues[index];
        const len = project.issues.length;

        project.issues.remove(remove);
        project.markModified("issues");

        project.save((err, pro) => {
          if (err) {
            console.log("Error");
          }
          if (project.issues.length === len) {
            return res.status(400).send(`could not delete ${_id}`);
          } else {
            return res.status(200).send(`deleted ${_id}`);
          }
        });
      });
    });
};

// Function to get User ID
function generateID() {
  let id = "";
  let values = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 3; i++) {
    id += values.charAt(Math.floor(Math.random() * values.length));
  }
  return id;
}