import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Diner = sequelize.define('Diner', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'diners',
    timestamps: false,
});

export default Diner;
