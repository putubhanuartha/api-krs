const { DataTypes } = require("sequelize");
const sequelize = require("../utils/orm");
const Dosen = sequelize.define(
	"Dosen",
	{
		nip: {
			primaryKey: true,
			unique: true,
			allowNull: false,
			get() {
				return this.getDataValue("nip");
			},
			type: DataTypes.STRING,
		},
		nama: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		tanggal_lahir: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		gender: {
			type: DataTypes.CHAR(1),
			allowNull: false,
		},
		no_hp: {
			type: DataTypes.STRING(20),
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING,
		},
	},
	{ freezeTableName: true }
);
// Dosen.sync();
module.exports = Dosen;
