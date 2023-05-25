const Mahasiswa = require("../model/mahasiswa.model.js");
const Dosen = require("../model/dosen.model.js");
const MataKuliah = require("../model/matakuliah.model.js");
const DosenPa = require("../model/dosenpa.model");
const ClassRoom = require("../model/classroom.model.js");
const Krs = require("../model/krs.model.js");
const Jadwal = require("../model/jadwal.model.js");
const sequelize = require("../utils/orm.js");
const { Op } = require("sequelize");
const createIdJadwal = require("../utils/id.generator").createIdJadwal;
const validateInsertTimeSchedule =
	require("../utils/checker.js").validateInsertTimeSchedule;
const isTimeInRange = require("../utils/checker.js").isTimeInRange;
const isSksCountAvailable = require("../utils/checker").isSksCountAvailable;
const isMatkulSelected = require("../utils/checker.js").isMatkulSelected;
const isCapacityBenchFulfilled =
	require("../utils/checker.js").isCapacityBenchFulfilled;
// view controller
exports.viewDosen = (req, res) => {
	Dosen.findAll({
		attributes: ["nip", "nama", "tanggal_lahir", "gender", "no_hp"],
	})
		.then((result) => {
			console.log(result);
			const arrResult = result.map((el) => el.dataValues);
			res.status(200).json({ message: "Data dikirimkan", data: arrResult });
		})
		.catch((err) => {
			console.log(err);
			res.status(404).json({ message: "data tidak tersedia" });
		});
};
exports.viewDosenPa = async (req, res) => {
	try {
		const result = await DosenPa.findAll({
			include: [{ model: Dosen, attributes: ["nama", "nip"] }],
		});
		const arrResult = result.map((el) => {
			return el.dataValues;
		});
		res.status(200).json({ message: "Data dikirimkan", data: arrResult });
	} catch (err) {
		res.status(404).json({ message: "bad request" });
	}
};
exports.viewMahasiswa = async (req, res) => {
	try {
		const result = await Mahasiswa.findAll({
			attributes: ["nim", "nama", "tanggal_lahir", "gender", "no_hp", "ipk"],
			include: DosenPa,
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
exports.viewMatkul = (req, res) => {
	MataKuliah.findAll({
		attributes: ["kode_kelas", "nama_matkul", "sks", "kapasitas"],
		include: [
			{ model: Dosen, attributes: ["nama", "nip"] },
			{ model: ClassRoom, attributes: ["kode_ruang_kelas", "kapasitas"] },
		],
	})
		.then((result) => {
			console.log(result);
			const arrResult = result.map((el) => el.dataValues);
			res.status(200).json({ message: "Data dikirimkan", data: arrResult });
		})
		.catch((err) => {
			console.log(err);
			res.status(404).json({ message: "data tidak tersedia" });
		});
};
exports.viewKelas = (req, res) => {
	ClassRoom.findAll({
		attributes: ["kode_ruang_kelas", "kapasitas"],
	})
		.then((result) => {
			const arrResult = result.map((el) => el.dataValues);
			res.status(200).json({ message: "Data dikirimkan", data: arrResult });
		})
		.catch((err) => {
			console.log(err);
			res.status(404).json({ message: "data tidak tersedia" });
		});
};
exports.viewMatkulbyMahasiswa = (req, res) => {
	const { idMahasiswa } = req.params;
	Krs.findAll({
		where: {
			MahasiswaNim: idMahasiswa,
		},
		attributes: ["MataKuliahKodeKelas"],
	})
		.then((result) => {
			const arrRes = result.map((err) => err.dataValues);
			res.status(200).json({ message: "data ditampilkan", data: arrRes });
		})
		.catch((err) => {
			console.log(err);
			res.status(404).json({ message: "bad request" });
		});
};
exports.viewMahasiswabyMatkul = (req, res) => {
	const { idMatkul } = req.params;
	Krs.findAll({
		where: {
			MataKuliahKodeKelas: idMatkul,
		},
		attributes: ["MahasiswaNim"],
	})
		.then((result) => {
			const arrRes = result.map((err) => err.dataValues);
			res.status(200).json({ message: "data ditampilkan", data: arrRes });
		})
		.catch((err) => {
			console.log(err);
			res.status(404).json({ message: "bad request" });
		});
};

// post controller
exports.addDosen = (req, res) => {
	const { nip, nama, tanggal_lahir, gender, no_hp, ipk } = req.body;
	Dosen.create({
		nip: nip,
		nama: nama,
		tanggal_lahir: tanggal_lahir,
		gender: gender,
		no_hp: no_hp,
	})
		.then(() => {
			res.status(200).json({ message: "data berhasil ditambahkan" });
		})
		.catch((err) => {
			console.log(err);
			res.status(404).json({ message: "data gagal ditambahkan" });
		});
};
exports.addMahasiswa = (req, res) => {
	const { nim, nama, tanggal_lahir, gender, no_hp, ipk, nip_dosen } = req.body;
	Mahasiswa.create({
		nim,
		nama,
		tanggal_lahir,
		gender,
		no_hp,
		ipk,
		nip_dosen,
	})
		.then(() => {
			res.status(200).json({ message: "data berhasil ditambahkan" });
		})
		.catch((err) => {
			console.log(err);
			res.status(404).json({ message: "data gagal ditambahkan" });
		});
};
exports.addMatkul = (req, res) => {
	const { kode_kelas, nama_matkul, sks, kapasitas } = req.body;

	MataKuliah.create({
		kode_kelas,
		nama_matkul,
		sks,
		kapasitas,
	})
		.then(() => {
			res.status(200).json({ message: "data berhasil ditambahkan" });
		})
		.catch((err) => {
			console.log(err);
			res.status(404).json({ message: "data gagal ditambahkan" });
		});
};
exports.addDosenPa = (req, res) => {
	const { nip_dosen } = req.body;
	DosenPa.create({ nip_dosen })
		.then(() => {
			res.status(200).json({ message: "data berhasil ditambahkan" });
		})
		.catch((err) => {
			console.log(err);
			res.status(404).json({ message: "data gagal ditambahkan" });
		});
};
exports.addKelas = (req, res) => {
	const { kode_ruang_kelas, kapasitas } = req.body;
	ClassRoom.create({
		kode_ruang_kelas,
		kapasitas,
	})
		.then(() => {
			res.status(200).json({ message: "data berhasil ditambahkan" });
		})
		.catch((err) => {
			console.log(err);
			res.status(404).json({ message: "data gagal ditambahkan" });
		});
};
exports.addKrs = async (req, res) => {
	// input berupa nim mahasiswa dan mata kuliah yang akan dipilih
	const { MahasiswaNim, MataKuliahKodeKelas } = req.body;
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
exports.addJadwal = async (req, res) => {
	const { hari, start_time, end_time } = req.query;
	const hariLowerCase = hari.toLowerCase();
	const id = createIdJadwal(hariLowerCase);
	if (validateInsertTimeSchedule(start_time, end_time, hariLowerCase)) {
		try {
			const availJadwal = await Jadwal.findAll({
				where: {
					hari: hariLowerCase,
				},
				attributes: ["start_class_time", "end_class_time"],
			});
			if (availJadwal.length !== 0) {
				const arrVal = availJadwal.map((el) => el.dataValues);
				if (checkArrInRange(arrVal, start_time, end_time)) {
					res
						.status(500)
						.json({ message: "waktu bertabrakan | data gagal ditambahkan" });
				} else {
					await Jadwal.create({
						id,
						hari,
						start_class_time: start_time,
						end_class_time: end_time,
					})
						.then(() => {
							res.status(200).json({ message: "data sukses ditambahkan" });
						})
						.catch((err) => {
							console.log(err);
							res.status(500).json({ message: "data gagal ditambahkan" });
						});
				}
			} else {
				await Jadwal.create({
					id,
					hari: hariLowerCase,
					start_class_time: start_time,
					end_class_time: end_time,
				});
				res.status(200).json({ message: "data sukses ditambahkan" });
			}
		} catch (err) {
			console.log(err);
			res.status(404).json({ message: "gagal menambahkan data" });
		}
	} else {
		res.status(400).json({
			message:
				"format query salah || format atau range waktu tidak valid  || hari tidak senin - jumat : read documentation !",
		});
	}
};

// update controller
exports.updateMatkul = async (req, res) => {
	// able to update nip_dosen, kode_ruang_kelas, nama_matkul
	// update ruang kelas if capacity is enough

	const { nip_dosen, kode_ruang_kelas, nama_matkul, sks, kapasitas, idJadwal } =
		req.query;
	const { matkulId } = req.params;
	let kode_ruang = null;
	
	try {
		const matkul = await MataKuliah.findOne({
			where: { kode_kelas: matkulId },
		});
		const ruangKelas = await ClassRoom.findOne({
			where: { kode_ruang_kelas: kode_ruang },
		});
		if (kode_ruang_kelas) {
			kode_ruang = kode_ruang_kelas;
			if (!isCapacityBenchFulfilled(matkul, ruangKelas, kapasitas)) {
				kode_ruang = null;
			}
		}
		
		MataKuliah.update(
			{
				nip_dosen,
				kode_ruang_kelas: sequelize.literal(
					`COALESCE(kode_ruang_kelas, ${sequelize.escape(kode_ruang)})`
				),
				nama_matkul,
				sks,
				kapasitas,
				idJadwal,
			},
			{
				where: {
					kode_kelas: matkulId,
				},
			}
		)
			.then(([affectedRows]) => {
				if (affectedRows === 0) {
					res.status(400).json({ message: "data  tidak ditemukan" });
				} else {
					res.status(200).json({ message: "sukses mengupdate data" });
				}
			})
			.catch((err) => {
				console.log(err);
				res.status(404).json({ message: "gagal mengupdate data" });
			});
	} catch (err) {
		console.log(err);
		res.status(504).json({ message: "gagal menambah data" });
	}
};
exports.updateDosen = (req, res) => {
	// able to update nama , tanggal_lahir, gender, no_hp
	const { nama, tanggal_lahir, gender, no_hp } = req.query;
	const { dosenId } = req.params;
	Dosen.update(
		{ nama, tanggal_lahir, gender, no_hp },
		{
			where: {
				nip: dosenId,
			},
		}
	)
		.then(([affectedRows]) => {
			if (affectedRows === 0) {
				res.status(404).json({ message: "data tidak ditemukan" });
			} else {
				res.status(200).json({ message: "data berhasil di update" });
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(400).json({ message: "gagal mengupdate data" });
		});
};
exports.updateMahasiswa = (req, res) => {
	const { nama, tanggal_lahir, gender, no_hp, ipk, nip_dosen } = req.query;
	const { mhsId } = req.params;
	Mahasiswa.update(
		{ nama, tanggal_lahir, gender, no_hp, ipk, nip_dosen },
		{
			where: {
				nim: mhsId,
			},
		}
	)
		.then(([affectedRows]) => {
			if (affectedRows === 0) {
				res.status(404).json({ message: "data tidak ditemukan" });
			} else {
				res.status(200).json({ message: "data berhasil di update" });
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(400).json({ message: "gagal mengupdate data" });
		});
};
exports.updateKelas = (req, res) => {
	const { kapasitas } = req.query;
	const { kodeRuangKelas } = req.params;
	ClassRoom.update(
		{ kapasitas },
		{
			where: {
				kode_ruang_kelas: kodeRuangKelas,
			},
		}
	)
		.then(([affectedRows]) => {
			if (affectedRows === 0) {
				res.status(404).json({ message: "data tidak ditemukan" });
			} else {
				res.status(200).json({ message: "data berhasil di update" });
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(400).json({ message: "gagal mengupdate data" });
		});
};

// delete controller
exports.deleteMahasiswa = (req, res) => {
	const { mhsId } = req.params;
	Mahasiswa.destroy({
		where: {
			nim: mhsId,
		},
	})
		.then((rowDeleted) => {
			if (rowDeleted === 1) {
				res.status(200).json({ message: "sukses menghapus data" });
			} else {
				res.status(404).json({ message: "data not found" });
			}
		})
		.catch((err) => {
			res.status(409).json({ message: err.message });
		});
};
exports.deleteDosen = (req, res) => {
	const { dosenId } = req.params;
	Dosen.destroy({
		where: {
			nip: dosenId,
		},
	})
		.then((rowDeleted) => {
			if (rowDeleted === 1) {
				res.status(200).json({ message: "sukses menghapus data" });
			} else {
				res.status(404).json({ message: "data not found" });
			}
		})
		.catch((err) => {
			res.status(409).json({ message: err.message });
		});
};
exports.deleteDosenPa = (req, res) => {
	const { dosenId } = req.params;
	DosenPa.destroy({
		where: {
			nip_dosen: dosenId,
		},
	})
		.then((rowDeleted) => {
			if (rowDeleted === 1) {
				res.status(200).json({ message: "sukses menghapus data" });
			} else {
				res.status(404).json({ message: "data not found" });
			}
		})
		.catch((err) => {
			res.status(409).json({ message: err.message });
		});
};
exports.deleteKelas = (req, res) => {
	const { kelasId } = req.params;
	ClassRoom.destroy({
		where: {
			kode_ruang_kelas: kelasId,
		},
	})
		.then((rowDeleted) => {
			if (rowDeleted === 1) {
				res.status(200).json({ message: "sukses menghapus data" });
			} else {
				res.status(404).json({ message: "data not found" });
			}
		})
		.catch((err) => {
			res.status(409).json({ message: err.message });
		});
};
exports.deleteMatkul = (req, res) => {
	const { matkulId } = req.params;
	MataKuliah.destroy({
		where: {
			kode_kelas: matkulId,
		},
	})
		.then((rowDeleted) => {
			if (rowDeleted === 1) {
				res.status(200).json({ message: "sukses menghapus data" });
			} else {
				res.status(404).json({ message: "data not found" });
			}
		})
		.catch((err) => {
			res.status(409).json({ message: err.message });
		});
};
exports.deleteJadwal = async (req, res) => {
	const { idJadwal } = req.params;
	try {
		const deleted = await Jadwal.destroy({ where: { id: idJadwal } });
		if (deleted == 0) {
			res.status(400).json({ message: "data tidak ditemukan" });
		} else {
			res.status(200).json({ message: "data dihapus" });
		}
	} catch (err) {
		console.log(err);
		res.status(400).json({ message: "data gagal dihapus" });
	}
};
exports.deleteKrs = (req, res) => {
	const { MahasiswaNim, MataKuliahKodeKelas } = req.body;
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
