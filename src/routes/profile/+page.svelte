
<script>
  import { onMount } from 'svelte';
  import { supabase } from '#lib/supabaseClient.js';

  let loading = $state(true);
  let saving = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  /** @type {import('@supabase/supabase-js').User | null} */
  let user = $state(null);

  let form = $state({
    full_name: '',
    phone: '',
    address_line: '',
    barangay: '',
    city: '',
    province: '',
    postal_code: ''
  });

  onMount(async () => {
    await loadProfile();
  });

  async function loadProfile() {
    loading = true;
    errorMessage = '';
    successMessage = '';

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      user = authData.user;

      if (!user) {
        errorMessage = 'Please sign in to manage your delivery location.';
        return;
      }

      const { data, error } = await supabase
        .from('customer_profiles')
        .select(
          'full_name, phone, address_line, barangay, city, province, postal_code'
        )
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        form.full_name = data.full_name ?? '';
        form.phone = data.phone ?? '';
        form.address_line = data.address_line ?? '';
        form.barangay = data.barangay ?? '';
        form.city = data.city ?? '';
        form.province = data.province ?? '';
        form.postal_code = data.postal_code ?? '';
      }
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to load your profile.';
    } finally {
      loading = false;
    }
  }

  /** @param {SubmitEvent} event */
  async function saveProfile(event) {
    event.preventDefault();

    if (saving) return;

    saving = true;
    errorMessage = '';
    successMessage = '';

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      const currentUser = authData.user;

      if (!currentUser) {
        user = null;
        throw new Error('Please sign in before saving your delivery details.');
      }

      const profile = {
        user_id: currentUser.id,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address_line: form.address_line.trim(),
        barangay: form.barangay.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        postal_code: form.postal_code.trim(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('customer_profiles')
        .upsert(profile, { onConflict: 'user_id' });

      if (error) throw error;

      user = currentUser;
      successMessage = 'Your delivery details have been saved successfully.';
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to save your delivery details.';
    } finally {
      saving = false;
    }
  }

  async function signIn() {
    window.dispatchEvent(
      new CustomEvent('open-login')
    );
  }
</script>

<svelte:head>
  <title>My Profile | HOROLOGUE</title>
  <meta
    name="description"
    content="Manage your HOROLOGUE account and saved delivery location."
  />
</svelte:head>

<main class="profile-page">
  <div class="profile-container">
    <p class="eyebrow">YOUR HOROLOGUE ACCOUNT</p>
    <h1>My Profile</h1>
    <p class="subtitle">
      Save your delivery details once and use them for future purchases.
    </p>

    {#if loading}
      <div class="message">Loading your profile...</div>
    {:else if !user}
      <section class="notice">
        <h2>Sign in required</h2>
        <p>
          Please sign in to save and manage your delivery location.
        </p>
        <button class="primary-button" type="button" onclick={signIn}>
          Sign In
        </button>
      </section>
    {:else}
      <section class="profile-card">
        <div class="section-heading">
          <span class="section-icon">⌖</span>
          <div>
            <h2>Delivery Information</h2>
            <p>Where should we deliver your timepiece?</p>
          </div>
        </div>

        <form onsubmit={saveProfile}>
          <div class="field">
            <label for="full_name">Full name</label>
            <input
              id="full_name"
              bind:value={form.full_name}
              autocomplete="name"
              required
              maxlength="120"
              placeholder="Enter your full name"
            />
          </div>

          <div class="field">
            <label for="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              bind:value={form.phone}
              autocomplete="tel"
              required
              maxlength="30"
              placeholder="e.g. 09XX XXX XXXX"
            />
          </div>

          <div class="field">
            <label for="address_line">House number, street, or building</label>
            <input
              id="address_line"
              bind:value={form.address_line}
              autocomplete="street-address"
              required
              maxlength="200"
              placeholder="House no., street, subdivision"
            />
          </div>

          <div class="field">
            <label for="barangay">Barangay</label>
            <input
              id="barangay"
              bind:value={form.barangay}
              required
              maxlength="100"
              placeholder="Enter your barangay"
            />
          </div>

          <div class="field-row">
            <div class="field">
              <label for="city">City or municipality</label>
              <input
                id="city"
                bind:value={form.city}
                autocomplete="address-level2"
                required
                maxlength="100"
                placeholder="Enter your city"
              />
            </div>

            <div class="field">
              <label for="province">Province</label>
              <input
                id="province"
                bind:value={form.province}
                autocomplete="address-level1"
                required
                maxlength="100"
                placeholder="Enter your province"
              />
            </div>
          </div>

          <div class="field">
            <label for="postal_code">Postal code</label>
            <input
              id="postal_code"
              bind:value={form.postal_code}
              autocomplete="postal-code"
              maxlength="10"
              placeholder="Enter your postal code"
            />
          </div>

          {#if errorMessage}
            <p class="error-message" role="alert">{errorMessage}</p>
          {/if}

          {#if successMessage}
            <p class="success-message" role="status">
              {successMessage}
            </p>
          {/if}

          <button
            class="primary-button save-button"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Delivery Details'}
          </button>
        </form>

        <p class="privacy-note">
          <span>🔒</span>
          Your saved delivery details are associated with your account.
        </p>
      </section>
    {/if}
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    background: #0c0d0b;
  }

  .profile-page {
    min-height: 80vh;
    padding: 90px 24px;
    color: #f5f0e6;
    background: #0c0d0b;
  }

  .profile-container {
    width: min(100%, 760px);
    margin: 0 auto;
  }

  .eyebrow {
    margin: 0 0 14px;
    color: #c5a46d;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
  }

  h1 {
    margin: 0;
    font-family: Georgia, serif;
    font-size: clamp(36px, 6vw, 52px);
    font-weight: 400;
  }

  .subtitle {
    margin: 14px 0 36px;
    color: #aaa79d;
    font-size: 14px;
    line-height: 1.8;
  }

  .profile-card,
  .notice {
    padding: clamp(22px, 5vw, 38px);
    background: #131411;
    border: 1px solid #30302a;
  }

  .section-heading {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 30px;
  }

  .section-icon {
    display: grid;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    place-items: center;
    color: #c5a46d;
    border: 1px solid #49473f;
    font-size: 27px;
  }

  h2 {
    margin: 0 0 7px;
    font-family: Georgia, serif;
    font-size: 23px;
    font-weight: 400;
  }

  .section-heading p,
  .notice p {
    margin: 0;
    color: #aaa79d;
    font-size: 13px;
    line-height: 1.6;
  }

  form {
    display: grid;
    gap: 20px;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }

  .field {
    display: grid;
    align-content: start;
    gap: 9px;
  }

  label {
    color: #e3ded2;
    font-size: 12px;
  }

  input {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    padding: 14px;
    color: #f5f0e6;
    background: #191a17;
    border: 1px solid #49473f;
    border-radius: 0;
    outline: none;
    font: inherit;
    font-size: 13px;
  }

  input:focus {
    border-color: #c5a46d;
    box-shadow: 0 0 0 1px #c5a46d;
  }

  input::placeholder {
    color: #77766f;
  }

  .primary-button {
    padding: 15px 20px;
    color: #111210;
    background: #c5a46d;
    border: 1px solid #c5a46d;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.7px;
    transition: background 0.2s ease;
  }

  .primary-button:hover:not(:disabled) {
    background: #d7b981;
  }

  .primary-button:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .save-button {
    margin-top: 4px;
  }

  .error-message {
    margin: 0;
    color: #ff9b91;
    font-size: 13px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .success-message {
    margin: 0;
    color: #b7d8ad;
    font-size: 13px;
    line-height: 1.6;
  }

  .privacy-note {
    display: flex;
    gap: 9px;
    margin: 22px 0 0;
    color: #aaa79d;
    font-size: 11px;
    line-height: 1.7;
  }

  .notice h2 {
    margin-bottom: 12px;
  }

  .notice .primary-button {
    margin-top: 22px;
  }

  .message {
    padding: 30px;
    color: #aaa79d;
    border: 1px solid #30302a;
  }

  @media (max-width: 560px) {
    .profile-page {
      padding: 55px 16px;
    }

    .field-row {
      grid-template-columns: 1fr;
    }
  }
</style>
