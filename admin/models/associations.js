import Role from './role.js';
import User from './user.js';
import Store from './store.js';
import Category from './category.js';
import Product from './product.js';
import Diner from './diner.js';
import Cart from './cart.js';
import CartItem from './cart_item.js';
import OrderStatus from './order_status.js';
import Order from './order.js';
import OrderItem from './order_item.js';
import StoreSchedule from './store_schedule.js';
import OptionGroup from './option_group.js';
import ProductOption from './product_option.js';
import CartItemOption from './cart_item_option.js';
import OrderItemOption from './order_item_option.js';
import OrderReview from './order_review.js';
import ProductReview from './product_review.js';
import StorePhoto from './store_photo.js';

// roles 1 --- N users
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// users 1 --- 1 stores
User.hasOne(Store, { foreignKey: 'user_id', as: 'store' });
Store.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// users 1 --- 1 diners
User.hasOne(Diner, { foreignKey: 'user_id', as: 'diner' });
Diner.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// stores 1 --- N store_schedules (un horario por día de la semana)
Store.hasMany(StoreSchedule, { foreignKey: 'store_id', as: 'schedules' });
StoreSchedule.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// stores 1 --- N store_photos (galería del local)
Store.hasMany(StorePhoto, { foreignKey: 'store_id', as: 'photos' });
StorePhoto.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// stores 1 --- N categories
Store.hasMany(Category, { foreignKey: 'store_id', as: 'categories' });
Category.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// stores 1 --- N products
Store.hasMany(Product, { foreignKey: 'store_id', as: 'products' });
Product.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// categories 1 --- N products
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// products 1 --- N option_groups 1 --- N product_options
Product.hasMany(OptionGroup, { foreignKey: 'product_id', as: 'option_groups' });
OptionGroup.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
OptionGroup.hasMany(ProductOption, { foreignKey: 'option_group_id', as: 'options' });
ProductOption.belongsTo(OptionGroup, { foreignKey: 'option_group_id', as: 'group' });

// cart_items 1 --- N cart_item_options N --- 1 product_options
CartItem.hasMany(CartItemOption, { foreignKey: 'cart_item_id', as: 'chosen' });
CartItemOption.belongsTo(CartItem, { foreignKey: 'cart_item_id', as: 'item' });
ProductOption.hasMany(CartItemOption, { foreignKey: 'product_option_id', as: 'cartChoices' });
CartItemOption.belongsTo(ProductOption, { foreignKey: 'product_option_id', as: 'option' });

// order_items 1 --- N order_item_options (copia con nombre y precio del momento)
OrderItem.hasMany(OrderItemOption, { foreignKey: 'order_item_id', as: 'options' });
OrderItemOption.belongsTo(OrderItem, { foreignKey: 'order_item_id', as: 'item' });

// calificaciones: un pedido tiene una calificación (local + productos)
Order.hasOne(OrderReview, { foreignKey: 'order_id', as: 'review' });
OrderReview.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Diner.hasMany(OrderReview, { foreignKey: 'diner_id', as: 'reviews' });
OrderReview.belongsTo(Diner, { foreignKey: 'diner_id', as: 'diner' });
Store.hasMany(OrderReview, { foreignKey: 'store_id', as: 'reviews' });
OrderReview.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
OrderReview.hasMany(ProductReview, { foreignKey: 'order_review_id', as: 'products' });
ProductReview.belongsTo(OrderReview, { foreignKey: 'order_review_id', as: 'review' });
Product.hasMany(ProductReview, { foreignKey: 'product_id', as: 'reviews' });
ProductReview.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// diners 1 --- 1 carts, stores 1 --- N carts
Diner.hasOne(Cart, { foreignKey: 'diner_id', as: 'cart' });
Cart.belongsTo(Diner, { foreignKey: 'diner_id', as: 'diner' });
Store.hasMany(Cart, { foreignKey: 'store_id', as: 'carts' });
Cart.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// carts 1 --- N cart_items, products 1 --- N cart_items
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// order_statuses 1 --- N orders; diners 1 --- N orders; stores 1 --- N orders
OrderStatus.hasMany(Order, { foreignKey: 'status_id', as: 'orders' });
Order.belongsTo(OrderStatus, { foreignKey: 'status_id', as: 'status' });
Diner.hasMany(Order, { foreignKey: 'diner_id', as: 'orders' });
Order.belongsTo(Diner, { foreignKey: 'diner_id', as: 'diner' });
Store.hasMany(Order, { foreignKey: 'store_id', as: 'orders' });
Order.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// orders 1 --- N order_items
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

export { Role, User, Store, Category, Product, Diner, Cart, CartItem, OrderStatus, Order, OrderItem, StoreSchedule, OptionGroup, ProductOption, CartItemOption, OrderItemOption, OrderReview, ProductReview, StorePhoto };
