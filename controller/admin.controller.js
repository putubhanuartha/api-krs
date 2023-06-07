const Mahasiswa = require("../model/mahasiswa.model.js");
const Dosen = require("../model/dosen.model.js");
const MataKuliah = require("../model/matakuliah.model.js");
const DosenPa = require("../model/dosenpa.model");
const ClassRoom = require("../model/classroom.model.js");
const Krs = require("../model/krs.model.js");
const Jadwal = require("../model/jadwal.model.js");
const Admin = require("../model/admin.model");
const { sequelize } = require("../utils/orm.js");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const createIdJadwal = require("../utils/id.generator").createIdJadwal;
const createIdUser = require("../utils/id.generator").createIdUser;
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
		attributes: {
			exclude: ["password"],
		},
	})
		.then((result) => {
			const arrResult = result.map((el) => el.dataValues);
			if (arrResult == null || arrResult.length == 0) {
				return res
					.status(404)
					.json({ message: "data tidak ditemukan", status: 404, error: true });
			} else {
				return res.status(200).json({
					message: "Data dosen berhasil dikirimkan",
					data: arrResult,
					status: 200,
					error: false,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal memberikan data",
				status: 500,
				error: true,
			});
		});
};
exports.viewDosenPa = async (req, res) => {
	try {
		const result = await DosenPa.findAll({
			include: [{ model: Dosen, attributes: ["nama", "nip"] }],
			attributes: {
				exclude: ["password"],
			},
		});
		const arrResult = result.map((el) => {
			return el.dataValues;
		});
		if (arrResult.length == 0 || arrResult == null) {
			res
				.status(404)
				.json({ message: "data tidak ditemukan", status: 404, error: true });
		} else {
			res.status(200).json({
				message: "Data dikirimkan",
				data: arrResult,
				status: 200,
				error: false,
			});
		}
	} catch (err) {
		res.status(500).json({
			message: "server gagal mengirimkan data",
			status: 500,
			error: true,
		});
	}
};
exports.viewMahasiswa = async (req, res) => {
	try {
		const result = await Mahasiswa.findAll({
			attributes: {
				exclude: ["password"],
			},
			include: {
				model: DosenPa,
				attributes: { exclude: ["password"] },
			},
		});

		const arrRes = await Promise.all(
			result.map(async (er) => {
				let namaDosen = null;
				if (er.dataValues.DosenPa) {
					const nip = er.dataValues.DosenPa.dataValues.nip_dosen;
					namaDosen = await Dosen.findOne({
						where: { nip },
						attributes: {
							exclude: ["password"],
						},
					});
				}
				return { ...er.dataValues, DosenPa: namaDosen };
			})
		);
		if (arrRes == null || arrRes.length == 0) {
			res
				.status(404)
				.json({ message: "data tidak ditemukan", status: 404, error: true });
		} else {
			res.status(200).json({
				message: "data mahasiswa berhasil dikirimkan",
				data: arrRes,
				status: 200,
				error: false,
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "server gagal memproses data",
			status: 500,
			error: true,
		});
	}
};
exports.viewMatkul = (req, res) => {
	MataKuliah.findAll({
		attributes: {
			exclude: ["createdAt, updatedAt"],
		},
		include: [
			{ model: Dosen, attributes: { exclude: ["password"] } },
			{ model: ClassRoom },
			{ model: Jadwal },
		],
	})
		.then((result) => {
			console.log(result);
			const arrResult = result.map((el) => el.dataValues);
			if (arrResult == null || arrResult.length == 0) {
				res
					.status(404)
					.json({ message: "Data tidak ditemukan", status: 404, error: true });
			} else {
				res.status(200).json({
					message: "Data mata kuliah berhasil dikirimkan",
					data: arrResult,
					status: 200,
					error: false,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal mengirimkan data",
				status: 500,
				error: true,
			});
		});
};
exports.viewKelas = (req, res) => {
	ClassRoom.findAll()
		.then((result) => {
			const arrResult = result.map((el) => el.dataValues);
			if (arrResult == null || arrResult.length == 0) {
				res.status(404).json({
					message: "data ruang kelas tidak ditemukan",
					status: 404,
					error: true,
				});
			} else {
				res.status(200).json({
					message: "Data ruang kelas berhasil dikirimkan",
					data: arrResult,
					status: 200,
					error: false,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal memproses data",
				status: 500,
				error: true,
			});
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
			if (arrRes == null || arrRes.length == 0) {
				res
					.status(404)
					.json({ message: "data tidak ditemukan", status: 404, error: true });
			} else {
				res.status(200).json({
					message: "data berhasil dikirimkan",
					data: arrRes,
					status: 200,
					error: false,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal memproses data",
				status: 500,
				error: true,
			});
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
			if (arrRes == null || arrRes.length == 0) {
				res
					.status(404)
					.json({ message: "data tidak ditemukan", status: 404, error: true });
			} else {
				res.status(200).json({
					message: "data ditampilkan",
					data: arrRes,
					status: 200,
					error: false,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal memproses data",
				status: 500,
				error: true,
			});
		});
};
exports.viewJadwal = (req, res) => {
	Jadwal.findAll()
		.then((data) => {
			if (data == null || data.length == 0) {
				res
					.status(404)
					.json({ message: "data tidak ditemukan", status: 404, error: true });
			} else {
				res.status(200).json({
					message: "data berhasil dikirimkan",
					data,
					status: 200,
					error: false,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal memproses data",
				status: 500,
				error: true,
			});
		});
};
exports.viewBio = async (req, res) => {
	try {
		const admin = await Admin.findOne({
			where: { id: req.session.uid },
			attributes: { exclude: ["password"] },
		});
		if (admin.length == 0 || admin == null) {
			res
				.status(403)
				.json({ message: "data tidak ditemukan", status: 403, error: true });
		} else {
			res.status(200).json({
				message: "data dikirmkan",
				data: admin,
				status: 200,
				error: false,
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "server gagal memproses data",
			status: 500,
			error: true,
		});
	}
};

// post controller
exports.addDosen = (req, res) => {
	const { nip, nama, tanggal_lahir, gender, no_hp } = req.body;
	Dosen.create({
		nip: nip,
		nama: nama,
		tanggal_lahir: tanggal_lahir,
		gender: gender,
		no_hp: no_hp,
	})
		.then(() => {
			res.status(200).json({
				message: "data berhasil ditambahkan",
				status: 200,
				error: false,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal menambahkan data",
				status: 500,
				error: true,
			});
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
			res.status(200).json({
				message: "data berhasil ditambahkan",
				status: 200,
				error: false,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal menambahkan data",
				status: 500,
				error: true,
			});
		});
};
exports.addMatkul = (req, res) => {
	const {
		kode_kelas,
		nama_matkul,
		sks,
		kapasitas,
		kode_ruang_kelas,
		idJadwal,
		nip_dosen,
	} = req.body;
	MataKuliah.create({
		kode_kelas,
		nama_matkul,
		sks,
		kapasitas,
		idJadwal,
		nip_dosen,
		kode_ruang_kelas,
	})
		.then(() => {
			res.status(200).json({
				message: "data berhasil ditambahkan",
				status: 200,
				error: false,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal menambahkan data",
				status: 500,
				error: true,
			});
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
			res.status(500).json({
				message: "server gagal menambahkan data",
				status: 500,
				error: true,
			});
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
			res.status(500).json({
				message: "server gagal menambahkan data",
				status: 500,
				error: true,
			});
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
			res.status(400).json({
				message: "Mahasiswa sudah memiliki matkul tersebut",
				status: 400,
				error: true,
			});
			return;
		}

		// Check apakah matkul yang dipilih ada pada database
		// Jika matkul ada, Check terlebih dahulu apakah mata kuliah teresebut memiliki jadwal
		const matkulFounded = await MataKuliah.findOne({
			where: { kode_kelas: MataKuliahKodeKelas, idJadwal: { [Op.ne]: null } },
		});
		if (!matkulFounded) {
			res.status(404).json({
				message:
					"Mata kuliah belum memiliki jadwal || Mata kuliah tidak ditemukan",
				status: 404,
				error: true,
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
			return el.dataValues.jadwal.dataValues;
		});

		if (
			checkArrInRange(
				arrJadwal,
				selectedMatkul.getDataValue("jadwal").dataValues.start_class_time,
				selectedMatkul.getDataValue("jadwal").dataValues.end_class_time,
				selectedMatkul.getDataValue("jadwal").dataValues.hari
			)
		) {
			res
				.status(400)
				.json({ message: "data jadwal bertabrakan", status: 400, error: true });
			return;
		}

		// Check apakah kapasitas kelas mata kuliah tersebut masih ada
		// count and compare matkul capacity
		if (
			selectedMatkul.getDataValue("filled_bench") ==
			selectedMatkul.getDataValue("kapasitas")
		) {
			res.status(400).json({
				message: "kapasitas kelas melebihi",
				status: 400,
				error: true,
			});
			return;
		}

		// check matkul availability for mahasiswa based on their IPK and selected SKS
		// check apakah mahasiswa boleh memilih matkul tersebut berdasarkan IPK dan jumlah sks mereka
		if (!isSksCountAvailable(mahasiswa, sks)) {
			res.status(400).json({
				message: "IPK Mahasiswa tidak mencukupi",
				status: 400,
				error: true,
			});
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
				res.status(200).json({
					message: "data berhasil ditambahkan",
					status: 200,
					error: false,
				});
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({
					message: "server gagal menambahkan data",
					status: 500,
					error: true,
				});
			});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "server gagal menambahkan data",
			status: 500,
			error: true,
		});
	}
};
exports.addJadwal = async (req, res) => {
	const { hari, start_time, end_time } = req.body;
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
					res.status(404).json({
						message: "data  tidak ditemukan",
						status: 404,
						error: true,
					});
				} else {
					res.status(200).json({
						message: "sukses mengupdate data",
						status: 200,
						error: false,
					});
				}
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({
					message: "server gagal mengupdate data",
					status: 500,
					error: true,
				});
			});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "server gagal mengupdate data",
			status: 500,
			error: true,
		});
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
				res.status(404).json({
					message: "data  tidak ditemukan",
					status: 404,
					error: true,
				});
			} else {
				res.status(200).json({
					message: "sukses mengupdate data",
					status: 200,
					error: false,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal mengupdate data",
				status: 500,
				error: true,
			});
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
				res.status(404).json({
					message: "data  tidak ditemukan",
					status: 404,
					error: true,
				});
			} else {
				res.status(200).json({
					message: "sukses mengupdate data",
					status: 200,
					error: false,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal mengupdate data",
				status: 500,
				error: true,
			});
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
				res.status(404).json({
					message: "data  tidak ditemukan",
					status: 404,
					error: true,
				});
			} else {
				res.status(200).json({
					message: "sukses mengupdate data",
					status: 200,
					error: false,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal mengupdate data",
				status: 500,
				error: true,
			});
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
				res.status(200).json({
					message: "sukses menghapus data",
					status: 200,
					error: false,
				});
			} else {
				res.status(404).json({
					message: "data tidak ditemukan, data tidak dihapus",
					status: 404,
					error: true,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal menghapus data",
				status: 500,
				error: true,
			});
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
				res.status(200).json({
					message: "sukses menghapus data",
					status: 200,
					error: false,
				});
			} else {
				res.status(404).json({
					message: "data tidak ditemukan, data tidak dihapus",
					status: 404,
					error: true,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal menghapus data",
				status: 500,
				error: true,
			});
		});
};
exports.deleteDosenPa = (req, res) => {
	const { dosenPaId } = req.params;
	DosenPa.destroy({
		where: {
			nip_dosen: dosenPaId,
		},
	})
		.then((rowDeleted) => {
			if (rowDeleted === 1) {
				res.status(200).json({
					message: "sukses menghapus data",
					status: 200,
					error: false,
				});
			} else {
				res.status(404).json({
					message: "data tidak ditemukan, data tidak dihapus",
					status: 404,
					error: true,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal menghapus data",
				status: 500,
				error: true,
			});
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
				res.status(200).json({
					message: "sukses menghapus data",
					status: 200,
					error: false,
				});
			} else {
				res.status(404).json({
					message: "data tidak ditemukan, data tidak dihapus",
					status: 404,
					error: true,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal menghapus data",
				status: 500,
				error: true,
			});
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
				res.status(200).json({
					message: "sukses menghapus data",
					status: 200,
					error: false,
				});
			} else {
				res.status(404).json({
					message: "data tidak ditemukan, data tidak dihapus",
					status: 404,
					error: true,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server gagal menghapus data",
				status: 500,
				error: true,
			});
		});
};
exports.deleteJadwal = async (req, res) => {
	const { idJadwal } = req.params;
	try {
		const deleted = await Jadwal.destroy({ where: { id: idJadwal } });
		if (deleted == 0) {
			res.status(404).json({
				message: "data tidak ditemukan, data tidak dihapus",
				status: 404,
				error: true,
			});
		} else {
			res
				.status(200)
				.json({ message: "data berhasil dihapus", status: 200, error: false });
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "server gagal menghapus data",
			status: 500,
			error: true,
		});
	}
};

