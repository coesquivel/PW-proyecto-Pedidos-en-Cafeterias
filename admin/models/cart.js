import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    diner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'carts',
    timestamps: false,
});

export default Cart;
