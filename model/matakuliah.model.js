const { DataTypes } = require("sequelize");
const sequelize = require("../utils/orm");
const ClassRoom = require("./classroom.model.js");
const Dosen = require("./dosen.model.js");
const Jadwal = require("./jadwal.model.js");
const MataKuliah = sequelize.define(
	"MataKuliah",
	{
		kode_kelas: {
			type: DataTypes.STRING(10),
			allowNull: false,
			primaryKey: true,
		},
		nama_matkul: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		sks: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		kapasitas: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		filled_bench: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		kode_ruang_kelas: {
			type: DataTypes.STRING(10),
			allowNull: true,
			unique: "unik_jadwal_kelas",
		},
		idJadwal: {
			type: DataTypes.STRING,
			unique: "unik_jadwal_kelas",
			allowNull: true,
		},
	},
	{ freezeTableName: true }
);
Dosen.hasMany(MataKuliah, {
	foreignKey: { allowNull: true, name: "nip_dosen" },
});
MataKuliah.belongsTo(Dosen, {
	foreignKey: { allowNull: true, name: "nip_dosen" },
});
ClassRoom.hasMany(MataKuliah, {
	foreignKey: { name: "kode_ruang_kelas" },
});
MataKuliah.belongsTo(ClassRoom, {
	foreignKey: { name: "kode_ruang_kelas" },
});
Jadwal.hasMany(MataKuliah, { foreignKey: "idJadwal" });
MataKuliah.belongsTo(Jadwal, { foreignKey: "idJadwal" });
MataKuliah.sync();
module.exports = MataKuliah;
