import React, { useState } from "react";
import CartItem, { ItemData } from "../components/CartItem.tsx";
import TotalFooter from "../components/TotalFooter.tsx";
import CustomerDetails from "../components/CustomerDetails.tsx";
import { Products } from "../data.ts";

function HostedCheckout() {
  const [items] = useState<ItemData[]>(Products);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>Hosted Checkout Example</h1>

        {/* Cart Items */}
        {items.map((elem) => (
          <CartItem key={elem.id} data={elem} mode={"checkout"} />
        ))}

        {/* Total Footer */}
        <TotalFooter total={30} mode={"checkout"} />

        {/* Customer Details Form */}
        <CustomerDetails data={items} endpoint={"/checkout/hosted"} />
      </div>
    </div>
  );
}

// ✅ Define styles using CSSProperties
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    color: "black",
    backgroundColor: "#f8f8f8",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "600px", // Equivalent to 'xl' in Chakra
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    fontSize: "24px",
    textAlign: "center",
    marginBottom: "10px",
  },
};

export default HostedCheckout;
