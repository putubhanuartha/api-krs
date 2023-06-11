const { sequelize } = require("../utils/orm");
const Dosen = require("../model/dosen.model");
const Krs = require("../model/krs.model");
const MataKuliah = require("../model/matakuliah.model");
const Mahasiswa = require("../model/mahasiswa.model");
const DosenPa = require("../model/dosenpa.model");
const Jadwal = require("../model/jadwal.model");
const { Op, QueryTypes } = require("sequelize");
const isTimeInRange = require("../utils/checker").isTimeInRange;
const isMatkulSelected = require("../utils/checker").isMatkulSelected;
const isSksCountAvailable = require("../utils/checker").isSksCountAvailable;
const bcrypt = require("bcrypt");
exports.viewKrs = (req, res) => {
	const idMahasiswa = req.session.uid;
	sequelize
		.query(`CALL  SHOW_KRS_MATKUL("${idMahasiswa}")`, {
			model: Krs,
			mapToModel: true,
		})
		.then((arrRes) => {
			if (arrRes == null || arrRes.length == 0) {
				res.status(404).json({
					message: "data krs mahasiswa tidak ditemukan",
					status: 404,
					error: true,
				});
			} else {
				res.status(200).json({
					message: "data krs mahasiswa sukses dikirimkan",
					data: arrRes[0],
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
		res.status(500).json({
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
		const responseAdd = await sequelize.query(
			`CALL ADD_MATKUL_KRS_MHS('${MahasiswaNim}','${MataKuliahKodeKelas}')`
		);
		res.status(responseAdd[0].status).json({
			message: responseAdd[0].message,
			error: false,
			status: responseAdd[0].status,
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

// authentication
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
		if (
			bcrypt.compareSync(password, await mahasiswa.getDataValue("password"))
		) {
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
