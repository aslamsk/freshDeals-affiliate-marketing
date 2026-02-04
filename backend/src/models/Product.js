import { db } from '../config/firebase.js';
import { COLLECTIONS } from '../config/constants.js';
import { v4 as uuidv4 } from 'uuid';

export class Product {
  /**
   * Create a new product
   * @param {Object} data - Product data
   * @returns {Promise<string>} Product ID
   */
  static async create(data) {
    const productId = uuidv4();
    const productData = {
      id: productId,
      name: data.name,
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      category: data.category,
      tags: data.tags || [],
      isVisible: data.isVisible !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection(COLLECTIONS.PRODUCTS).doc(productId).set(productData);
    return productId;
  }

  /**
   * Get product by ID
   * @param {string} productId
   * @returns {Promise<Object|null>}
   */
  static async getById(productId) {
    const doc = await db.collection(COLLECTIONS.PRODUCTS).doc(productId).get();
    return doc.exists ? doc.data() : null;
  }

  /**
   * Get all products with pagination
   * @param {number} limit
   * @param {string} startAfter
   * @returns {Promise<Object>}
   */
  static async getAll(limit = 20, startAfter = null) {
    let query = db.collection(COLLECTIONS.PRODUCTS).where('isVisible', '==', true);

    if (startAfter) {
      const lastDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(startAfter).get();
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.limit(limit + 1).get();
    const products = snapshot.docs.map((doc) => doc.data());
    const hasMore = products.length > limit;

    return {
      products: products.slice(0, limit),
      nextCursor: hasMore ? products[limit].id : null,
    };
  }

  /**
   * Get products by category
   * @param {string} category
   * @returns {Promise<Array>}
   */
  static async getByCategory(category) {
    const snapshot = await db
      .collection(COLLECTIONS.PRODUCTS)
      .where('category', '==', category)
      .where('isVisible', '==', true)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Update product
   * @param {string} productId
   * @param {Object} data
   * @returns {Promise<void>}
   */
  static async update(productId, data) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(COLLECTIONS.PRODUCTS).doc(productId).update(updateData);
  }

  /**
   * Delete product
   * @param {string} productId
   * @returns {Promise<void>}
   */
  static async delete(productId) {
    await db.collection(COLLECTIONS.PRODUCTS).doc(productId).delete();
  }

  /**
   * Search products
   * @param {string} query
   * @returns {Promise<Array>}
   */
  static async search(query) {
    const snapshot = await db
      .collection(COLLECTIONS.PRODUCTS)
      .where('isVisible', '==', true)
      .get();

    const lowerQuery = query.toLowerCase();
    return snapshot.docs
      .map((doc) => doc.data())
      .filter(
        (product) =>
          product.name.toLowerCase().includes(lowerQuery) ||
          product.description.toLowerCase().includes(lowerQuery) ||
          product.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
  }
}
