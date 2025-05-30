// Client-side configuration constants
export const CLIENT_CONFIG = {
  // Stripe Public Key (safe for client-side)
  STRIPE_PUBLIC_KEY: "pk_test_51I1EurFdciK24uWbyhVuNH3KliQdkEiPY0xW2pDYww0a77IHm5GR0UXYUEo4qet0THYLfdqqLYeF5d4VcEK45DIO00RkdCbm4x",
  
  // Pricing
  PRICE_PER_USER: 5.00,
  
  // API Base URL
  API_BASE_URL: "",
} as const;

export const {
  STRIPE_PUBLIC_KEY,
  PRICE_PER_USER,
  API_BASE_URL
} = CLIENT_CONFIG;