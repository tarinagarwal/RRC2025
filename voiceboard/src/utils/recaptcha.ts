// reCAPTCHA v3 utility functions

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

let recaptchaLoaded = false;

// Load reCAPTCHA script dynamically
export const loadRecaptcha = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (recaptchaLoaded) {
      resolve();
      return;
    }

    if (
      !RECAPTCHA_SITE_KEY ||
      RECAPTCHA_SITE_KEY === "your_recaptcha_site_key_here"
    ) {
      console.warn(
        "⚠️ reCAPTCHA site key not configured, skipping bot protection"
      );
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      recaptchaLoaded = true;
      console.log("✅ reCAPTCHA loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("❌ Failed to load reCAPTCHA");
      reject(new Error("Failed to load reCAPTCHA"));
    };

    document.head.appendChild(script);
  });
};

// Execute reCAPTCHA and get token
export const executeRecaptcha = async (
  action: string = "diagram_generation"
): Promise<string | null> => {
  try {
    if (
      !RECAPTCHA_SITE_KEY ||
      RECAPTCHA_SITE_KEY === "your_recaptcha_site_key_here"
    ) {
      console.warn("⚠️ reCAPTCHA not configured, skipping verification");
      return null;
    }

    await loadRecaptcha();

    return new Promise((resolve) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
            action,
          });
          console.log("🤖 reCAPTCHA token generated for action:", action);
          resolve(token);
        } catch (error) {
          console.error("❌ reCAPTCHA execution failed:", error);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error("❌ reCAPTCHA error:", error);
    return null;
  }
};

// Check if reCAPTCHA is configured
export const isRecaptchaConfigured = (): boolean => {
  return !!(
    RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== "your_recaptcha_site_key_here"
  );
};
