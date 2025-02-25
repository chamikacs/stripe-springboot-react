import React from "react";

function CartItem(props: CartItemProps) {
  const cancelSubscription = () => {
    fetch(import.meta.env.VITE_SERVER_BASE_URL + "/subscriptions/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscriptionId: props.data.stripeSubscriptionData?.subscriptionId,
      }),
    })
      .then((r) => r.text())
      .then(() => {
        alert("Subscription cancelled successfully.");
        if (props.onCancelled) props.onCancelled();
      })
      .catch((error) => {
        console.error("Error cancelling subscription:", error);
      });
  };

  return (
    <div style={styles.card}>
      {/* Product Image */}
      <img src={props.data.image} alt={props.data.name} style={styles.image} />

      {/* Product Info */}
      <div style={styles.details}>
        <div>
          <h3 style={styles.heading}>{props.data.name}</h3>
          <p style={styles.description}>{props.data.description}</p>
          {props.mode === "checkout" && (
            <p style={styles.quantity}>Quantity: {props.data.quantity}</p>
          )}

          {/* Subscription Details */}
          {props.mode === "subscription" &&
            props.data.stripeSubscriptionData && (
              <div style={styles.subscriptionDetails}>
                <p>
                  Next Payment Date:{" "}
                  {props.data.stripeSubscriptionData.nextPaymentDate}
                </p>
                <p>
                  Subscribed On:{" "}
                  {props.data.stripeSubscriptionData.subscribedOn}
                </p>
                {props.data.stripeSubscriptionData.trialEndsOn && (
                  <p>
                    Free Trial Until:{" "}
                    {props.data.stripeSubscriptionData.trialEndsOn}
                  </p>
                )}
              </div>
            )}
        </div>

        {/* Price & Cancel Button */}
        <div style={styles.footer}>
          <p style={styles.price}>${props.data.price}</p>
          {props.data.stripeSubscriptionData && (
            <button style={styles.button} onClick={cancelSubscription}>
              Cancel Subscription
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ Define CSS styles
const styles: Record<string, React.CSSProperties> = {
  card: {
    display: "flex",
    flexDirection: "row",
    border: "1px solid #ccc",
    borderRadius: "8px",
    overflow: "hidden",
    width: "600px",
    padding: "16px",
    margin: "10px",
    alignItems: "center",
    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
  },
  image: {
    width: "150px",
    height: "150px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  details: {
    marginLeft: "16px",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  heading: {
    fontSize: "20px",
    margin: "0 0 8px 0",
  },
  description: {
    fontSize: "14px",
    color: "#555",
  },
  quantity: {
    fontSize: "14px",
    color: "#333",
    fontWeight: "bold",
  },
  subscriptionDetails: {
    marginTop: "8px",
    fontSize: "14px",
    color: "#444",
  },
  footer: {
    marginTop: "10px",
  },
  price: {
    fontSize: "20px",
    color: "#007BFF",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "red",
    color: "white",
    fontSize: "16px",
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "8px",
  },
};

// ✅ Type Definitions
export interface StripeSubscriptionData {
  subscriptionId: string;
  nextPaymentDate: string;
  subscribedOn: string;
  trialEndsOn?: string;
}

export interface ItemData {
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
  id: string;
  stripeSubscriptionData?: StripeSubscriptionData;
}

export interface ServerSubscriptionsResponseType {
  nextPaymentDate: string;
  subscribedOn: string;
  appProductId: string;
  price: string;
  subscriptionId: string;
}

interface CartItemProps {
  data: ItemData;
  mode: "subscription" | "checkout";
  onCancelled?: () => void;
}

export default CartItem;
