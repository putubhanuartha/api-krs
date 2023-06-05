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
const bcrypt = require("bcrypt");
exports.viewKrs = (req, res) => {
	const idMahasiswa = req.session.uid;
	Krs.findAll({
		where: { MahasiswaNim: idMahasiswa },
		attributes: ["MataKuliahKodeKelas"],
	})
		.then(async (result) => {
			const arrRes = await Promise.all(
				result.map(async (el) => {
					const matkul = await MataKuliah.findOne({
						where: { kode_kelas: el.dataValues.MataKuliahKodeKelas },
						attributes: { exclude: ["createdAt", "updatedAt"] },
						include: [
							{ model: Dosen, attributes: ["nama"] },
							{
								model: Jadwal,
								attributes: {
									exclude: ["createdAt", "updatedAt"],
								},
							},
						],
					});
					return matkul;
				})
			);
			if (arrRes == null || arrRes.length == 0) {
				res.status(404).json({
					message: "data krs mahasiswa tidak ditemukan",
					status: 404,
					error: true,
				});
			} else {
				res.status(200).json({
					message: "data krs mahasiswa sukses dikirimkan",
					data: arrRes,
					status: 200,
					error: false,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "server  gagal mengirimkan data",
				status: 500,
				error: true,
			});
		});
};
exports.viewMatkul = (req, res) => {
	MataKuliah.findAll({
		where: {
			idJadwal: { [Op.ne]: null },
		},
		attributes: {
			exclude: ["createdAt", "updatedAt"],
		},
		include: [
			{
				model: Jadwal,
				attributes: {
					exclude: ["createdAt", "updatedAt"],
				},
			},
		],
	})
		.then((data) => {
			if (data == null || data.length == 0) {
				res.status(404).json({
					message: "data mata kuliah tidak ditemukan",
					status: 404,
					error: true,
				});
			} else {
				res.status(200).json({
					message: "data mata kuliah berhasil dikirimkan",
					data,
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
			if (result == null || result.length == 0) {
				res.status(404).json({
					message: "data dosen pa tidak ditemukan",
					status: 404,
					error: true,
				});
			} else {
				res.status(200).json({
					message: "data dikirimkan",
					data: result,
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
exports.deleteMatkulKrs = (req, res) => {
	const MahasiswaNim = req.session.uid;
	const MataKuliahKodeKelas = req.params.idMatkul;
	Krs.destroy({
		where: {
			MahasiswaNim,
			MataKuliahKodeKelas,
		},
	})
		.then(async (row) => {
			try {
				if (row == 0) {
					res.status(404).json({
						message: "data krs tidak ditemukan",
						status: 404,
						error: true,
					});
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
						status: 200,
						error: false,
					});
				}
			} catch (err) {
				console.log(err);
				res.status(500).json({
					message: "server gagal menghapus data",
					status: 500,
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
exports.viewMahasiswa = async (req, res) => {
	const idMahasiswa = req.session.uid;
	try {
		const result = await Mahasiswa.findOne({
			attributes: { exclude: [] },
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
		if (arrRes == null || arrRes.length == 0) {
			res
				.status(404)
				.json({ message: "data tidak ditemukan", status: 404, error: true });
		} else {
			res.status(200).json({
				message: "data bio mahasiswa dikirimkan",
				data: arrRes,
				status: 200,
				error: false,
			});
		}
	} catch (err) {
		console.log(err);
		res
			.status(500)
			.json({
				message: "server gagal mengirimkan bio mahasiswa",
				status: 500,
				error: true,
			});
	}
};
exports.addKrsMahasiswa = async (req, res) => {
	const MahasiswaNim = req.session.uid;
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
		const sks = await selectedMatkul.getDataValue("sks");

		// Check terlebih dahulu apakah mahasiswa sudah memiliki matkul tersebut meskipun berbeda kelas, hal tersebut tidak diperbolehkan
		const matkul = await Krs.findAll({
			where: { MahasiswaNim },
			attributes: ["MataKuliahKodeKelas"],
		});
		if (isMatkulSelected(MataKuliahKodeKelas, matkul)) {
			res.status(400).json({
				message:"Mahasiswa sudah memiliki matkul tersebut",
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
			res.status(400).json({
				message:
					"Mata kuliah belum memiliki jadwal atau Mata kuliah tidak ditemukan",
				status: 400,
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
			res.status(400).json({
				message: "data jadwal bertabrakan",
				status: 400,
				error: true,
			});
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
exports.signupMahasiswa = async (req, res) => {
	const { nim, password } = req.body;
	const salt = bcrypt.genSaltSync(10);
	try {
		const mahasiswa = await Mahasiswa.findOne({ where: { nim } });
		if (mahasiswa == null || mahasiswa == []) {
			return res.status(400).json({
				message: "nim mahasiswa tidak ditemukan",
				status: 400,
				error: true,
			});
		}
		mahasiswa.setDataValue("password", bcrypt.hashSync(password, salt));
		await mahasiswa.save();
		return res
			.status(200)
			.json({ message: "akun berhasil terdaftar", status: 200, error: false });
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "server gagal melakukan proses pendaftaran",
			status: 500,
			error: true,
		});
	}
};
exports.loginMahasiswa = async (req, res) => {
	const { nim, password } = req.body;
	try {
		const mahasiswa = await Mahasiswa.findOne({ where: { nim } });
		if (bcrypt.compareSync(password, mahasiswa.getDataValue("password"))) {
			req.session.uid = nim;
			req.session.role = "mahasiswa";
			req.session.isLoggedIn = true;
			return res.status(200).json({
				message: "mahasiswa berhasil log in",
				status: 200,
				error: false,
			});
		} else {
			return res.status(401).json({
				message: "password atau username salah",
				status: 401,
				error: true,
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "server gagal melakukan login",
			status: 401,
			error: true,
		});
	}
};
exports.logoutMahasiswa = async (req, res) => {
	if (req.session) {
		return req.session.destroy((err) => {
			if (err) {
				console.log(err);
				res.status(401).json({
					message: "user not authenticated",
					status: 401,
					error: true,
				});
			} else {
				res.status(200).json({
					message: "mahasiswa berhasil melakukan log out",
					status: 200,
					error: false,
				});
			}
		});
	}
	res.status(403).json({
		message: "user not authenticated",
		status: 403,
		error: true,
	});
};
exports.getLoginCsrf = (req, res) => {
	res.status(200).json({
		message: "token csrf berhasil dikirimkan",
		csrfToken: req.csrfToken(),
		status: 200,
		error: false,
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
