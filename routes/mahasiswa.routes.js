const express = require("express");
const Route = express.Router();
const mahasiswaController = require("../controller/mahasiswa.controller");
Route.get("/:idMahasiswa/view-krs", mahasiswaController.viewKrs);
Route.get('/:idMahasiswa/view-mahasiswa',mahasiswaController.viewMahasiswa);
Route.get("/view-matkul", mahasiswaController.viewMatkul);
Route.delete(
	"/:idMahasiswa/edit-krs/delete/:idMatkul",
	mahasiswaController.deleteMatkulKrs
);
Route.post("/:idMahasiswa/edit-krs/add/:idMatkul",mahasiswaController.addKrsMahasiswa);
module.exports = Route;
