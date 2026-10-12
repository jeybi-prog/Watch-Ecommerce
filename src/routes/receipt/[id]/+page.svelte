
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Navbar from '../../../lib/components/Navbar.svelte';
  import { supabase } from '../../../lib/supabaseClient';

  /**
   * @typedef {Object} Order
   * @property {number} id
   * @property {number | string} total
   * @property {string} status
   * @property {string} created_at
   */

  /**
   * @typedef {Object} ReceiptItem
   * @property {string} product_name
   * @property {string} brand
   * @property {number | string} unit_price
   * @property {number} quantity
   * @property {number | string} subtotal
   */

  /** @type {Order | null} */
  let order = $state(null);

  /** @type {ReceiptItem[]} */
  let items = $state([]);

  let loading = $state(true);
  let errorMessage = $state('');

  const orderId = $derived(page.params.id);

  /** @param {number | string} value */
  function formatPrice(value) {
    return '₱' + Number(value).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  onMount(() => {
    let active = true;

    async function loadReceipt() {
      loading = true;
      errorMessage = '';

      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!sessionData.session) {
          throw new Error('Please sign in to view this receipt.');
        }

        const { data: orderData, error: orderError } =
          await supabase
            .from('orders')
            .select('id, total, status, created_at')
            .eq('id', orderId)
            .single();

        if (orderError) throw orderError;

        const { data: itemData, error: itemError } =
          await supabase
            .from('order_items')
            .select(
              'product_name, brand, unit_price, quantity, subtotal'
            )
            .eq('order_id', orderId);

        if (itemError) throw itemError;

        if (!active) return;

        order = /** @type {Order} */ (orderData);
        items = /** @type {ReceiptItem[]} */ (itemData ?? []);
      } catch (error) {
        if (active) {
          errorMessage =
            error instanceof Error
              ? error.message
              : 'Unable to load this receipt.';
        }
      } finally {
        if (active) {
          loading = false;
        }
      }
    }

    loadReceipt();

    return () => {
      active = false;
    };
  });
</script>

<svelte:head>
  <title>Order Receipt | HOROLOGUE</title>
  <meta
    name="description"
    content="View your HOROLOGUE order confirmation and receipt."
  />
</svelte:head>

<Navbar />

