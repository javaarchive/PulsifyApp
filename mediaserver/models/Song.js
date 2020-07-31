const { DataTypes } = require("sequelize");
module.exports = function(sequelize) {
	const Song = sequelize.define(
		"Song",
		{
			artist: {
				type: DataTypes.STRING,
			},
			albumPicture: {
                type: DataTypes.STRING,
                defaultValue: "static/BlankAlbum.png"
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            contentURI: {
                type: DataTypes.STRING
            },id:{
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true
            },AlbumID:{
                type: DataTypes.BIGINT,
                allowNull: true
            }
		},
		{
			// Other model options go here
		}
    );
    return Song;
};
