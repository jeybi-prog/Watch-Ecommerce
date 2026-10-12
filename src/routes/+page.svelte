
<script>
  import Navbar from '../lib/components/Navbar.svelte';

  let contactModalOpen = $state(false);

  const featuredWatches = [
    {
      name: 'The Classic',
      brand: 'ROLEX',
      price: 'Add price',
      category: 'TIMELESS ELEGANCE',
      image: '/Rolex/Datejust5.jpg'
    },
    {
      name: 'The Heritage',
      brand: 'Cartier',
      price: 'Add price',
      category: 'REFINED CRAFTSMANSHIP',
      image: '/Cartier/Cartier2.jpg'
    },
    {
      name: 'The Minimalist',
      brand: 'SEIKO',
      price: 'Add price',
      category: 'EVERYDAY LUXURY',
      image: '/Seiko/Seiko1.jpg'
    }
  ];

  const contactEmail = 'jjvmanongsong@gmail.com';
  const contactPhone = '+63 992 451 8225';
  const facebookUrl = 'https://www.facebook.com/john.jv.manongsong.2025';

  function closeContactModal() {
    contactModalOpen = false;
  }

  /*** @param {KeyboardEvent} event*/
  function handleModalKeydown(event) {
    if (event.key === 'Escape') {
      closeContactModal();
    }
  }
</script>

<svelte:head>
  <title>HOROLOGUE — A Study in Time</title>
  <meta
    name="description"
    content="Discover a curated collection of elegant timepieces at HOROLOGUE."
  />
</svelte:head>

<svelte:window onkeydown={handleModalKeydown} />

<Navbar />

