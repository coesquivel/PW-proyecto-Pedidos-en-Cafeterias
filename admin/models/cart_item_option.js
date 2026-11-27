import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const CartItemOption = sequelize.define('CartItemOption', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    cart_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    product_option_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'cart_item_options',
    timestamps: false,
});

export default CartItemOption;
