import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const ProductOption = sequelize.define('ProductOption', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    additional_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        // PostgreSQL devuelve los DECIMAL como texto; se entrega como número
        get() {
            const value = this.getDataValue('additional_price');
            return value === null ? null : Number(value);
        },
    },
    option_group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'product_options',
    timestamps: false,
});

export default ProductOption;
