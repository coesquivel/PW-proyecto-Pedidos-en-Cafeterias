import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const StorePhoto = sequelize.define('StorePhoto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    url: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'store_photos',
    timestamps: false,
});

export default StorePhoto;
