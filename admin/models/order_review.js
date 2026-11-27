import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const OrderReview = sequelize.define('OrderReview', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    store_rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    comment: {
        type: DataTypes.TEXT,
    },
    store_reply: {
        type: DataTypes.STRING(500),
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    diner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'order_reviews',
    timestamps: false,
});

export default OrderReview;
