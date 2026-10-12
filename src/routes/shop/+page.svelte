
<script>
  import { onMount } from 'svelte';
  import { cart } from '../../lib/cart.svelte.js';
  import Navbar from '../../lib/components/Navbar.svelte';
  import { supabase } from '../../lib/supabaseClient';

  let searchQuery = $state('');
  let selectedCategory = $state('All Watches');
  let sortBy = $state('featured');
  let addedMessage = $state('');

  /**
   * @typedef {{
   *   id: number,
   *   name: string,
   *   brand: string,
   *   price: number,
   *   description: string,
   *   tag: string | null,
   *   image: string | null
   * }} Product
   */

  /** @type {Product[]} */
  let products = $state([]);

  let loading = $state(true);
  let loadError = $state('');

  const categories = ['All Watches', 'Cartier', 'Seiko', 'Rolex'];

  onMount(async () => {
    await loadProducts();
  });

  async function loadProducts() {
    loading = true;
    loadError = '';

    const { data, error } = await supabase
      .from('products')
      .select('id, name, brand, price, description, tag, image')
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase error:', error.message);
      loadError = 'Unable to load watches. Please try again.';
    } else {
      products = data ?? [];
    }

    loading = false;
  }

  let filteredProducts = $derived.by(() => {
    let result = products.filter((product) => {
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query);

      const matchesBrand =
        selectedCategory === 'All Watches' ||
        product.brand.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesBrand;
    });

    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  });

  /** @param {number} price */
  function formatPrice(price) {
    return '₱' + Number(price).toLocaleString('en-PH');
  }

  /** @param {Product} product */
  function addToBag(product) {
    cart.addToCart({
      ...product,
      tag: product.tag ?? ''
    });

    addedMessage = `${product.name} added to your bag.`;
  }

  function resetFilters() {
    searchQuery = '';
    selectedCategory = 'All Watches';
    sortBy = 'featured';
  }

  async function retryLoading() {
    await loadProducts();
  }
</script>

<svelte:head>
  <title>Shop Watches | HOROLOGUE</title>
  <meta
    name="description"
    content="Explore the HOROLOGUE collection of timeless, refined watches."
  />
</svelte:head>

<Navbar />

