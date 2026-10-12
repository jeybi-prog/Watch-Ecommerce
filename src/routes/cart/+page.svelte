
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Navbar from '../../lib/components/Navbar.svelte';
  import LoginModal from '../../lib/components/LoginModal.svelte';
  import { cart } from '../../lib/cart.svelte.js';
  import { supabase } from '../../lib/supabaseClient';

  let showLoginModal = $state(false);
  let checkingSession = $state(true);
  let isLoggedIn = $state(false);
  let checkoutMessage = $state('');
  let checkingOut = $state(false);
  let paymentMethod = $state('COD');

  const paymentMethods = [
    {
      value: 'COD',
      label: 'Cash on Delivery',
      description: 'Pay when your order arrives.'
    },
    {
      value: 'GCash',
      label: 'GCash',
      description: 'Payment instructions will be provided separately.'
    },
    {
      value: 'Bank Transfer',
      label: 'Bank Transfer',
      description: 'Transfer instructions will be provided separately.'
    }
  ];

  onMount(() => {
    let active = true;

    async function initializeSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!active) return;
        if (error) throw error;

        const session = data.session;

        isLoggedIn = !!session;
        cart.setUser(session?.user.id ?? null);

        if (session) {
          await cart.loadCart();
        }
      } catch (error) {
        console.error('Session initialization failed:', error);

        if (active) {
          checkoutMessage =
            error instanceof Error
              ? error.message
              : 'Unable to load your session.';
        }
      } finally {
        if (active) {
          checkingSession = false;
        }
      }
    }

    initializeSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      isLoggedIn = !!session;
      cart.setUser(session?.user.id ?? null);

      if (session) {
        setTimeout(() => {
          if (active) cart.loadCart();
        }, 0);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  });

  /** @param {number} price */
  function formatPrice(price) {
    return (
      '₱' +
      Number(price).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    );
  }

  async function handleCheckout() {
    checkoutMessage = '';

    if (checkingSession || checkingOut) return;

    checkingOut = true;

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const session = sessionData.session;

      if (!session) {
        isLoggedIn = false;
        showLoginModal = true;
        return;
      }

      isLoggedIn = true;
      cart.setUser(session.user.id);

      await cart.loadCart();

      if (cart.saveError) {
        throw new Error(
          `Unable to load your saved cart: ${cart.saveError}`
        );
      }

      if (cart.items.length === 0) {
        throw new Error(
          'Your shopping bag is empty. Add a product before checking out.'
        );
      }

      // Create the order using the existing checkout RPC.
      const { data: orderId, error: checkoutError } =
        await supabase.rpc('checkout_cart', {
          p_payment_method: paymentMethod
        });

      if (checkoutError) {
        console.error('Supabase checkout error:', checkoutError);

        throw new Error(
          `${checkoutError.message}${
            checkoutError.code
              ? ` (Code: ${checkoutError.code})`
              : ''
          }`
        );
      }

      if (!orderId) {
        throw new Error('Supabase did not return an order number.');
      }

      await cart.loadCart();

      await goto(`/receipt/${orderId}`);
    } catch (error) {
      console.error('Checkout failed:', error);

      checkoutMessage =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during checkout.';
    } finally {
      checkingOut = false;
    }
  }

  function handleLoginSuccess() {
    showLoginModal = false;
    checkoutMessage = 'You are signed in. You can now check out.';
  }
</script>

<svelte:head>
  <title>Shopping Bag | HOROLOGUE</title>
</svelte:head>

<Navbar />

