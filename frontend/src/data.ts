import { ItemData } from "./components/CartItem.tsx";

export const Products: ItemData[] = [
  {
    description: "Premium Shoes",
    image: "https://source.unsplash.com/NUoPWImmjCU",
    name: "Puma Shoes",
    price: 20,
    quantity: 1,
    id: "shoe",
  },
  {
    description: "Comfortable everyday slippers",
    image: "https://source.unsplash.com/K_gIPI791Jo",
    name: "Nike Sliders",
    price: 10,
    quantity: 1,
    id: "slippers",
  },
];

export const Subscriptions: ItemData[] = [
  {
    description: "Access to premium content and exclusive features",
    image: "https://source.unsplash.com/3U2V5WqK1PQ",
    name: "Premium Subscription",
    price: 5,
    quantity: 1,
    id: "premium_subscription",
  },
];
