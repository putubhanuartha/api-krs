const express = require("express");
const Route = express.Router();
const adminController = require("../controller/admin.controller");

// Authentication
Route.post("/login");

// get
Route.get("/view-dosen", adminController.viewDosen);
Route.get("/view-mahasiswa", adminController.viewMahasiswa);
Route.get("/view-matkul", adminController.viewMatkul);
Route.get("/view-kelas", adminController.viewKelas);
Route.get("/view-dosenpa", adminController.viewDosenPa);
// for krs
Route.get(
	"/view-matkul/by/:idMahasiswa",
	adminController.viewMatkulbyMahasiswa
);
Route.get(
	"/view-mahasiswa/by/:idMatkul",
	adminController.viewMahasiswabyMatkul
);
Route.get("/view-jadwal", adminController.viewJadwal);

// post
Route.post("/add-mahasiswa", adminController.addMahasiswa);
Route.post("/add-dosen", adminController.addDosen);
Route.post("/add-dosenpa", adminController.addDosenPa);
Route.post("/add-matkul", adminController.addMatkul);
Route.post("/add-kelas", adminController.addKelas);
Route.post("/add-krs", adminController.addKrs);
Route.post("/add-jadwal", adminController.addJadwal);

// put
Route.put("/update-mahasiswa/:mhsId", adminController.updateMahasiswa);
Route.put("/update-dosen/:dosenId", adminController.updateDosen);
Route.put("/update-matkul/:matkulId", adminController.updateMatkul);
Route.put("/update-kelas/:kodeRuangKelas", adminController.updateKelas);

// delete
Route.delete("/delete-mahasiswa/:mhsId", adminController.deleteMahasiswa);
Route.delete("/delete-dosen/:dosenId", adminController.deleteDosen);
Route.delete("/delete-dosenpa/:dosenId", adminController.deleteDosenPa);
Route.delete("/delete-matkul/:matkulId", adminController.deleteMatkul);
Route.delete("/delete-kelas/:kelasId", adminController.deleteKelas);
Route.delete("/delete-jadwal/:idJadwal", adminController.deleteJadwal);
Route.delete("/delete-krs/", adminController.deleteKrs);

// authentication
Route.post("/login");
Route.post("/signup", adminController.signupAdmin);
module.exports = Route;
