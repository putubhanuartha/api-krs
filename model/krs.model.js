const sequelize = require("../utils/orm");
const Mahasiswa = require("./mahasiswa.model");
const MataKuliah = require("./matakuliah.model");
const Krs = sequelize.define("krs", {}, { freezeTableName: true });
Mahasiswa.belongsToMany(MataKuliah, { through: Krs });
MataKuliah.belongsToMany(Mahasiswa, { through: Krs });
// Krs.sync({ alter: true });
module.exports = Krs;
