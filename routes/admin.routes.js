const express = require("express");
const Route = express.Router();
const adminController = require("../controller/admin.controller");
const userAuth = require("../middleware/user.auth.middleware");


// authentication
Route.post("/login", adminController.loginAdmin);
Route.delete("/logout", userAuth.adminAuth, adminController.logoutAdmin);
Route.post("/signup", adminController.signupAdmin);
Route.get("/token", adminController.getLoginCsrf);

// get
Route.get("/bio", userAuth.adminAuth, adminController.viewBio);
Route.get("/view-dosen", userAuth.adminAuth, adminController.viewDosen);
Route.get("/view-mahasiswa", userAuth.adminAuth, adminController.viewMahasiswa);
Route.get("/view-matkul", userAuth.adminAuth, adminController.viewMatkul);
Route.get("/view-kelas", userAuth.adminAuth, adminController.viewKelas);
Route.get("/view-dosenpa", userAuth.adminAuth, adminController.viewDosenPa);

// for krs
Route.get(
	"/view-matkul/by/:idMahasiswa",
	userAuth.adminAuth,
	adminController.viewMatkulbyMahasiswa
);
Route.get(
	"/view-mahasiswa/by/:idMatkul",
	userAuth.adminAuth,
	adminController.viewMahasiswabyMatkul
);
Route.get("/view-jadwal", userAuth.adminAuth, adminController.viewJadwal);

// post
Route.post("/add-mahasiswa", userAuth.adminAuth, adminController.addMahasiswa);
Route.post("/add-dosen", userAuth.adminAuth, adminController.addDosen);
Route.post("/add-dosenpa", userAuth.adminAuth, adminController.addDosenPa);
Route.post("/add-matkul", userAuth.adminAuth, adminController.addMatkul);
Route.post("/add-kelas", userAuth.adminAuth, adminController.addKelas);
Route.post("/add-krs", userAuth.adminAuth, adminController.addKrs);
Route.post("/add-jadwal", userAuth.adminAuth, adminController.addJadwal);

// put
Route.put(
	"/update-mahasiswa/:mhsId",
	userAuth.adminAuth,
	adminController.updateMahasiswa
);
Route.put(
	"/update-dosen/:dosenId",
	userAuth.adminAuth,
	adminController.updateDosen
);
Route.put(
	"/update-matkul/:matkulId",
	userAuth.adminAuth,
	adminController.updateMatkul
);
Route.put(
	"/update-kelas/:kodeRuangKelas",
	userAuth.adminAuth,
	adminController.updateKelas
);

// delete
Route.delete(
	"/delete-mahasiswa/:mhsId",
	userAuth.adminAuth,
	adminController.deleteMahasiswa
);
Route.delete(
	"/delete-dosen/:dosenId",
	userAuth.adminAuth,
	adminController.deleteDosen
);
Route.delete(
	"/delete-dosenpa/:dosenId",
	userAuth.adminAuth,
	adminController.deleteDosenPa
);
Route.delete(
	"/delete-matkul/:matkulId",
	userAuth.adminAuth,
	adminController.deleteMatkul
);
Route.delete(
	"/delete-kelas/:kelasId",
	userAuth.adminAuth,
	adminController.deleteKelas
);
Route.delete(
	"/delete-jadwal/:idJadwal",
	userAuth.adminAuth,
	adminController.deleteJadwal
);
Route.delete("/delete-krs/", userAuth.adminAuth, adminController.deleteKrs);

module.exports = Route;
