const express = require("express");
const Router = express.Router();
// Authentication
Router.post("/login");
Router.post("/signup");
module.exports = Router;
