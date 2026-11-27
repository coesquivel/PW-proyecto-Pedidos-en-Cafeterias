import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(160),
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        // PostgreSQL devuelve los DECIMAL como texto; se entrega como número
        get() {
            const value = this.getDataValue('price');
            return value === null || value === undefined ? value : Number(value);
        },
    },
    picture_url: {
        type: DataTypes.STRING(150),
    },
    available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    daily_stock: {
        type: DataTypes.INTEGER,
    },
    preparation_time: {
        type: DataTypes.INTEGER,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'products',
    timestamps: false,
});

export default Product;
