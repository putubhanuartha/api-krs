const { DataTypes } = require("sequelize");
const sequelize = require("../utils/orm");
const MataKuliah = require("./matakuliah.model");

const Jadwal = sequelize.define(
	"Jadwal",
	{
		id: {
			primaryKey: true,
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		hari: {
			type: DataTypes.ENUM("senin", "selasa", "rabu", "kamis", "jumat"),
			allowNull: false,
			unique: "unik",
		},
		start_class_time: {
			type: DataTypes.TIME,
			allowNull: false,
			unique: "unik",
		},
		end_class_time: {
			type: DataTypes.TIME,
			allowNull: false,
			unique: "unik",
		},
	},
	{ freezeTableName: true }
);

Jadwal.hasMany(MataKuliah, {
	foreignKey: { name: "idJadwal", allowNull: true },
});
MataKuliah.belongsTo(Jadwal, {
	foreignKey: { name: "idJadwal", allowNull: true },
});
// Jadwal.sync({ alter: true });
module.exports = Jadwal;
