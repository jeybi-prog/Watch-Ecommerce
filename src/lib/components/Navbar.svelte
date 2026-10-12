
<script>
  import { onMount } from 'svelte';
  import { supabase } from '../supabaseClient.js';
  import LoginModal from './LoginModal.svelte';

  let menuOpen = $state(false);
  let showLoginModal = $state(false);
  let isLoggedIn = $state(false);
  let checkingAuth = $state(true);
  let loggingOut = $state(false);
  let authMessage = $state('');

  onMount(() => {
    let active = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        console.error('Unable to check authentication:', error);
      }

      isLoggedIn = !!data.session;
      checkingAuth = false;
    }

    checkSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      isLoggedIn = !!session;
      checkingAuth = false;
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  });

  function openLogin() {
    menuOpen = false;
    authMessage = '';
    showLoginModal = true;
  }

  async function handleLogout() {
    if (loggingOut) return;

    loggingOut = true;
    authMessage = '';

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      isLoggedIn = false;
      showLoginModal = false;
      menuOpen = false;
      authMessage = 'You have been signed out.';
    } catch (error) {
      authMessage =
        error instanceof Error
          ? error.message
          : 'Unable to sign out. Please try again.';
    } finally {
      loggingOut = false;
    }
  }

  function handleLoginSuccess() {
    showLoginModal = false;
    authMessage = 'You are signed in.';
  }
</script>

<header class="navbar">
  <a href="/" class="logo" onclick={() => (menuOpen = false)}>
    HOROLOGUE<span>.</span>
  </a>

  <nav class:open={menuOpen}>
    <a href="/" onclick={() => (menuOpen = false)}>Home</a>
    <a href="/shop" onclick={() => (menuOpen = false)}>Watches</a>
    <a href="/#collections" onclick={() => (menuOpen = false)}>Collections</a>
    <a href="/#about" onclick={() => (menuOpen = false)}>Our Story</a>
    <a href="/#contact" onclick={() => (menuOpen = false)}>Contact</a>
  </nav>

  <div class="nav-actions">
    {#if checkingAuth}
      <span class="auth-loading">ACCOUNT</span>
    {:else if isLoggedIn}
      <button
        class="login-link"
        type="button"
        onclick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? 'SIGNING OUT...' : 'LOGOUT'}
      </button>
    {:else}
      <button
        class="login-link"
        type="button"
        onclick={openLogin}
      >
        LOGIN
      </button>
    {/if}

    <a
      href="/cart"
      class="bag-link"
      onclick={() => (menuOpen = false)}
    >
      Shopping Bag
    </a>

    <button
      class="menu-toggle"
      type="button"
      onclick={() => (menuOpen = !menuOpen)}
      aria-label="Toggle navigation"
      aria-expanded={menuOpen}
    >
      {menuOpen ? 'CLOSE' : 'MENU'}
    </button>
  </div>
</header>

{#if authMessage}
  <p class="auth-message" role="status">{authMessage}</p>
{/if}

{#if showLoginModal}
  <LoginModal
    onClose={() => (showLoginModal = false)}
    onSuccess={handleLoginSuccess}
  />
{/if}

<style>
  .navbar {
    min-height: 82px;
    padding: 0 7%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
    background: #111210;
    border-bottom: 1px solid #30302a;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-sizing: border-box;
  }

  .logo {
    color: #f5f0e6;
    font-size: 21px;
    font-weight: 700;
    letter-spacing: 3px;
    text-decoration: none;
    white-space: nowrap;
  }

  .logo span {
    color: #c5a46d;
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32px;
  }

  nav a,
  .bag-link {
    color: #c1beb5;
    font-size: 11px;
    letter-spacing: 1px;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  nav a:hover,
  .bag-link:hover {
    color: #c5a46d;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .login-link {
    padding: 8px 0;
    border: 0;
    background: transparent;
    color: #c5a46d;
    font-family: inherit;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .login-link:hover {
    color: #f5f0e6;
  }

  .login-link:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .auth-loading {
    color: #aaa79e;
    font-size: 10px;
    letter-spacing: 1px;
  }

  .auth-message {
    position: fixed;
    top: 90px;
    right: 20px;
    z-index: 1100;
    max-width: calc(100% - 40px);
    padding: 12px 16px;
    border: 1px solid #5b4b32;
    background: #191a17;
    color: #c5a46d;
    font-size: 12px;
  }

  .menu-toggle {
    display: none;
    padding: 10px 0;
    border: none;
    background: transparent;
    color: #f5f0e6;
    font: inherit;
    font-size: 10px;
    letter-spacing: 1.5px;
    cursor: pointer;
  }

  @media (max-width: 1000px) {
    .navbar {
      gap: 18px;
    }

    nav {
      gap: 18px;
    }

    .nav-actions {
      gap: 14px;
    }
  }

  @media (max-width: 800px) {
    .navbar {
      min-height: 74px;
      padding: 0 5%;
      gap: 16px;
    }

    .logo {
      font-size: 17px;
      letter-spacing: 2px;
    }

    .nav-actions {
      margin-left: auto;
      gap: 18px;
    }

    .menu-toggle {
      display: block;
    }

    nav {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      padding: 28px 5%;
      align-items: flex-start;
      flex-direction: column;
      gap: 25px;
      background: #111210;
      border-bottom: 1px solid #30302a;
    }

    nav.open {
      display: flex;
    }
  }

  @media (max-width: 420px) {
    .logo {
      font-size: 15px;
      letter-spacing: 1.5px;
    }

    .nav-actions {
      gap: 12px;
    }

    .bag-link {
      font-size: 10px;
    }

    .login-link {
      font-size: 9px;
      letter-spacing: 1px;
    }
  }
</style>
