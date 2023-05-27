const crypto = require("crypto");
const createIdJadwal = (hari) => {
	return hari.substring(0, 3) + "|" + crypto.randomBytes(10).toString("hex");
};
const createIdUser = (username) => {
	const hash = crypto.createHash("sha1");
	const dateString = new Date().getTime().toLocaleString();
	hash.update(username + dateString);
	return hash.digest("hex");
};
module.exports = { createIdJadwal, createIdUser };
