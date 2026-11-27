import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(40),
        allowNull: false,
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'categories',
    timestamps: false,
});

export default Category;
