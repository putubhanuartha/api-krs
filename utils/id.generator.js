const crypto = require("crypto");
const createIdJadwal = (hari) => {
	return hari.substring(0, 3) + "|" + crypto.randomBytes(10).toString("hex");
};
module.exports = { createIdJadwal };
