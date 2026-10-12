
<script>
  import { supabase } from '../supabaseClient.js';

  let email = $state('');
  let password = $state('');
  let isRegistering = $state(false);
  let loading = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  let { onClose, onSuccess } = $props();

  /** @param {SubmitEvent} event */
  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    loading = true;
    errorMessage = '';
    successMessage = '';

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password
        });

        if (error) throw error;

        if (!data.session) {
          successMessage =
            'Account created. Check your email to confirm your account, then sign in.';
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;
      }

      onSuccess?.();
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';
    } finally {
      loading = false;
    }
  }

  function switchMode() {
    if (loading) return;

    isRegistering = !isRegistering;
    errorMessage = '';
    successMessage = '';
  }
</script>

<div
  class="overlay"
  role="presentation"
  onclick={(event) => {
    if (event.target === event.currentTarget && !loading) {
      onClose?.();
    }
  }}
>
  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="login-title"
  >
    <button
      class="close"
      type="button"
      onclick={() => !loading && onClose?.()}
      aria-label="Close login"
      disabled={loading}
    >×</button>

    <p class="brand">HOROLOGUE</p>
    <p class="eyebrow">YOUR NEXT TIMEPIECE AWAITS</p>

    <h2 id="login-title">
      {isRegistering ? 'Create your account' : 'Welcome back'}
    </h2>

    <p class="intro">
      {isRegistering
        ? 'Create an account to continue your journey.'
        : 'Sign in to continue to checkout.'}
    </p>

    <form onsubmit={handleSubmit}>
      <label for="email">Email address</label>
      <input
        id="email"
        type="email"
        bind:value={email}
        autocomplete="email"
        required
        disabled={loading}
      />

      <label for="password">Password</label>
      <input
        id="password"
        type="password"
        bind:value={password}
        autocomplete={isRegistering ? 'new-password' : 'current-password'}
        minlength="6"
        required
        disabled={loading}
      />

      {#if errorMessage}
        <p class="error" role="alert">{errorMessage}</p>
      {/if}

      {#if successMessage}
        <p class="success" role="status">{successMessage}</p>
      {/if}

      <button class="submit" type="submit" disabled={loading}>
        {loading
          ? 'Please wait...'
          : isRegistering
            ? 'Create Account'
            : 'Sign In'}
      </button>
    </form>

    <p class="switch">
      {isRegistering
        ? 'Already have an account?'
        : "Don't have an account?"}

      <button type="button" onclick={switchMode} disabled={loading}>
        {isRegistering ? 'Sign in' : 'Create one'}
      </button>
    </p>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgb(0 0 0 / 75%);
    backdrop-filter: blur(5px);
  }

  .modal {
    position: relative;
    width: min(100%, 440px);
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    padding: 38px;
    color: #f5f0e6;
    background: #111210;
    border: 1px solid #30302a;
  }

  .close {
    position: absolute;
    top: 12px;
    right: 16px;
    border: 0;
    background: transparent;
    color: #f5f0e6;
    font-size: 28px;
    cursor: pointer;
  }

  .close:disabled {
    opacity: 0.5;
    cursor: wait;
  }

  .brand {
    color: #c5a46d;
    letter-spacing: 4px;
    font-size: 13px;
    font-weight: 700;
  }

  .eyebrow {
    margin-top: 30px;
    color: #c5a46d;
    font-size: 10px;
    letter-spacing: 2px;
  }

  h2 {
    margin: 10px 0;
    font-family: Georgia, serif;
    font-weight: 400;
    font-size: 30px;
  }

  .intro,
  .switch {
    color: #aaa79d;
    font-size: 13px;
    line-height: 1.6;
  }

  form {
    display: grid;
    gap: 10px;
    margin-top: 25px;
  }

  label {
    margin-top: 8px;
    font-size: 12px;
  }

  input {
    box-sizing: border-box;
    width: 100%;
    padding: 13px;
    color: #f5f0e6;
    background: #191a17;
    border: 1px solid #49473f;
    border-radius: 0;
    outline-color: #c5a46d;
  }

  input:disabled {
    opacity: 0.65;
  }

  .submit {
    margin-top: 12px;
    padding: 14px;
    color: #111210;
    background: #c5a46d;
    border: 0;
    cursor: pointer;
    font-weight: 700;
  }

  .submit:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .error {
    color: #ff9b91;
    font-size: 12px;
    overflow-wrap: anywhere;
  }

  .success {
    color: #b7d8ad;
    font-size: 12px;
    line-height: 1.6;
  }

  .switch {
    margin-top: 22px;
    text-align: center;
  }

  .switch button {
    color: #c5a46d;
    background: none;
    border: 0;
    cursor: pointer;
  }

  .switch button:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  @media (max-width: 480px) {
    .modal {
      padding: 28px 22px;
    }

    h2 {
      font-size: 26px;
    }
  }
</style>
