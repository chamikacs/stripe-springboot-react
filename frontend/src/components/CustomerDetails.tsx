import React, { useState } from "react";
import { ItemData } from "./CartItem.tsx";

function CustomerDetails(props: CustomerDetailsProp) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const onCustomerNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setName(ev.target.value);
  };

  const onCustomerEmailChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(ev.target.value);
  };

  const initiatePayment = () => {
    fetch(import.meta.env.VITE_SERVER_BASE_URL + props.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: props.data.map((elem) => ({ name: elem.name, id: elem.id })),
        customerName: name,
        customerEmail: email,
        invoiceNeeded: true,
      }),
    })
      .then((r) => r.text())
      .then((r) => {
        window.location.href = r;
      });
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Customer Name"
        onChange={onCustomerNameChange}
        value={name}
        style={styles.input}
      />
      <input
        type="email"
        placeholder="Customer Email"
        onChange={onCustomerEmailChange}
        value={email}
        style={styles.input}
      />
      <button onClick={initiatePayment} style={styles.button}>
        Checkout
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "600px", // Equivalent to 'xl' in Chakra
    margin: "auto",
    padding: "20px",
    alignItems: "center",
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
};

// TypeScript Interface
interface CustomerDetailsProp {
  data: ItemData[];
  endpoint: string;
}

export default CustomerDetails;