<main class="shop-page">
  <section class="shop-hero">
    <p class="eyebrow">THE HOROLOGUE COLLECTION</p>
    <h1>Find your <em>timepiece.</em></h1>
    <p class="hero-description">
      Thoughtfully designed watches for every moment worth remembering.
    </p>
    <div class="hero-line"></div>
  </section>

  <section class="collection-section">
    <div class="collection-heading">
      <div>
        <p class="eyebrow">MADE TO LAST</p>
        <h2>Our Watches</h2>
      </div>

      <p class="product-count">
        {filteredProducts.length}
        {filteredProducts.length === 1 ? 'TIMEPIECE' : 'TIMEPIECES'}
      </p>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">⌕</span>
        <input
          type="search"
          placeholder="Search watches..."
          bind:value={searchQuery}
          aria-label="Search watches"
        />
      </div>

      <label class="sort-control">
        <span>Sort by</span>
        <select bind:value={sortBy} aria-label="Sort watches">
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </label>
    </div>

    <div class="category-list" aria-label="Watch categories">
      {#each categories as category}
        <button
          class:active={selectedCategory === category}
          onclick={() => (selectedCategory = category)}
        >
          {category}
        </button>
      {/each}
    </div>

    {#if addedMessage}
      <p class="bag-message" role="status">
        {addedMessage}
        <button
          onclick={() => (addedMessage = '')}
          aria-label="Dismiss message"
        >
          ×
        </button>
      </p>
    {/if}

    {#if loading}
      <div class="empty-state">
        <span class="empty-mark">H</span>
        <h3>Loading watches...</h3>
        <p>Please wait while we load the collection.</p>
      </div>
    {:else if loadError}
      <div class="empty-state">
        <span class="empty-mark">H</span>
        <h3>Something went wrong</h3>
        <p>{loadError}</p>
        <button onclick={retryLoading}>Try Again</button>
      </div>
    {:else if filteredProducts.length > 0}
      <div class="product-grid">
        {#each filteredProducts as product (product.id)}
          <article class="product-card">
            <div class="product-image">
              {#if product.tag}
                <span class="product-tag">{product.tag}</span>
              {/if}

              {#if product.image}
                <img
                  class="watch-image"
                  src={product.image}
                  alt={`${product.brand} ${product.name}`}
                  loading="lazy"
                />
              {:else}
                <div class="image-placeholder">
                  <span class="placeholder-mark">H</span>
                  <span class="placeholder-text">PRODUCT IMAGE</span>
                </div>
              {/if}

              <button
                class="quick-add"
                onclick={() => addToBag(product)}
              >
                Add to Bag <span>+</span>
              </button>
            </div>

            <div class="product-details">
              <div class="product-info">
                <p class="product-category">{product.brand}</p>
                <h3>{product.name}</h3>
                <p class="product-description">
                  {product.description}
                </p>
              </div>

              <p class="product-price">
                {formatPrice(product.price)}
              </p>
            </div>

            <button
              class="mobile-add"
              onclick={() => addToBag(product)}
            >
              Add to Bag +
            </button>
          </article>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <span class="empty-mark">H</span>
        <h3>No watches found</h3>
        <p>Try another search or select a different category.</p>
        <button onclick={resetFilters}>View All Watches</button>
      </div>
    {/if}
  </section>

  <section class="closing-banner">
    <p class="eyebrow">TIMELESS BY DESIGN</p>
    <h2>Every second tells <em>a story.</em></h2>
    <p>Choose a timepiece that makes every moment count.</p>
    <a href="/">Return Home <span>↗</span></a>
  </section>
</main>

<footer class="shop-footer">
  <a href="/" class="footer-brand">HOROLOGUE<span>.</span></a>
  <p>TIME, REFINED.</p>
  <span>© 2026 HOROLOGUE</span>
</footer>

<style>
  :global(body) {
    margin: 0;
    background: #111210;
    color: #f5f0e6;
    font-family: Arial, Helvetica, sans-serif;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(button),
  :global(input),
  :global(select) {
    font: inherit;
  }

  .shop-page {
    min-height: 100vh;
    background: #111210;
    color: #f5f0e6;
  }

  .shop-hero {
    padding: 100px 7% 65px;
    text-align: center;
    border-bottom: 1px solid #30302a;
  }

  .eyebrow {
    color: #c5a46d;
    font-size: 10px;
    letter-spacing: 3px;
    font-weight: 600;
  }

  .shop-hero h1 {
    margin: 25px 0 18px;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(42px, 6vw, 76px);
    font-weight: 400;
    letter-spacing: -2px;
  }

  .shop-hero h1 em,
  .closing-banner h2 em {
    color: #c5a46d;
    font-weight: 400;
  }

  .hero-description {
    color: #aaa79e;
    font-size: 14px;
    line-height: 1.8;
  }

  .hero-line {
    width: 45px;
    height: 1px;
    margin: 35px auto 0;
    background: #c5a46d;
  }

  .collection-section {
    max-width: 1500px;
    margin: 0 auto;
    padding: 75px 7% 100px;
  }

  .collection-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 35px;
  }

  .collection-heading .eyebrow {
    margin-bottom: 12px;
  }

  .collection-heading h2 {
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 38px;
    font-weight: 400;
  }

  .product-count {
    color: #aaa79e;
    font-size: 10px;
    letter-spacing: 2px;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 18px 0;
    border-top: 1px solid #30302a;
    border-bottom: 1px solid #30302a;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 12px;
    width: min(340px, 100%);
  }

  .search-icon {
    color: #c5a46d;
    font-size: 25px;
  }

  .search-box input {
    width: 100%;
    padding: 10px 0;
    outline: none;
    border: none;
    background: transparent;
    color: #f5f0e6;
    font-size: 13px;
  }

  .search-box input::placeholder {
    color: #77766f;
  }

  .sort-control {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #aaa79e;
    font-size: 12px;
  }

  .sort-control select {
    max-width: 180px;
    padding: 9px 4px;
    border: none;
    outline: none;
    background: #111210;
    color: #f5f0e6;
    cursor: pointer;
  }

  .sort-control option {
    background: #111210;
  }

  .category-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 25px 0 35px;
  }

  .category-list button {
    padding: 10px 18px;
    border: 1px solid #393931;
    border-radius: 0;
    background: transparent;
    color: #aaa79e;
    font-size: 11px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .category-list button:hover,
  .category-list button.active {
    border-color: #c5a46d;
    background: #c5a46d;
    color: #111210;
  }

  .bag-message {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    padding: 14px 16px;
    margin: 0 0 25px;
    border: 1px solid #4a4435;
    color: #d6bd91;
    font-size: 12px;
  }

  .bag-message button {
    border: none;
    background: transparent;
    color: #d6bd91;
    font-size: 18px;
    cursor: pointer;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 45px 24px;
  }

  .product-card {
    min-width: 0;
  }

  .product-image {
    position: relative;
    overflow: hidden;
    aspect-ratio: 4 / 4.7;
    background: #191a17;
    border: 1px solid #292a25;
  }

  .watch-image {
    display: block;
    width: 100%;
    height: 100%;
    padding: 12px;
    object-fit: contain;
    transition: transform 0.4s ease;
  }

  .product-image:hover .watch-image {
    transform: scale(1.04);
  }

  .product-tag {
    position: absolute;
    z-index: 1;
    top: 15px;
    left: 15px;
    padding: 7px 9px;
    background: #24241e;
    color: #c5a46d;
    font-size: 9px;
    letter-spacing: 1.5px;
  }

  .image-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 12px;
    color: #5c594e;
  }

  .placeholder-mark {
    display: grid;
    place-items: center;
    width: 90px;
    height: 90px;
    border: 1px solid #454136;
    border-radius: 50%;
    color: #8f7953;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 45px;
  }

  .placeholder-text {
    font-size: 8px;
    letter-spacing: 3px;
  }

  .quick-add {
    position: absolute;
    right: 12px;
    bottom: 12px;
    left: 12px;
    display: flex;
    justify-content: space-between;
    padding: 15px;
    border: 1px solid #c5a46d;
    background: #c5a46d;
    color: #111210;
    font-size: 11px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .quick-add:hover {
    background: #e0c38f;
  }

  .quick-add span {
    font-size: 16px;
  }

  .product-details {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 12px;
    padding-top: 20px;
  }

  .product-category {
    margin: 0 0 8px;
    color: #c5a46d;
    font-size: 9px;
    letter-spacing: 1.8px;
    text-transform: uppercase;
  }

  .product-info h3 {
    margin: 0 0 9px;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 21px;
    font-weight: 400;
  }

  .product-description {
    margin: 0;
    color: #96948b;
    font-size: 11px;
    line-height: 1.7;
  }

  .product-price {
    flex-shrink: 0;
    margin: 3px 0 0;
    color: #e6dfd1;
    font-size: 12px;
  }

  .mobile-add {
    display: none;
  }

  .empty-state {
    padding: 70px 20px;
    text-align: center;
    border: 1px solid #30302a;
  }

  .empty-mark {
    color: #c5a46d;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 45px;
  }

  .empty-state h3 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 25px;
    font-weight: 400;
  }

  .empty-state p {
    color: #aaa79e;
    font-size: 12px;
  }

  .empty-state button {
    margin-top: 18px;
    padding: 12px 20px;
    border: 1px solid #c5a46d;
    background: transparent;
    color: #c5a46d;
    cursor: pointer;
  }

  .closing-banner {
    padding: 75px 20px;
    border-top: 1px solid #30302a;
    text-align: center;
  }

  .closing-banner h2 {
    margin: 20px 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(30px, 4vw, 48px);
    font-weight: 400;
  }

  .closing-banner > p:not(.eyebrow) {
    color: #aaa79e;
    font-size: 12px;
    line-height: 1.8;
  }

  .closing-banner a {
    display: inline-flex;
    align-items: center;
    gap: 25px;
    margin-top: 25px;
    padding-bottom: 8px;
    border-bottom: 1px solid #c5a46d;
    color: #c5a46d;
    font-size: 12px;
    text-decoration: none;
  }

  .shop-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 30px 7%;
    border-top: 1px solid #30302a;
  }

  .footer-brand {
    color: #f5f0e6;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 20px;
    letter-spacing: 2px;
    text-decoration: none;
  }

  .footer-brand span {
    color: #c5a46d;
  }

  .shop-footer p,
  .shop-footer > span {
    color: #77766f;
    font-size: 9px;
    letter-spacing: 2px;
  }

  @media (max-width: 900px) {
    .product-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 35px 18px;
    }

    .collection-section {
      padding-right: 5%;
      padding-left: 5%;
    }

    .product-details {
      flex-direction: column;
      gap: 8px;
    }
  }

  @media (max-width: 560px) {
    .shop-hero {
      padding: 70px 6% 50px;
    }

    .shop-hero h1 {
      letter-spacing: -1px;
    }

    .collection-section {
      padding-top: 50px;
      padding-bottom: 65px;
    }

    .collection-heading h2 {
      font-size: 30px;
    }

    .toolbar {
      align-items: stretch;
      flex-direction: column;
      gap: 10px;
    }

    .search-box {
      width: 100%;
    }

    .sort-control {
      justify-content: space-between;
    }

    .category-list {
      gap: 8px;
    }

    .category-list button {
      padding: 9px 12px;
      font-size: 10px;
    }

    .product-grid {
      gap: 30px 12px;
    }

    .product-image {
      aspect-ratio: 4 / 4.5;
    }

    .product-tag {
      top: 8px;
      left: 8px;
      padding: 5px;
      font-size: 7px;
      letter-spacing: 0.8px;
    }

    .placeholder-mark {
      width: 55px;
      height: 55px;
      font-size: 30px;
    }

    .placeholder-text {
      font-size: 6px;
      letter-spacing: 1px;
    }

    .quick-add {
      display: none;
    }

    .product-info h3 {
      font-size: 17px;
    }

    .product-description {
      font-size: 10px;
    }

    .product-price {
      font-size: 11px;
    }

    .mobile-add {
      display: block;
      width: 100%;
      margin-top: 13px;
      padding: 11px 5px;
      border: 1px solid #c5a46d;
      background: transparent;
      color: #c5a46d;
      font-size: 10px;
      cursor: pointer;
    }

    .shop-footer {
      flex-wrap: wrap;
      padding: 25px 6%;
    }

    .shop-footer p {
      display: none;
    }

    .shop-footer > span {
      font-size: 8px;
    }
  }
</style>
