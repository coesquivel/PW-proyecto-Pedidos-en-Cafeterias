import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const OptionGroup = sequelize.define('OptionGroup', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    selection_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    is_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'option_groups',
    timestamps: false,
});

export default OptionGroup;
