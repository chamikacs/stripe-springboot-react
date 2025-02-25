import React, { useEffect, useState } from "react";
import CartItem, { ItemData } from "../components/CartItem.tsx";
import TotalFooter from "../components/TotalFooter.tsx";
import { Products } from "../data.ts";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";

function IntegratedCheckout() {
  const [items] = useState<ItemData[]>(Products);
  const [transactionClientSecret, setTransactionClientSecret] = useState("");
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setStripePromise(loadStripe(import.meta.env.VITE_STRIPE_API_KEY || ""));
  }, []);

  const createTransactionSecret = () => {
    fetch(import.meta.env.VITE_SERVER_BASE_URL + "/checkout/integrated", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((elem) => ({ name: elem.name, id: elem.id })),
        customerName: name,
        customerEmail: email,
      }),
    })
      .then((r) => r.text())
      .then((r) => {
        setTransactionClientSecret(r);
      });
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>Integrated Checkout Example</h1>

        {items.map((elem) => (
          <CartItem key={elem.id} data={elem} mode={"checkout"} />
        ))}

        <TotalFooter total={30} mode={"checkout"} />

        <input
          type="text"
          placeholder="Customer Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Customer Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          style={styles.input}
        />
        <button onClick={createTransactionSecret} style={styles.button}>
          Initiate Payment
        </button>

        {transactionClientSecret !== "" && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: transactionClientSecret }}
          >
            <CheckoutForm />
          </Elements>
        )}
      </div>
    </div>
  );
}

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: import.meta.env.VITE_CLIENT_BASE_URL + "/success",
      },
    });

    if (result.error) {
      console.log(result.error.message);
    }
  };

  return (
    <div style={styles.checkoutContainer}>
      <PaymentElement />
      <button style={styles.button} disabled={!stripe} onClick={handleSubmit}>
        Pay
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    color: "black",
    backgroundColor: "#f8f8f8",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "600px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    alignItems: "center",
  },
  heading: {
    fontSize: "24px",
    textAlign: "center",
    marginBottom: "10px",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  button: {
    backgroundColor: "green",
    color: "white",
    fontSize: "18px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },
  checkoutContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
    width: "100%",
  },
};

export default IntegratedCheckout;
