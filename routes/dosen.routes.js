const express = require("express");
const Router = express.Router();
const dosenController = require("../controller/dosen.controller");
const userAuth = require("../middleware/user.auth.middleware");
// Authentication
Router.get("/token", dosenController.getCsrfToken);
Router.post("/login", dosenController.loginDosen);
Router.post("/signup", dosenController.signupDosen);
Router.delete("/logout", userAuth.dosenAuth, dosenController.logoutDosen);

Router.get("/view-bio", userAuth.dosenAuth, dosenController.viewBioDosen);
module.exports = Router;
