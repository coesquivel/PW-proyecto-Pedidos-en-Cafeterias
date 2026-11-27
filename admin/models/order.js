import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
    },
    pickup_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    pickup_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        // Postgres devuelve los DECIMAL como texto; el front espera número
        get() {
            const value = this.getDataValue('total_amount');
            return value === null ? null : Number(value);
        },
    },
    created: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    diner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'orders',
    timestamps: false,
});

export default Order;
