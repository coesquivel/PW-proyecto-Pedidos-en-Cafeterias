import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const OrderStatus = sequelize.define('OrderStatus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'order_statuses',
    timestamps: false,
});

export default OrderStatus;
