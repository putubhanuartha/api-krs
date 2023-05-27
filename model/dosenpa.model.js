const sequelize = require("../utils/orm");
const Dosen = require("../model/dosen.model");
const { DataTypes } = require("sequelize");

const DosenPa = sequelize.define(
	"DosenPa",
	{
		password: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{ freezeTableName: true }
);
Dosen.hasOne(DosenPa, { foreignKey: { allowNull: false, name: "nip_dosen" } });
DosenPa.belongsTo(Dosen, {
	foreignKey: { allowNull: false, name: "nip_dosen", unique: true },
});
// DosenPa.sync({ alter: true });
module.exports = DosenPa;
