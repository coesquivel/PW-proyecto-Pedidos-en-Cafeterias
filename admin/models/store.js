import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    commercial_name: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    campus_location: {
        type: DataTypes.STRING(100),
    },
    ruc: {
        type: DataTypes.STRING(11),
        unique: true,
    },
    campus: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'Monterrico',
    },
    description: {
        type: DataTypes.STRING(240),
    },
    logo_url: {
        type: DataTypes.STRING(150),
    },
    operative_status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pendiente',
    },
    reception_status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'abierto',
    },
    status_reason: {
        type: DataTypes.STRING(300),
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'stores',
    timestamps: false,
});

export default Store;
