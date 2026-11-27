import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const OrderItemOption = sequelize.define('OrderItemOption', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    option_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    additional_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        get() {
            const value = this.getDataValue('additional_price');
            return value === null ? null : Number(value);
        },
    },
    order_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'order_item_options',
    timestamps: false,
});

export default OrderItemOption;
