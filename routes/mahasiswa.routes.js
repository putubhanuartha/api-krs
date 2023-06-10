const express = require("express");
const Route = express.Router();
const mahasiswaController = require("../controller/mahasiswa.controller");
const userAuth = require("../middleware/user.auth.middleware");
// authentication
Route.get("/token", mahasiswaController.getLoginCsrf);
Route.post("/login", mahasiswaController.loginMahasiswa);
Route.delete(
	"/logout",
	userAuth.mahasiswaAuth,
	mahasiswaController.logoutMahasiswa
);
Route.post("/signup", mahasiswaController.signupMahasiswa);

Route.get("/view-krs", userAuth.mahasiswaAuth, mahasiswaController.viewKrs);
Route.get(
	"/view-mahasiswa",
	userAuth.mahasiswaAuth,
	mahasiswaController.viewMahasiswa
);

Route.get(
	"/view-matkul",
	userAuth.mahasiswaAuth,
	mahasiswaController.viewMatkul
);
Route.delete(
	"/edit-krs/delete/:idMatkul",
	userAuth.mahasiswaAuth,
	mahasiswaController.deleteMatkulKrs
);
Route.post(
	"/edit-krs/add/:idMatkul",
	userAuth.mahasiswaAuth,
	mahasiswaController.addKrsMahasiswa
);

module.exports = Route;
