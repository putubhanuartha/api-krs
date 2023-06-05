exports.adminAuth = async (req, res, next) => {
	if (!req.session.isLoggedIn || !(req.session.role == "admin")) {
		return res.status(403).json({
			message: "you are not authorized, please login as admin",
			status: 403,
			error: true,
		});
	}
	next();
};
exports.dosenAuth = async (req, res, next) => {
	if (!req.session.isLoggedIn || !(req.session.role == "dosen")) {
		return res.status(403).json({
			message: "you are not authorized, please login as dosen",
			status: 403,
			error: true,
		});
	}
	next();
};
exports.dosenPaAuth = async (req, res, next) => {
	if (!req.session.isLoggedIn || !(req.session.role == "dosenpa")) {
		return res.status(403).json({
			message: "you are not authorized, please login as dosen pa",
			status: 403,
			error: true,
		});
	}
	next();
};
exports.mahasiswaAuth = async (req, res, next) => {
	if (!req.session.isLoggedIn || !(req.session.role == "mahasiswa")) {
		return res
			.status(403)
			.json({
				message: "you are not authorized, please login as mahasiswa",
				status: 403,
				error: true,
			});
	}
	next();
};
