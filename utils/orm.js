const { Sequelize , DataTypes} = require("sequelize");
require("dotenv").config();
const session = require("express-session");
const SessionStore = require("connect-session-sequelize")(session.Store);

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USERNAME,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: process.env.DB_DIALECT,
		port: process.env.DB_PORT,
	}
);
const Session = sequelize.define("Session", {
	sid: {
		type: DataTypes.STRING,
		primaryKey: true,
	},
	expires: {
		type: DataTypes.DATE,
	},
	data: {
		type: DataTypes.TEXT,
	},
});
const sequelizeSesssionStore = new SessionStore({
	db: sequelize,
	expiration: 24 * 60 * 60 * 1000,
	table: "Session",
	modelKey: Session,
});
sequelizeSesssionStore.sync();
module.exports = { sequelize, sequelizeSesssionStore };
