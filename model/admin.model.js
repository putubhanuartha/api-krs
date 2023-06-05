const { DataTypes } = require("sequelize");
const sequelize = require("../utils/orm").sequelize;
const Admin = sequelize.define(
	"Admin",
	{
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
		},
	},
	{ freezeTableName: true }
);
// Admin.sync({ alter: true });
module.exports = Admin;
