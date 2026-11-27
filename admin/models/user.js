import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true,
    },
    phone: {
        type: DataTypes.STRING(15),
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'activo',
    },
    status_reason: {
        type: DataTypes.STRING(300),
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'users',
    timestamps: false,
    // Por defecto la contraseña NUNCA se devuelve.
    // Para el login se usa User.scope('withPassword').
    defaultScope: {
        attributes: { exclude: ['password'] },
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password'] },
        },
    },
});

export default User;
