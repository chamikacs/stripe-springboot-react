import React, { useState } from "react";
import CartItem, { ItemData } from "../components/CartItem.tsx";
import TotalFooter from "../components/TotalFooter.tsx";
import CustomerDetails from "../components/CustomerDetails.tsx";
import { Subscriptions } from "../data.ts";

function SubscriptionWithTrial() {
  const [items] = useState<ItemData[]>(Subscriptions);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>New Subscription Example</h1>
        {items.map((elem) => (
          <CartItem key={elem.id} data={elem} mode={"subscription"} />
        ))}
        <TotalFooter total={5} mode={"subscription"} />
        <CustomerDetails data={items} endpoint={"/subscriptions/trial"} />
      </div>
    </div>
  );
}

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
};

export default SubscriptionWithTrial;
