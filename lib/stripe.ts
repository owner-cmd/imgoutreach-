import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const SHARED_FEATURES = [
  "AI physician research (PubMed + web)",
  "Quality score filter",
  "Specialty, state & gender targeting",
  "Ethnicity preference — matching physicians prioritized first",
  "Review, edit & send from your dashboard — via your Gmail",
  "Delivered within 24 hours",
  "Email support",
];

export const PLANS = [
  {
    id: "standard",
    name: "Standard",
    count: 50,
    price: 279,
    priceId: "price_1ToQYIDpKP2Si5NAlaHQyy3p",
    description: "Best for a focused specialty or city-wide push",
  },
  {
    id: "pro",
    name: "Pro",
    count: 150,
    price: 549,
    priceId: "price_1ToQYaDpKP2Si5NAP9BlwI3t",
    description: "Maximum coverage — highest reply rate",
    popular: true,
  },
];
