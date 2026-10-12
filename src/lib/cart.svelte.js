
import { supabase } from './supabaseClient.js';

/**
 * @typedef {Object} CartItem
 * @property {number} id
 * @property {string} name
 * @property {string} brand
 * @property {number} price
 * @property {string} description
 * @property {string} tag
 * @property {number} quantity
 */

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {string} brand
 * @property {number | string} price
 * @property {string} description
 * @property {string} tag
 */

/**
 * @typedef {Object} DatabaseProduct
 * @property {number} id
 * @property {string} name
 * @property {string} brand
 * @property {number | string} price
 * @property {string} description
 * @property {string | null} [tag]
 */

/**
 * @typedef {Object} DatabaseCartRow
 * @property {number} product_id
 * @property {number} quantity
 * @property {DatabaseProduct | DatabaseProduct[] | null} products
 */

function createCart() {
  /** @type {CartItem[]} */
  let items = $state([]);

  /** @type {string | null} */
  let userId = $state(null);

  let loading = $state(false);
  let saveError = $state('');

  /**
   * @param {string | null} id
   */
  function setUser(id) {
    userId = id;
  }

  async function loadCart() {
    if (!userId) {
      items = [];
      return;
    }

    loading = true;
    saveError = '';

    const currentUserId = userId;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          product_id,
          quantity,
          products (
            id,
            name,
            brand,
            price,
            description,
            tag
          )
        `)
        .eq('user_id', currentUserId);

      if (error) throw error;

      if (userId !== currentUserId) return;

      // Supabase's inferred relationship type may differ from the
      // expected shape, so define the expected row structure here.
      const rows = /** @type {DatabaseCartRow[]} */ (
        /** @type {unknown} */ (data ?? [])
      );

      items = rows
        .map((row) => {
          const relatedProduct = row.products;

          // Supabase relationships can return one object or an array.
          const product = Array.isArray(relatedProduct)
            ? relatedProduct[0]
            : relatedProduct;

          if (!product) return null;

          return {
            id: Number(row.product_id),
            name: product.name,
            brand: product.brand,
            price: Number(product.price),
            description: product.description,
            tag: product.tag ?? '',
            quantity: Number(row.quantity)
          };
        })
        .filter((item) => item !== null);
    } catch (error) {
      saveError =
        error instanceof Error
          ? error.message
          : 'Unable to load your saved cart.';
    } finally {
      loading = false;
    }
  }

  /**
   * @param {number} productId
   * @param {number} quantity
   */
  async function saveQuantity(productId, quantity) {
    if (!userId) return;

    saveError = '';

    try {
      const currentUserId = userId;

      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', currentUserId)
          .eq('product_id', productId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .upsert(
            {
              user_id: currentUserId,
              product_id: productId,
              quantity,
              updated_at: new Date().toISOString()
            },
            {
              onConflict: 'user_id,product_id'
            }
          );

        if (error) throw error;
      }
    } catch (error) {
      saveError =
        error instanceof Error
          ? error.message
          : 'Unable to save your cart.';
    }
  }

  /**
   * @param {Product} product
   */
  async function addToCart(product) {
    const existingItem = items.find(
      (item) => item.id === product.id
    );

    const quantity = existingItem
      ? existingItem.quantity + 1
      : 1;

    if (existingItem) {
      items = items.map((item) =>
        item.id === product.id
          ? { ...item, quantity }
          : item
      );
    } else {
      items = [
        ...items,
        {
          ...product,
          price: Number(product.price),
          tag: product.tag ?? '',
          quantity: 1
        }
      ];
    }

    await saveQuantity(product.id, quantity);
  }

  /**
   * @param {number} id
   */
  async function increaseQuantity(id) {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;

    const quantity = item.quantity + 1;

    items = items.map((entry) =>
      entry.id === id
        ? { ...entry, quantity }
        : entry
    );

    await saveQuantity(id, quantity);
  }

  /**
   * @param {number} id
   */
  async function decreaseQuantity(id) {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;

    const quantity = item.quantity - 1;

    if (quantity <= 0) {
      items = items.filter((entry) => entry.id !== id);
    } else {
      items = items.map((entry) =>
        entry.id === id
          ? { ...entry, quantity }
          : entry
      );
    }

    await saveQuantity(id, quantity);
  }

  /**
   * @param {number} id
   */
  async function removeItem(id) {
    items = items.filter((item) => item.id !== id);
    await saveQuantity(id, 0);
  }

  async function clearCart() {
    const currentUserId = userId;

    items = [];
    saveError = '';

    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', currentUserId);

      if (error) throw error;
    } catch (error) {
      saveError =
        error instanceof Error
          ? error.message
          : 'Unable to clear your cart.';
    }
  }

  return {
    get items() {
      return items;
    },

    get count() {
      return items.reduce(
        (total, item) => total + item.quantity,
        0
      );
    },

    get total() {
      return items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },

    get loading() {
      return loading;
    },

    get saveError() {
      return saveError;
    },

    setUser,
    loadCart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart
  };
}

export const cart = createCart();