exports.signupAdmin = async (req, res) => {
	const { username, password } = req.body;
	const salt = bcrypt.genSaltSync(9);
	if (username && password) {
		const hashedPassword = bcrypt.hashSync(password, salt);
		try {
			await Admin.create({
				id: createIdUser(username),
				username,
				password: hashedPassword,
			});
			res.status(200).json({
				message: "admin berhasil terdaftar",
				status: 200,
				error: false,
			});
		} catch (err) {
			res.status(500).json({
				message: "admin gagal mendaftar || duplikasi username",
				status: 500,
				error: true,
			});
		}
		return;
	}
	res
		.status(400)
		.json({ message: "password || nama kosong", status: 400, error: true });
};
exports.logoutAdmin = async (req, res) => {
	try {
		if (req.session) {
			return req.session.destroy((err) => {
				if (err) {
					res.status(401).json({
						message: "user not authenticated",
						status: 401,
						error: true,
					});
				} else {
					res.status(200).json({
						message: "user berhasil log out",
						error: false,
						status: 200,
					});
				}
			});
		}
	} catch (err) {
		console.log(err);
		res
			.status(401)
			.json({ message: "user not authenticated", error: true, status: 401 });
	}
};
exports.loginAdmin = async (req, res) => {
	const { username, password } = req.body;
	try {
		const userAdmin = await Admin.findOne({
			where: {
				username,
			},
		});
		if (!userAdmin) {
			return res.status(404).json({
				message: "username tidak ditemukan",
				status: 404,
				error: true,
			});
		}
		if (bcrypt.compareSync(password, userAdmin.getDataValue("password"))) {
			req.session.uid = await userAdmin.getDataValue("id");
			req.session.role = "admin";
			req.session.isLoggedIn = true;
			return res
				.status(200)
				.json({ message: "admin berhasil log in", status: 200, error: false });
		}
		res.status(401).json({
			message: "password salah",
			status: 401,
			error: true,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "Server Error, Cannot Log in",
			status: 500,
			error: true,
		});
	}
};
exports.getLoginCsrf = (req, res) => {
	res
		.status(200)
		.json({ csrfToken: req.csrfToken(), error: false, status: 200 });
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
