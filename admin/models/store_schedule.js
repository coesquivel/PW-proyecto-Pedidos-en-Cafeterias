import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

// day_of_week: 1 = lunes ... 7 = domingo
const StoreSchedule = sequelize.define('StoreSchedule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    day_of_week: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    open_time: {
        type: DataTypes.TIME,
    },
    close_time: {
        type: DataTypes.TIME,
    },
    is_closed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'store_schedules',
    timestamps: false,
});

export default StoreSchedule;
