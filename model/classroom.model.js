const { DataTypes } = require("sequelize");
const sequelize = require("../utils/orm");
const ClassRoom = sequelize.define(
	"class_room",
	{
		kode_ruang_kelas: {
			type: DataTypes.STRING(10),
			primaryKey: true,
			allowNull: false,
			unique: true,
		},
		kapasitas: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{ freezeTableName: true }
);
// ClassRoom.sync();
module.exports = ClassRoom;
