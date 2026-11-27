import sequelize from '../../configs/database.js';
import { Store, User, StorePhoto } from '../models/associations.js';

const include = [
  { model: User, as: 'user', attributes: ['id', 'email', 'phone'] },
  { model: StorePhoto, as: 'photos' }
];

const findProfile = async (storeId) => {
  return await Store.findByPk(storeId, { include, order: [[{ model: StorePhoto, as: 'photos' }, 'id', 'ASC']] });
};

/**
 * Actualiza los datos del local y el teléfono de su usuario a la vez (transacción)
 */
const updateProfile = async (store, storeData, phone) => {
  await sequelize.transaction(async (transaction) => {
    await Store.update(storeData, { where: { id: store.id }, transaction });
    await User.update({ phone }, { where: { id: store.user_id }, transaction });
  });
};

const countPhotos = async (storeId) => StorePhoto.count({ where: { store_id: storeId } });

const createPhoto = async (data) => StorePhoto.create(data);

const findPhoto = async (id, storeId) => StorePhoto.findOne({ where: { id, store_id: storeId } });

const deletePhoto = async (photo) => photo.destroy();

const storeProfileRepository = { findProfile, updateProfile, countPhotos, createPhoto, findPhoto, deletePhoto };

export default storeProfileRepository;
