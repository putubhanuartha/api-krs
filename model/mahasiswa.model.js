const { DataTypes } = require("sequelize");
const sequelize = require("../utils/orm");
const MataKuliah = require("./matakuliah.model.js");
const DosenPa = require("./dosenpa.model");
const Mahasiswa = sequelize.define(
	"Mahasiswa",
	{
		nim: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		nama: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		tanggal_lahir: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		gender: {
			type: DataTypes.CHAR,
			allowNull: false,
		},
		no_hp: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		ipk: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		total_krs: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue : 0
		},
	},
	{ freezeTableName: true }
);
DosenPa.hasMany(Mahasiswa, {
	foreignKey: { allowNull: true, name: "nip_dosen" },
});
Mahasiswa.belongsTo(DosenPa, {
	foreignKey: { allowNull: true, name: "nip_dosen" },
});
// Mahasiswa.sync({ alter: true });
module.exports = Mahasiswa;