<main>
  <!-- Hero -->
  <section class="hero">
    <div class="hero-content">
      <p class="eyebrow">THE ART OF TIMEKEEPING</p>

      <h1>
        Time is an art.<br />
        <span>Wear it well.</span>
      </h1>

      <p class="hero-description">
        Discover exceptional timepieces chosen for those who
        appreciate timeless design and fine craftsmanship.
      </p>

      <a href="/shop" class="primary-button">
        EXPLORE THE COLLECTION <span>↗</span>
      </a>

      <div class="hero-note">
        <span class="gold-line"></span>
        A CURATED WATCH COLLECTION
      </div>
    </div>

    <div class="hero-image">
      <img
        class="image-placeholder"
        src="/Rolex/Datejust2.webp"
        alt="Luxury Rolex Datejust watch"
      />

      <div class="image-caption">
        <span>01 / TIMELESS DESIGN</span>
        <span>EST. 2026</span>
      </div>
    </div>

    <div class="hero-index">01 — 03</div>
  </section>

  <!-- Brand values -->
  <section class="trust-strip">
    <div>TIMELESS DESIGN</div>
    <span>✳</span>
    <div>CURATED TIMEPIECES</div>
    <span>✳</span>
    <div>DETAILS THAT MATTER</div>
  </section>

  <!-- Featured watches -->
  <section class="featured" id="collections">
    <div class="section-heading">
      <div>
        <p class="eyebrow">A SELECTION OF EXCELLENCE</p>
        <h2>Featured <span>timepieces.</span></h2>
      </div>

      <a href="/shop" class="text-link">
        VIEW ALL WATCHES ↗
      </a>
    </div>

    <div class="product-grid">
      {#each featuredWatches as watch}
        <article class="product-card">
          <a
            href="/shop"
            class="product-image"
            aria-label={`View ${watch.name}`}
          >
            <img
              class="product-image-placeholder"
              src={watch.image}
              alt={`${watch.brand} ${watch.name}`}
              loading="lazy"
            />

            <span class="view-product">DISCOVER ↗</span>
          </a>

          <div class="product-info">
            <p class="product-category">{watch.category}</p>

            <div class="product-title">
              <div>
                <p class="brand">{watch.brand}</p>
                <h3>{watch.name}</h3>
              </div>

              <p class="price">{watch.price}</p>
            </div>
          </div>
        </article>
      {/each}
    </div>
  </section>

  <!-- Our story -->
  <section class="story" id="about">
    <p class="eyebrow">BEYOND THE MINUTE</p>

    <h2>
      Some things are worth<br />
      <span>taking your time for.</span>
    </h2>

    <p>
      From understated elegance to enduring icons, discover
      timepieces that make every second meaningful.
    </p>

    <a href="/shop" class="story-link">
      FIND YOUR TIMEPIECE ↗
    </a>
  </section>

  <!-- Contact -->
  <section class="contact" id="contact">
    <div class="contact-content">
      <p class="eyebrow">WE'D LOVE TO HEAR FROM YOU</p>

      <h2>
        Every great story<br />
        starts with a <span>conversation.</span>
      </h2>

      <p class="contact-description">
        Have a question about our timepieces or need assistance?
        Get in touch with us. We're happy to help you find
        a watch that suits your style.
      </p>

      <button
        type="button"
        class="contact-button"
        onclick={() => (contactModalOpen = true)}
      >
        CONTACT US <span>↗</span>
      </button>
    </div>

    <div class="contact-details">
      <div class="contact-detail">
        <span class="detail-number">01</span>
        <div>
          <h3>Product Inquiries</h3>
          <p>Questions about our watches and collections.</p>
        </div>
      </div>

      <div class="contact-detail">
        <span class="detail-number">02</span>
        <div>
          <h3>Shopping Assistance</h3>
          <p>Need help choosing your next timepiece?</p>
        </div>
      </div>

      <div class="contact-detail">
        <span class="detail-number">03</span>
        <div>
          <h3>Customer Support</h3>
          <p>We're here to help with your questions.</p>
        </div>
      </div>
    </div>
  </section>
</main>

<!-- Footer -->
<footer>
  <a href="/" class="footer-logo">HOROLOGUE<span>.</span></a>

  <p>A STUDY IN TIME. EST. 2026.</p>

  <div class="footer-links">
    <a href="/#about">OUR STORY</a>
    <a href="/#contact">CONTACT</a>
    <a href="/shop">WATCHES</a>
  </div>

  <p>© 2026 HOROLOGUE</p>
</footer>

<!-- Contact modal -->
{#if contactModalOpen}
  <div
    class="modal-overlay"
    role="presentation"
    onclick={(event) => {
      if (event.target === event.currentTarget) {
        closeContactModal();
      }
    }}
  >
    <section
      class="contact-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div class="modal-top">
        <p class="eyebrow">HOROLOGUE / CONTACT</p>

        <button
          type="button"
          class="modal-close"
          aria-label="Close contact window"
          onclick={closeContactModal}
        >
          ×
        </button>
      </div>

      <div class="modal-heading">
        <p class="modal-kicker">LET'S START A CONVERSATION</p>

        <h2 id="contact-modal-title">
          Get in <span>touch.</span>
        </h2>

        <p>
          Choose your preferred way to contact us.
          We'd be happy to hear from you.
        </p>
      </div>

      <div class="modal-contact-list">
        <!-- Email -->
        <a
          class="modal-contact-item"
          href={`mailto:${contactEmail}?subject=${encodeURIComponent('HOROLOGUE Inquiry')}`}
        >
          <div class="contact-icon" aria-hidden="true">✉</div>

          <div class="modal-contact-text">
            <span class="modal-label">EMAIL US</span>
            <strong>{contactEmail}</strong>
            <span class="modal-description">
              For questions and customer support
            </span>
          </div>

          <span class="modal-arrow" aria-hidden="true">↗</span>
        </a>

        <!-- Phone -->
        <a
          class="modal-contact-item"
          href={`tel:${contactPhone.replace(/[^\d+]/g, '')}`}
        >
          <div class="contact-icon" aria-hidden="true">☎</div>

          <div class="modal-contact-text">
            <span class="modal-label">CALL US</span>
            <strong>{contactPhone}</strong>
            <span class="modal-description">
              For shopping assistance and inquiries
            </span>
          </div>

          <span class="modal-arrow" aria-hidden="true">↗</span>
        </a>

        <!-- Facebook -->
        <a
          class="modal-contact-item"
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="contact-icon facebook-icon" aria-hidden="true">f</div>

          <div class="modal-contact-text">
            <span class="modal-label">FIND US ON FACEBOOK</span>
            <strong>HOROLOGUE</strong>
            <span class="modal-description">
              Connect with us and see our updates
            </span>
          </div>

          <span class="modal-arrow" aria-hidden="true">↗</span>
        </a>
      </div>

      <div class="modal-footer">
        <span class="gold-line"></span>
        <p>TIMELESS SERVICE. PERSONAL ATTENTION.</p>
      </div>
    </section>
  </div>
{/if}

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html) {
    scroll-behavior: smooth;
    scroll-padding-top: 90px;
  }

  :global(body) {
    margin: 0;
    background: #111210;
    color: #f5f0e6;
    font-family: Arial, Helvetica, sans-serif;
  }

  :global(a),
  :global(button) {
    -webkit-tap-highlight-color: transparent;
  }

  /* Hero */
  .hero {
    min-height: 610px;
    padding: 65px 10% 75px;
    display: grid;
    grid-template-columns: 1fr 0.9fr;
    align-items: center;
    gap: 8%;
    position: relative;
  }

  .eyebrow {
    color: #c5a46d;
    font-size: 10px;
    letter-spacing: 2.5px;
    font-weight: 600;
  }

  h1 {
    margin: 28px 0 22px;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(43px, 5vw, 70px);
    font-weight: 400;
    line-height: 1.12;
    letter-spacing: -2px;
  }

  h1 span,
  h2 span {
    color: #c5a46d;
    font-style: italic;
  }

  .hero-description {
    max-width: 390px;
    color: #a5a197;
    font-size: 14px;
    line-height: 1.9;
  }

  .primary-button {
    display: inline-flex;
    gap: 30px;
    align-items: center;
    margin-top: 25px;
    padding: 17px 22px;
    background: #c5a46d;
    color: #111210;
    text-decoration: none;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.2px;
    transition: background 0.2s ease;
  }

  .primary-button:hover {
    background: #ddc18c;
  }

  .primary-button span {
    color: #111210;
  }

  .hero-note {
    margin-top: 60px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #a5a197;
    font-size: 9px;
    letter-spacing: 1.5px;
  }

  .gold-line {
    width: 30px;
    height: 1px;
    background: #c5a46d;
    flex-shrink: 0;
  }

  /* Hero image: preserve original image proportions */
  .hero-image {
    position: relative;
    min-width: 0;
  }

  .image-placeholder {
    display: block;
    width: 100%;
    height: 420px;
    object-fit: contain;
    object-position: center;
    background: #1c1d19;
    border: 1px solid #30302a;
  }

  .image-caption {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding-top: 15px;
    color: #a5a197;
    font-size: 9px;
    letter-spacing: 1px;
  }

  .hero-index {
    position: absolute;
    right: 3%;
    bottom: 35px;
    color: #a5a197;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12px;
  }

  /* Brand values */
  .trust-strip {
    padding: 25px 8%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 15px;
    border-top: 1px solid #30302a;
    border-bottom: 1px solid #30302a;
    color: #a5a197;
    font-size: 9px;
    letter-spacing: 1.5px;
    text-align: center;
  }

  .trust-strip span {
    color: #c5a46d;
  }

  /* Featured watches */
  .featured {
    padding: 100px 10%;
    background: #111210;
    scroll-margin-top: 90px;
  }

  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 20px;
    margin-bottom: 42px;
  }

  h2 {
    margin: 15px 0 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 400;
    font-size: clamp(32px, 4vw, 48px);
    letter-spacing: -1px;
  }

  .text-link,
  .story-link {
    color: #f5f0e6;
    font-size: 10px;
    letter-spacing: 1px;
    text-decoration: none;
    padding-bottom: 7px;
    border-bottom: 1px solid #c5a46d;
    transition: color 0.2s ease;
  }

  .text-link:hover,
  .story-link:hover {
    color: #c5a46d;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 25px;
  }

  .product-image {
    display: block;
    position: relative;
    overflow: hidden;
    background: #1c1d19;
    border: 1px solid #30302a;
    aspect-ratio: 4 / 5;
  }

  .product-image-placeholder {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    transition: transform 0.4s ease;
  }

  .product-image:hover .product-image-placeholder {
    transform: scale(1.03);
  }

  .view-product {
    position: absolute;
    bottom: 15px;
    left: 15px;
    background: #c5a46d;
    padding: 12px 14px;
    color: #111210;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .product-info {
    padding-top: 16px;
  }

  .product-category {
    color: #c5a46d;
    font-size: 9px;
    letter-spacing: 1.5px;
  }

  .product-title {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 10px;
  }

  .brand {
    margin: 12px 0 6px;
    color: #a5a197;
    font-size: 10px;
    letter-spacing: 1px;
  }

  h3 {
    margin: 0;
    color: #f5f0e6;
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 400;
    font-size: 20px;
  }

  .price {
    color: #a5a197;
    font-size: 12px;
    white-space: nowrap;
  }

  /* Our story */
  .story {
    background: #191a17;
    border-top: 1px solid #30302a;
    border-bottom: 1px solid #30302a;
    text-align: center;
    padding: 90px 20px 100px;
    scroll-margin-top: 90px;
  }

  .story h2 {
    line-height: 1.35;
  }

  .story > p:not(.eyebrow) {
    max-width: 440px;
    margin: 20px auto 30px;
    color: #a5a197;
    font-size: 13px;
    line-height: 1.9;
  }

  /* Contact section */
  .contact {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 9%;
    align-items: center;
    padding: 100px 10%;
    background: #111210;
    scroll-margin-top: 90px;
  }

  .contact-content h2 {
    line-height: 1.3;
    margin-top: 20px;
  }

  .contact-description {
    max-width: 450px;
    margin: 24px 0;
    color: #a5a197;
    font-size: 13px;
    line-height: 1.9;
  }

  .contact-button {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 35px;
    margin-top: 8px;
    padding: 17px 22px;
    border: 1px solid #c5a46d;
    background: #c5a46d;
    color: #111210;
    font-family: inherit;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.2px;
    cursor: pointer;
    transition:
      background 0.2s ease,
      border-color 0.2s ease;
  }

  .contact-button:hover {
    background: #ddc18c;
    border-color: #ddc18c;
  }

  .contact-button span {
    font-size: 14px;
  }

  .contact-details {
    border-top: 1px solid #30302a;
  }

  .contact-detail {
    display: flex;
    align-items: flex-start;
    gap: 22px;
    padding: 25px 0;
    border-bottom: 1px solid #30302a;
  }

  .detail-number {
    color: #c5a46d;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 14px;
  }

  .contact-detail h3 {
    margin-bottom: 9px;
    font-size: 19px;
  }

  .contact-detail p {
    margin: 0;
    color: #a5a197;
    font-size: 12px;
    line-height: 1.7;
  }

  /* Footer */
  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
    padding: 30px 7%;
    background: #111210;
    border-top: 1px solid #30302a;
  }

  .footer-logo {
    color: #f5f0e6;
    font-weight: 700;
    letter-spacing: 2px;
    text-decoration: none;
  }

  .footer-logo span {
    color: #c5a46d;
  }

  footer p {
    color: #a5a197;
    font-size: 9px;
    letter-spacing: 1px;
  }

  .footer-links {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
  }

  .footer-links a {
    color: #a5a197;
    font-size: 9px;
    letter-spacing: 1px;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .footer-links a:hover {
    color: #c5a46d;
  }

  /* Modal overlay */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow-y: auto;
    background: rgb(0 0 0 / 78%);
    backdrop-filter: blur(6px);
    animation: overlay-appear 0.2s ease;
  }

  /* Modal window */
  .contact-modal {
    position: relative;
    width: 100%;
    max-width: 520px;
    max-height: calc(100dvh - 40px);
    overflow-y: auto;
    padding: 30px;
    background: #171814;
    border: 1px solid #49402e;
    box-shadow: 0 25px 80px rgb(0 0 0 / 45%);
    animation: modal-appear 0.25s ease;
  }

  .modal-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding-bottom: 20px;
    border-bottom: 1px solid #30302a;
  }

  .modal-top .eyebrow {
    margin: 0;
    font-size: 9px;
    letter-spacing: 2px;
  }

  .modal-close {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid #39392f;
    background: transparent;
    color: #f5f0e6;
    font-size: 25px;
    font-weight: 300;
    cursor: pointer;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease;
  }

  .modal-close:hover {
    color: #c5a46d;
    border-color: #c5a46d;
    background: #22221c;
  }

  .modal-heading {
    padding: 28px 0 24px;
  }

  .modal-kicker {
    color: #a5a197;
    font-size: 9px;
    letter-spacing: 1.5px;
  }

  .modal-heading h2 {
    margin: 12px 0;
    font-size: 42px;
  }

  .modal-heading > p:last-child {
    max-width: 360px;
    margin: 12px 0 0;
    color: #a5a197;
    font-size: 12px;
    line-height: 1.8;
  }

  .modal-contact-list {
    border-top: 1px solid #30302a;
  }

  .modal-contact-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px 0;
    border-bottom: 1px solid #30302a;
    color: inherit;
    text-decoration: none;
    transition: background 0.2s ease;
  }

  .modal-contact-item:hover .contact-icon {
    border-color: #c5a46d;
    color: #c5a46d;
    background: #22221c;
  }

  .modal-contact-item:hover .modal-arrow {
    color: #c5a46d;
    transform: translate(2px, -2px);
  }

  .contact-icon {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid #39392f;
    color: #c5a46d;
    font-size: 19px;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease;
  }

  .facebook-icon {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 23px;
    font-weight: 700;
  }

  .modal-contact-text {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
  }

  .modal-label {
    color: #c5a46d;
    font-size: 8px;
    letter-spacing: 1.5px;
  }

  .modal-contact-text strong {
    color: #f5f0e6;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 17px;
    font-weight: 400;
    overflow-wrap: anywhere;
  }

  .modal-description {
    color: #a5a197;
    font-size: 11px;
    line-height: 1.6;
  }

  .modal-arrow {
    color: #a5a197;
    font-size: 16px;
    transition:
      color 0.2s ease,
      transform 0.2s ease;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 23px;
  }

  .modal-footer p {
    margin: 0;
    color: #a5a197;
    font-size: 8px;
    letter-spacing: 1.2px;
  }

  /* Modal animation */
  @keyframes overlay-appear {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes modal-appear {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Tablet */
  @media (max-width: 800px) {
    .hero {
      padding: 55px 7%;
      grid-template-columns: 1fr 0.85fr;
      gap: 5%;
    }

    .image-placeholder {
      height: 340px;
    }

    .featured {
      padding: 75px 7%;
    }

    .product-grid {
      gap: 15px;
    }

    .product-title {
      flex-direction: column;
      gap: 0;
    }

    .price {
      margin-top: 8px;
    }

    .contact {
      grid-template-columns: 1fr;
      gap: 45px;
      padding: 80px 7%;
    }
  }

  /* Mobile */
  @media (max-width: 600px) {
    .hero {
      grid-template-columns: 1fr;
      padding: 50px 6% 55px;
      gap: 35px;
    }

    h1 {
      font-size: 52px;
    }

    .hero-note {
      margin-top: 35px;
    }

    .image-placeholder {
      height: 360px;
    }

    .hero-index {
      display: none;
    }

    .trust-strip {
      flex-wrap: wrap;
      padding: 22px 5%;
      font-size: 8px;
    }

    .featured {
      padding: 65px 6%;
    }

    .section-heading {
      align-items: start;
      flex-direction: column;
      margin-bottom: 28px;
    }

    .product-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      row-gap: 30px;
    }

    .product-grid article:last-child {
      grid-column: 1 / -1;
      max-width: calc(50% - 8px);
    }

    h3 {
      font-size: 18px;
    }

    .story {
      padding: 70px 6%;
    }

    .contact {
      padding: 70px 6%;
    }

    .contact-content h2 {
      font-size: 36px;
    }

    .contact-detail {
      gap: 16px;
    }

    footer {
      flex-direction: column;
      text-align: center;
      gap: 10px;
      padding: 30px 6%;
    }

    .footer-links {
      justify-content: center;
    }

    .contact-modal {
      padding: 22px;
    }

    .modal-heading h2 {
      font-size: 36px;
    }

    .modal-contact-item {
      gap: 12px;
    }

    .contact-icon {
      width: 38px;
      height: 38px;
    }

    .modal-contact-text strong {
      font-size: 15px;
    }

    .modal-footer p {
      font-size: 7px;
      letter-spacing: 0.8px;
    }
  }

  @media (max-width: 360px) {
    h1 {
      font-size: 43px;
    }

    .product-grid {
      grid-template-columns: 1fr;
    }

    .product-grid article:last-child {
      grid-column: auto;
      max-width: none;
    }

    .contact-modal {
      padding: 17px;
    }

    .modal-contact-text strong {
      font-size: 13px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(html) {
      scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