<main class="cart-page">
  <header class="cart-header">
    <p class="eyebrow">YOUR SELECTION</p>
    <h1>Shopping <em>Bag.</em></h1>
    <p>Timeless pieces, chosen by you.</p>
  </header>

  {#if checkingSession || cart.loading}
    <section class="empty-cart">
      <span class="empty-mark">H</span>
      <h2>Preparing your bag.</h2>
      <p>Loading your saved selection...</p>
    </section>

  {:else if cart.items.length === 0}
    <section class="empty-cart">
      <span class="empty-mark">H</span>
      <h2>Your bag is waiting.</h2>
      <p>Discover a timepiece that feels like yours.</p>

      <a href="/shop" class="gold-button">
        Explore Watches <span>↗</span>
      </a>
    </section>

  {:else}
    <section class="cart-content">
      <div class="cart-items">
        <div class="items-heading">
          <span>YOUR ITEMS ({cart.count})</span>
          <span>PRICE</span>
        </div>

        {#each cart.items as item (item.id)}
          <article class="cart-item">
            <div class="item-image">
              {#if item.image}
                <img src={item.image} alt={item.name} />
              {:else}
                  <span>H</span>
              {/if}
            </div>

            <div class="item-details">
              <p class="item-brand">{item.brand}</p>
              <h2>{item.name}</h2>
              <p class="item-description">{item.description}</p>

              <div class="quantity-control">
                <button
                  onclick={() => cart.decreaseQuantity(item.id)}
                  aria-label={`Decrease ${item.name} quantity`}
                >−</button>

                <span>{item.quantity}</span>

                <button
                  onclick={() => cart.increaseQuantity(item.id)}
                  aria-label={`Increase ${item.name} quantity`}
                >+</button>
              </div>

              <button
                class="remove-button"
                onclick={() => cart.removeItem(item.id)}
              >
                Remove
              </button>
            </div>

            <p class="item-price">
              {formatPrice(item.price * item.quantity)}
            </p>
          </article>
        {/each}

        <a href="/shop" class="continue-link">
          ← Continue Shopping
        </a>
      </div>

      <aside class="order-summary">
        <p class="eyebrow">SUMMARY</p>
        <h2>Your Order</h2>

        <div class="summary-row">
          <span>Items ({cart.count})</span>
          <span>{formatPrice(cart.total)}</span>
        </div>

        <div class="summary-row">
          <span>Shipping</span>
          <span>Calculated later</span>
        </div>

        <div class="summary-total">
          <span>Subtotal</span>
          <strong>{formatPrice(cart.total)}</strong>
        </div>

        <!-- PAYMENT METHOD -->
        <div class="payment-section">
          <p class="eyebrow">PAYMENT METHOD</p>

          <p class="payment-intro">
            Choose how you would like to pay.
          </p>

          {#each paymentMethods as method}
            <label
              class:selected={paymentMethod === method.value}
              class="payment-option"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                bind:group={paymentMethod}
              />

              <span class="radio-mark"></span>

              <span class="payment-copy">
                <strong>{method.label}</strong>
                <small>{method.description}</small>
              </span>
            </label>
          {/each}
        </div>

        <button
          class="checkout-button"
          onclick={handleCheckout}
          disabled={checkingSession || checkingOut}
        >
          {checkingOut
            ? 'Processing Order...'
            : checkingSession
              ? 'Checking Session...'
              : isLoggedIn
                ? 'Confirm Order'
                : 'Sign In to Checkout'}
        </button>

        {#if checkoutMessage}
          <p class="message" role="status">
            {checkoutMessage}
          </p>
        {/if}

        {#if cart.saveError}
          <p class="error-message" role="alert">
            {cart.saveError}
          </p>
        {/if}

        <p class="summary-note">
          Your selected method will be saved with the order.
          Online payment processing is not yet integrated.
        </p>
      </aside>
    </section>
  {/if}

  {#if cart.saveError && cart.items.length === 0}
    <p class="error-message" role="alert">
      {cart.saveError}
    </p>
  {/if}
</main>

<footer class="cart-footer">
  <a href="/" class="footer-brand">
    HOROLOGUE<span>.</span>
  </a>

  <p>TIME, REFINED.</p>
  <span>© 2026 HOROLOGUE</span>
</footer>

{#if showLoginModal}
  <LoginModal
    onClose={() => (showLoginModal = false)}
    onSuccess={handleLoginSuccess}
  />
{/if}

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

  .cart-page {
    min-height: 75vh;
    padding: 0 7% 100px;
  }

  .cart-header {
    padding: 85px 0 55px;
    border-bottom: 1px solid #30302a;
  }

  .eyebrow {
    color: #c5a46d;
    font-size: 10px;
    letter-spacing: 3px;
  }

  .cart-header h1 {
    margin: 20px 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(42px, 6vw, 68px);
    font-weight: 400;
  }

  .cart-header h1 em {
    color: #c5a46d;
  }

  .cart-header > p:last-child {
    color: #aaa79e;
    font-size: 13px;
  }

  .empty-cart {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 85px 20px;
    text-align: center;
  }

  .empty-mark {
    display: grid;
    place-items: center;
    width: 75px;
    height: 75px;
    border: 1px solid #5b4b32;
    border-radius: 50%;
    color: #c5a46d;
    font-family: Georgia, serif;
    font-size: 38px;
  }

  .empty-cart h2,
  .order-summary h2 {
    font-family: Georgia, serif;
    font-weight: 400;
  }

  .empty-cart h2 {
    margin: 25px 0 10px;
    font-size: 30px;
  }

  .empty-cart p {
    margin-bottom: 28px;
    color: #aaa79e;
    font-size: 12px;
  }

  .gold-button {
    display: inline-flex;
    gap: 25px;
    padding: 15px 20px;
    background: #c5a46d;
    color: #111210;
    font-size: 11px;
    text-decoration: none;
  }

  .cart-content {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(250px, 0.8fr);
    align-items: start;
    gap: 55px;
    padding-top: 50px;
  }

  .items-heading {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20px;
    border-bottom: 1px solid #30302a;
    color: #aaa79e;
    font-size: 9px;
    letter-spacing: 2px;
  }

  .cart-item {
    display: grid;
    grid-template-columns: 125px minmax(0, 1fr) auto;
    gap: 20px;
    padding: 25px 0;
    border-bottom: 1px solid #30302a;
  }

  .item-image {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    background: #191a17;
    border: 1px solid #30302a;
  }

  .item-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
  }

  .item-image span {
    color: #8f7953;
    font-family: Georgia, serif;
    font-size: 40px;
  }

  .item-brand {
    margin: 0 0 8px;
    color: #c5a46d;
    font-size: 9px;
    letter-spacing: 2px;
  }

  .item-details h2 {
    margin: 0;
    font-family: Georgia, serif;
    font-size: 21px;
    font-weight: 400;
  }

  .item-description {
    color: #96948b;
    font-size: 11px;
    line-height: 1.6;
  }

  .quantity-control {
    display: inline-flex;
    align-items: center;
    gap: 18px;
    margin-top: 10px;
    border: 1px solid #393931;
  }

  .quantity-control button {
    width: 32px;
    height: 30px;
    border: none;
    background: transparent;
    color: #f5f0e6;
    cursor: pointer;
  }

  .quantity-control span {
    font-size: 12px;
  }

  .remove-button {
    display: block;
    margin-top: 12px;
    padding: 0 0 3px;
    border: none;
    border-bottom: 1px solid #666157;
    background: transparent;
    color: #aaa79e;
    font-size: 10px;
    cursor: pointer;
  }

  .item-price {
    margin: 2px 0 0;
    white-space: nowrap;
    font-size: 12px;
  }

  .continue-link {
    display: inline-block;
    margin-top: 25px;
    color: #c5a46d;
    font-size: 11px;
    text-decoration: none;
  }

  .order-summary {
    padding: 25px;
    border: 1px solid #393931;
  }

  .order-summary h2 {
    margin: 15px 0 28px;
    font-size: 27px;
  }

  .summary-row,
  .summary-total {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    padding: 16px 0;
    border-bottom: 1px solid #30302a;
    font-size: 11px;
  }

  .summary-row span:first-child {
    color: #aaa79e;
  }

  .summary-row span:last-child {
    text-align: right;
  }

  .summary-total {
    align-items: center;
    margin-top: 8px;
    padding: 20px 0;
    border-bottom: none;
  }

  .summary-total strong {
    color: #c5a46d;
    font-size: 19px;
    font-weight: 400;
  }

  .payment-section {
    margin: 5px 0 22px;
    padding-top: 15px;
    border-top: 1px solid #30302a;
  }

  .payment-section .eyebrow {
    margin-bottom: 8px;
  }

  .payment-intro {
    margin-bottom: 16px;
    color: #aaa79e;
    font-size: 11px;
  }

  .payment-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 10px;
    padding: 14px 12px;
    border: 1px solid #393931;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }

  .payment-option.selected {
    border-color: #c5a46d;
    background: #1b1b17;
  }

  .payment-option input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  .radio-mark {
    display: inline-block;
    flex: 0 0 16px;
    width: 16px;
    height: 16px;
    margin-top: 2px;
    border: 1px solid #77766f;
    border-radius: 50%;
  }

  .payment-option.selected .radio-mark {
    border: 5px solid #c5a46d;
  }

  .payment-copy {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .payment-copy strong {
    font-size: 12px;
    font-weight: 400;
  }

  .payment-copy small {
    color: #96948b;
    font-size: 10px;
    line-height: 1.5;
  }

  .checkout-button {
    width: 100%;
    padding: 15px 10px;
    border: 1px solid #c5a46d;
    background: #c5a46d;
    color: #111210;
    font-size: 11px;
    cursor: pointer;
  }

  .checkout-button:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .summary-note,
  .message {
    color: #aaa79e;
    font-size: 10px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .error-message {
    color: #ff9b91;
    font-size: 11px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .cart-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 30px 7%;
    border-top: 1px solid #30302a;
  }

  .footer-brand {
    color: #f5f0e6;
    font-family: Georgia, serif;
    font-size: 20px;
    letter-spacing: 2px;
    text-decoration: none;
  }

  .footer-brand span {
    color: #c5a46d;
  }

  .cart-footer p,
  .cart-footer > span {
    color: #77766f;
    font-size: 9px;
    letter-spacing: 2px;
  }

  @media (max-width: 800px) {
    .cart-content {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  @media (max-width: 520px) {
    .cart-page {
      padding-right: 5%;
      padding-left: 5%;
    }

    .cart-header {
      padding-top: 60px;
    }

    .cart-item {
      grid-template-columns: 85px minmax(0, 1fr);
      gap: 13px;
    }

    .item-price {
      grid-column: 2;
      grid-row: 2;
      margin-top: -5px;
    }

    .item-details h2 {
      font-size: 18px;
    }

    .cart-footer p {
      display: none;
    }
  }
</style>
