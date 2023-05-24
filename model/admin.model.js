const { DataTypes } = require("sequelize");
const sequelize = require("../utils/orm");
const Admin = sequelize.define(
	"Admin",
	{
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		password: {
			type: DataTypes.STRING,
		},
	},
	{ freezeTableName: true }
);
Admin.sync({ alter: true });
module.exports = Admin;
