const Dosen = require("../model/dosen.model");
const Krs = require("../model/krs.model");
const MataKuliah = require("../model/matakuliah.model");
const Mahasiswa = require("../model/mahasiswa.model");
const DosenPa = require("../model/dosenpa.model");
const Jadwal = require("../model/jadwal.model");
const { Op } = require("sequelize");
const sequelize = require("../utils/orm");
const isTimeInRange = require("../utils/checker").isTimeInRange;
const isMatkulSelected = require("../utils/checker").isMatkulSelected;
const isSksCountAvailable = require("../utils/checker").isSksCountAvailable;
exports.viewKrs = (req, res) => {
	const { idMahasiswa } = req.params;
	Krs.findAll({
		where: { MahasiswaNim: idMahasiswa },
		attributes: ["MataKuliahKodeKelas"],
	})
		.then(async (result) => {
			const arrRes = await Promise.all(
				result.map(async (el) => {
					const matkul = await MataKuliah.findOne({
						where: { kode_kelas: el.dataValues.MataKuliahKodeKelas },
						attributes: [
							"kode_kelas",
							"nama_matkul",
							"sks",
							"kapasitas",
							"kode_ruang_kelas",
						],
						include: [{ model: Dosen, attributes: ["nama"] }],
					});
					return matkul;
				})
			);
			res.status(200).json({ message: "data dikirimkan", data: arrRes });
		})
		.catch((err) => {
			console.log(err);
			res.status(404).json({ message: "bad request" });
		});
};
exports.viewMatkul = (req, res) => {
	MataKuliah.findAll({
		where: {
			idJadwal: { [Op.ne]: null },
		},
		attributes: ["kode_kelas", "nama_matkul", "sks", "kapasitas"],
		include: [
			{
				model: Jadwal,
				attributes: ["id", "hari", "start_class_time", "end_class_time"],
			},
		],
	})
		.then((data) => {
			res.status(200).json({ message: "sukses dikirimkan", data });
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ message: "gagal mengirim data" });
		});
};
exports.viewDosenPa = (req, res) => {
	const { idMahasiswa } = req.params;
	Mahasiswa.findOne({
		where: { nim: idMahasiswa },
		attributes: [],
		include: [
			{
				model: DosenPa,
				include: [{ model: Dosen, attributes: ["nama", "nip"] }],
			},
		],
	})
		.then((result) => {
			res.status(200).json({ message: "data dikirimkan", data: result });
		})
		.catch((err) => {
			console.log(err);
			res.status(404).json({ message: "bad request" });
		});
};
exports.deleteMatkulKrs = (req, res) => {
	const MahasiswaNim = req.params.idMahasiswa;
	const MataKuliahKodeKelas = req.params.idMatkul;
	Krs.destroy({
		where: {
			MahasiswaNim,
			MataKuliahKodeKelas,
		},
	})
		.then(async (row) => {
			console.log(row);
			if (row == 0) {
				res.status(400).json({ message: "data tidak ditemukan" });
			} else {
				const krs = await MataKuliah.findOne({
					where: { kode_kelas: MataKuliahKodeKelas },
					attributes: ["sks"],
				});
				// update to decrement filled bench number
				await MataKuliah.update(
					{ filled_bench: sequelize.literal(`filled_bench - 1`) },
					{
						where: {
							kode_kelas: MataKuliahKodeKelas,
						},
					}
				);
				// update to decrement sks number of mahasiswa
				await Mahasiswa.update(
					{
						total_krs: sequelize.literal(
							`total_krs - ${krs.getDataValue("sks")}`
						),
					},
					{ where: { nim: MahasiswaNim } }
				);
				res.status(200).json({
					message: "data berhasil dihapus, jumlah sks mahasiswa dikurangi",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ message: "data gagal dihapus" });
		});
};
exports.viewMahasiswa = async (req, res) => {
	const { idMahasiswa } = req.params;
	try {
		const result = await Mahasiswa.findAll({
			attributes: [
				"nim",
				"nama",
				"tanggal_lahir",
				"gender",
				"no_hp",
				"ipk",
				"total_krs",
			],
			include: DosenPa,
			where: {
				nim: idMahasiswa,
			},
		});

		const arrRes = await Promise.all(
			result.map(async (er) => {
				let namaDosen = null;
				if (er.dataValues.DosenPa) {
					const nip = er.dataValues.DosenPa.dataValues.nip_dosen;
					namaDosen = await Dosen.findOne({
						where: { nip },
						attributes: ["nama", "nip"],
					});
				}
				return { ...er.dataValues, DosenPa: namaDosen };
			})
		);
		res.status(200).json({ message: "data dikirimkan", data: arrRes });
	} catch (err) {
		console.log(err);
		res.status(404).json({ message: "bad request" });
	}
};
exports.addKrsMahasiswa = async (req, res) => {
	const MahasiswaNim = req.params.idMahasiswa;
	const MataKuliahKodeKelas = req.params.idMatkul;
	try {
		const mahasiswa = await Mahasiswa.findOne({ where: { nim: MahasiswaNim } });
		const selectedMatkul = await MataKuliah.findOne({
			where: { kode_kelas: MataKuliahKodeKelas },
			include: [
				{
					model: Jadwal,
					attributes: ["start_class_time", "end_class_time", "hari"],
				},
			],
		});
		const sks = selectedMatkul.getDataValue("sks");

		// Check terlebih dahulu apakah mahasiswa sudah memiliki matkul tersebut meskipun berbeda kelas, hal tersebut tidak diperbolehkan
		const matkul = await Krs.findAll({
			where: { MahasiswaNim },
			attributes: ["MataKuliahKodeKelas"],
		});
		if (isMatkulSelected(MataKuliahKodeKelas, matkul)) {
			res.status(500).json({
				message: "Mahasiswa sudah memiliki matkul tersebut",
			});
			return;
		}

		// Check apakah matkul yang dipilih ada pada database
		// Jika matkul ada, Check terlebih dahulu apakah mata kuliah teresebut memiliki jadwal
		const matkulFounded = await MataKuliah.findOne({
			where: { kode_kelas: MataKuliahKodeKelas, idJadwal: { [Op.ne]: null } },
		});
		if (!matkulFounded) {
			res.status(500).json({
				message:
					"Mata kuliah belum memiliki jadwal || Mata kuliah tidak ditemukan",
			});
			return;
		}

		// Check apakah jadwal matakuliah bertabrakan
		const jadwalMhs = await Promise.all(
			matkul.map(async (el) => {
				return await MataKuliah.findOne({
					where: { kode_kelas: el.getDataValue("MataKuliahKodeKelas") },
					attributes: [],
					include: [
						{
							model: Jadwal,
							attributes: ["start_class_time", "end_class_time", "hari"],
						},
					],
				});
			})
		);
		const arrJadwal = jadwalMhs.map((el) => {
			return el.dataValues.Jadwal.dataValues;
		});
		if (
			checkArrInRange(
				arrJadwal,
				selectedMatkul.getDataValue("Jadwal").dataValues.start_class_time,
				selectedMatkul.getDataValue("Jadwal").dataValues.end_class_time,
				selectedMatkul.getDataValue("Jadwal").dataValues.hari
			)
		) {
			res.status(500).json({ message: "data jadwal bertabrakan" });
			return;
		}

		// Check apakah kapasitas kelas mata kuliah tersebut masih ada
		// count and compare matkul capacity
		if (
			selectedMatkul.getDataValue("filled_bench") ==
			selectedMatkul.getDataValue("kapasitas")
		) {
			res.status(503).json({ message: "kapasitas kelas melebihi" });
			return;
		}

		// check matkul availability for mahasiswa based on their IPK and selected SKS
		// check apakah mahasiswa boleh memilih matkul tersebut berdasarkan IPK dan jumlah sks mereka
		if (!isSksCountAvailable(mahasiswa, sks)) {
			res.status(500).json({ message: "IPK Mahasiswa tidak mencukupi" });
			return;
		}

		// Jika semuanya telah valid, maka eksekusi =======>
		// Updating filled bench of matkul
		await MataKuliah.update(
			{ filled_bench: sequelize.literal(`filled_bench + 1`) },
			{
				where: {
					kode_kelas: MataKuliahKodeKelas,
				},
			}
		);
		// Updating mahasiswa's krs count total
		await Mahasiswa.update(
			{ total_krs: sequelize.literal(`total_krs + ${sks}`) },
			{ where: { nim: MahasiswaNim } }
		);
		// Updating krs join table
		Krs.create({ MahasiswaNim, MataKuliahKodeKelas })
			.then(() => {
				res.status(200).json({ message: "data berhasil ditambahkan" });
			})
			.catch((err) => {
				console.log(err);
				res.status(400).json({ message: "data gagal ditambahkan" });
			});
	} catch (err) {
		console.log(err);
		res.status(400).json({ message: "data gagal ditambahkan" });
	}
};
function checkArrInRange(arrVal, start_time, end_time, hari) {
	for (let i = 0; i < arrVal.length; i++) {
		if (
			isTimeInRange(
				start_time,
				end_time,
				hari,
				arrVal[i].start_class_time,
				arrVal[i].end_class_time,
				arrVal[i].hari
			)
		) {
			return true;
		}
	}
	return false;
}
