import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const PLANS = [
  {
    id: "standard",
    name: "Standard",
    count: 50,
    price: 279,
    priceId: "price_1ToQYIDpKP2Si5NAlaHQyy3p",
    description: "Best for a focused specialty or city-wide push",
    features: [
      "50 personalized email drafts",
      "AI physician research (PubMed + web)",
      "Quality score filter",
      "Specialty, state & ethnicity targeting",
      "Delivered in under 24 hrs",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    count: 150,
    price: 549,
    priceId: "price_1ToQYaDpKP2Si5NAP9BlwI3t",
    description: "Maximum coverage — highest reply rate",
    features: [
      "150 personalized email drafts",
      "AI physician research (PubMed + web)",
      "Quality score filter",
      "Specialty, state & ethnicity targeting",
      "Delivered in under 24 hrs",
      "Email support",
    ],
    popular: true,
  },
];
