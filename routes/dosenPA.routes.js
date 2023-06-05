const express = require("express");
const Router = express.Router();
const dosenPaController = require("../controller/dosenpa.controller");
const userAuth = require("../middleware/user.auth.middleware");
// Authentication
Router.get("/token", dosenPaController.getCsrfToken);
Router.post("/login", dosenPaController.loginDosenPa);
Router.post("/signup", dosenPaController.signupDosen);
Router.delete("/logout", userAuth.dosenAuth, dosenPaController.logoutDosen);
Router.get("/view-bio",userAuth.dosenPaAuth ,dosenPaController.viewBioDosen);
module.exports = Router;