<main class="receipt-page">
  {#if loading}
    <section class="receipt-card loading-state">
      <p class="eyebrow">HOROLOGUE</p>
      <h1>Preparing your <em>receipt.</em></h1>
      <p class="muted">Loading your order details...</p>
    </section>

  {:else if errorMessage}
    <section class="receipt-card error-state">
      <p class="eyebrow">HOROLOGUE</p>
      <h1>Receipt <em>unavailable.</em></h1>
      <p class="muted">{errorMessage}</p>
      <a class="secondary-button" href="/shop">
        Return to the Shop
      </a>
    </section>

  {:else if order}
    <section class="receipt-card">
      <div class="receipt-heading">
        <p class="eyebrow">HOROLOGUE</p>
        <h1>Order <em>Receipt.</em></h1>
        <p class="success">Your order has been confirmed.</p>
      </div>

      <div class="receipt-meta">
        <div class="meta-row">
          <span>ORDER NUMBER</span>
          <strong>HOR-{order.id}</strong>
        </div>

        <div class="meta-row">
          <span>ORDER DATE</span>
          <strong>
            {new Date(order.created_at).toLocaleString('en-PH')}
          </strong>
        </div>

        <div class="meta-row">
          <span>STATUS</span>
          <strong class="status">{order.status}</strong>
        </div>
      </div>

      <section class="purchased-items">
        <h2>Items Purchased</h2>

        <div class="item-heading">
          <span>ITEM DETAILS</span>
          <span>AMOUNT</span>
        </div>

        {#each items as item, i (`${item.product_name}-${i}`)}
          <article class="receipt-item">
            <div class="item-info">
              <h3>{item.product_name}</h3>
              <p class="item-brand">{item.brand}</p>
              <p>Quantity: {item.quantity}</p>
              <p>
                {formatPrice(item.unit_price)} each
              </p>
            </div>

            <strong class="item-subtotal">
              {formatPrice(item.subtotal)}
            </strong>
          </article>
        {/each}

        {#if items.length === 0}
          <p class="muted">No items were found for this order.</p>
        {/if}
      </section>

      <div class="receipt-total">
        <span>ORDER TOTAL</span>
        <strong>{formatPrice(order.total)}</strong>
      </div>

      <p class="disclaimer">
        This document confirms your order. It is not proof of payment.
        Shipping fees and payment processing are not included.
      </p>

      <div class="receipt-actions">
        <button
          class="primary-button"
          onclick={() => window.print()}
        >
          Print Receipt
        </button>

        <a class="secondary-button" href="/shop">
          Continue Shopping
        </a>
      </div>
    </section>
  {/if}
</main>

<footer class="receipt-footer">
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

  .receipt-page {
    min-height: 80vh;
    padding: 65px 20px 100px;
  }

  .receipt-card {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: 45px;
    border: 1px solid #393931;
    background: #151612;
  }

  .receipt-heading {
    padding-bottom: 30px;
  }

  .eyebrow {
    color: #c5a46d;
    font-size: 10px;
    letter-spacing: 4px;
  }

  h1 {
    margin: 20px 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(36px, 6vw, 54px);
    font-weight: 400;
  }

  h1 em {
    color: #c5a46d;
    font-weight: 400;
  }

  .success {
    color: #c5a46d;
    font-size: 12px;
  }

  .muted {
    color: #aaa79e;
    font-size: 12px;
    line-height: 1.8;
  }

  .receipt-meta {
    display: grid;
    gap: 20px;
    padding: 25px 0;
    border-top: 1px solid #393931;
    border-bottom: 1px solid #393931;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
  }

  .meta-row span,
  .item-heading {
    color: #aaa79e;
    font-size: 9px;
    letter-spacing: 1.5px;
  }

  .meta-row strong {
    max-width: 65%;
    font-size: 11px;
    font-weight: 400;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .status {
    color: #c5a46d;
    text-transform: capitalize;
  }

  .purchased-items h2 {
    margin: 35px 0 25px;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 24px;
    font-weight: 400;
  }

  .item-heading,
  .receipt-item,
  .receipt-total {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }

  .item-heading {
    padding-bottom: 14px;
    border-bottom: 1px solid #393931;
  }

  .receipt-item {
    align-items: flex-start;
    padding: 22px 0;
    border-bottom: 1px solid #30302a;
  }

  .item-info h3 {
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 18px;
    font-weight: 400;
  }

  .item-info p {
    margin: 7px 0 0;
    color: #aaa79e;
    font-size: 11px;
  }

  .item-info .item-brand {
    color: #c5a46d;
    letter-spacing: 1px;
  }

  .item-subtotal {
    font-size: 12px;
    font-weight: 400;
    white-space: nowrap;
  }

  .receipt-total {
    align-items: center;
    margin-top: 25px;
    padding: 20px 0;
    font-size: 11px;
  }

  .receipt-total strong {
    color: #c5a46d;
    font-size: 24px;
    font-weight: 400;
  }

  .disclaimer {
    color: #89867d;
    font-size: 10px;
    line-height: 1.8;
  }

  .receipt-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 30px;
  }

  .primary-button,
  .secondary-button {
    display: inline-block;
    padding: 14px 18px;
    border: 1px solid #c5a46d;
    background: #c5a46d;
    color: #111210;
    font-size: 10px;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
  }

  .secondary-button {
    background: transparent;
    color: #c5a46d;
  }

  .receipt-footer {
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
    font-size: 18px;
    letter-spacing: 2px;
    text-decoration: none;
  }

  .footer-brand span {
    color: #c5a46d;
  }

  .receipt-footer p,
  .receipt-footer > span {
    color: #77766f;
    font-size: 9px;
    letter-spacing: 2px;
  }

  @media (max-width: 500px) {
    .receipt-card {
      padding: 25px 18px;
    }

    .meta-row {
      flex-direction: column;
      gap: 8px;
    }

    .meta-row strong {
      max-width: 100%;
      text-align: left;
    }

    .receipt-item {
      gap: 12px;
    }

    .receipt-footer p {
      display: none;
    }
  }

  @media print {
    :global(body) {
      background: #fff;
      color: #111;
    }

    :global(nav),
    .receipt-actions,
    .receipt-footer {
      display: none !important;
    }

    .receipt-page {
      min-height: 0;
      padding: 0;
    }

    .receipt-card {
      max-width: none;
      border: none;
      background: #fff;
      color: #111;
    }

    .muted,
    .item-info p,
    .disclaimer,
    .meta-row span,
    .item-heading {
      color: #555;
    }

    .receipt-total strong,
    .item-info .item-brand,
    .success {
      color: #765a2c;
    }
  }
</style>
