const Dosen = require("../model/dosen.model");
const bcrypt = require("bcrypt");
exports.getCsrfToken = (req, res) => {
	res.status(200).json({
		message: "token csrf berhasil dikirimkan",
		csrfToken: req.csrfToken(),
		status: 200,
		error: false,
	});
};
exports.loginDosen = async (req, res) => {
	const { nip, password } = req.body;
	try {
		const dosen = await Dosen.findOne({
			where: { nip },
			attributes: { exclude: ["password", "createdAt", "updatedAt"] },
		});
		if (bcrypt.compareSync(password, await dosen.getDataValue("password"))) {
			req.session.uid = nip;
			req.session.role = "dosen";
			req.session.isLoggedIn = true;
			return res
				.status(200)
				.json({ message: "dosen berhasil log in", status: 200, error: false });
		} else {
			return res.status(401).json({
				message: "password atau username salah",
				status: 401,
				error: true,
			});
		}
	} catch (err) {
		console.log(err);
		res.status(400).json({
			message: "dosen not found atau credentials salah",
			status: 400,
			error: true,
		});
	}
};
exports.signupDosen = async (req, res) => {
	const { nip, password } = req.body;
	const salt = bcrypt.genSaltSync(10);
	try {
		const cryptPass = bcrypt.hashSync(password, salt);
		await Dosen.update({ password: cryptPass }, { where: nip });
		res
			.status(200)
			.json({ message: "dosen berhasil mendaftar", status: 200, error: false });
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
				res.status(403).json({
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
		const dosen = await Dosen.findOne({
			where: { nip: req.session.uid },
			attributes: {
				exclude: ["password", "createdAt", "updatedAt"],
			},
		});
		res.status(200).json({
			message: "data dikirimkan",
			data: dosen,
			status: 200,
			error: false,
		});
	} catch (err) {
		console.log(err);
		res
			.status(401)
			.json({
				message: "dosen is not authenticated",
				status: 401,
				error: true,
			});
	}
};
