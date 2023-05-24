const sequelize = require("../utils/orm");
const Dosen = require("../model/dosen.model");

const DosenPa = sequelize.define("DosenPa", {}, { freezeTableName: true });
Dosen.hasOne(DosenPa, { foreignKey: { allowNull: false, name: "nip_dosen" } });
DosenPa.belongsTo(Dosen, {
	foreignKey: { allowNull: false, name: "nip_dosen", unique: true },
});
DosenPa.sync();
module.exports = DosenPa;
