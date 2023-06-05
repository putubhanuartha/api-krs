const DosenPa = require("../model/dosenpa.model");
const Mahasiswa = require("../model/mahasiswa.model");
const Dosen = require("../model/dosen.model");
exports.getCsrfToken = (req, res) => {
	res.status(200).json({
		message: "token csrf berhasil dikirimkan",
		csrfToken: req.csrfToken(),
		status: 200,
		error: false,
	});
};
exports.loginDosenPa = async (req, res) => {
	const { nip, password } = req.body;
	try {
		const dosenPa = await DosenPa.findOne({
			where: { nip_dosen: nip },
			attributes: { exclude: ["password", "createdAt", "updatedAt"] },
		});
		if (bcrypt.compareSync(password, await dosenPa.getDataValue("password"))) {
			req.session.uid = nip;
			req.session.role = "dosenpa";
			req.session.isLoggedIn = true;
			return res
				.status(200)
				.json({ message: "user berhasil login", status: 200, error: false });
		} else {
			return res.status(403).json({
				message: "password atau username salah",
				status: 401,
				error: true,
			});
		}
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			message: "server gagal melakukan login",
			status: 500,
			error: true,
		});
	}
};
exports.signupDosen = async (req, res) => {
	const { nip, password } = req.body;
	const salt = bcrypt.genSaltSync(10);
	try {
		const cryptPass = bcrypt.hashSync(password, salt);
		await DosenPa.update(
			{ password: cryptPass },
			{ where: { nip_dosen: nip } }
		);
		res.status(200).json({
			message: "dosenpa berhasil terdaftar",
			status: 200,
			error: false,
		});
	} catch (err) {
		console.log(err);
		res
			.status(400)
			.json({ message: "nip tidak ditemukan", status: 400, error: true });
	}
};
exports.logoutDosen = async (req, res) => {
	if (req.session) {
		return req.session.destroy((err) => {
			if (err) {
				res.status(401).json({
					message: "user not authenticated",
					status: 401,
					error: true,
				});
			} else {
				res
					.status(200)
					.json({ message: "user logged out", status: 200, error: false });
			}
		});
	}
	res
		.status(401)
		.json({ message: "user not authenticated", status: 401, error: true });
};
exports.viewBioDosen = async (req, res) => {
	try {
		const dosenPa = await Mahasiswa.findAll({
			include: [
				{
					model: DosenPa,
					include: [
						{
							model: Dosen,
							attributes: { exclude: ["password", "createdAt", "updatedAt"] },
						},
					],
					attributes: [],
				},
			],
			attributes: { exclude: ["password", "createdAt", "updatedAt"] },
		});
		res.status(200).json({
			message: "data berhasil dikirimkan",
			data : dosenPa,
			status: 200,
			error: false,
		});
	} catch (err) {
		console.log(err);
		res
			.status(401)
			.json({ message: "dosenpa not authenticated", status: 491, error: true });
	}
};
