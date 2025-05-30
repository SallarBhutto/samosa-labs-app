// Configuration constants for SamosaLabs License Server
export const CONFIG = {
  // Stripe API Keys
  STRIPE_SECRET_KEY: "sk_test_51I1EurFdciK24uWbAeYvVcHpjXbKOd9vscyJj5Os49COpqaPYnWcpasS8BoKT3jObXHIGSomT1aXA18VM9dVO8aj00uRYKwDiP",
  VITE_STRIPE_PUBLIC_KEY: "pk_test_51I1EurFdciK24uWbyhVuNH3KliQdkEiPY0xW2pDYww0a77IHm5GR0UXYUEo4qet0THYLfdqqLYeF5d4VcEK45DIO00RkdCbm4x",
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://samosalabs_user:samosa_secure_password_2024@localhost:5432/samosalabs",
  POSTGRES_PASSWORD: "samosa_secure_password_2024",
  
  // Session Secret
  SESSION_SECRET: "samosa_super_secret_session_key_2024_production",
  
  // Application Settings
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000"),
  
  // Pricing
  PRICE_PER_USER: 5.00
} as const;

// Export individual values for convenience
export const {
  STRIPE_SECRET_KEY,
  VITE_STRIPE_PUBLIC_KEY,
  DATABASE_URL,
  POSTGRES_PASSWORD,
  SESSION_SECRET,
  NODE_ENV,
  PORT,
  PRICE_PER_USER
} = CONFIG;