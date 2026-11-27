import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const numero = (campo) => function () {
    const value = this.getDataValue(campo);
    return value === null ? null : Number(value);
};

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    product_name: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get: numero('unit_price'),
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get: numero('subtotal'),
    },
    notes: {
        type: DataTypes.STRING(120),
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.INTEGER,
    },
}, {
    tableName: 'order_items',
    timestamps: false,
});

export default OrderItem;
