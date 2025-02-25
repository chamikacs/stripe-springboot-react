import { useNavigate } from "react-router-dom";

function Home() {
  console.log("Home");

  const navigate = useNavigate();

  const navigateToIntegratedCheckout = () => {
    navigate("/integrated-checkout");
  };

  const navigateToHostedCheckout = () => {
    navigate("/hosted-checkout");
  };

  const navigateToNewSubscription = () => {
    navigate("/new-subscription");
  };

  const navigateToCancelSubscription = () => {
    navigate("/cancel-subscription");
  };

  const navigateToSubscriptionWithTrial = () => {
    navigate("/subscription-with-trial");
  };

  const navigateToViewInvoices = () => {
    navigate("/view-invoices");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        color: "black",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          textAlign: "center",
        }}
      >
        <h1>Stripe Payments With React & Java</h1>
        <button
          style={{ backgroundColor: "teal", color: "white", padding: "0.5rem" }}
          onClick={navigateToIntegratedCheckout}
        >
          Integrated Checkout
        </button>
        <button
          style={{ backgroundColor: "blue", color: "white", padding: "0.5rem" }}
          onClick={navigateToHostedCheckout}
        >
          Hosted Checkout
        </button>
        <button
          style={{
            backgroundColor: "yellow",
            color: "black",
            padding: "0.5rem",
          }}
          onClick={navigateToNewSubscription}
        >
          New Subscription
        </button>
        <button
          style={{
            backgroundColor: "purple",
            color: "white",
            padding: "0.5rem",
          }}
          onClick={navigateToCancelSubscription}
        >
          Cancel Subscription
        </button>
        <button
          style={{
            backgroundColor: "#3b5998",
            color: "white",
            padding: "0.5rem",
          }}
          onClick={navigateToSubscriptionWithTrial}
        >
          Subscription With Trial
        </button>
        <button
          style={{ backgroundColor: "pink", color: "white", padding: "0.5rem" }}
          onClick={navigateToViewInvoices}
        >
          View Invoices
        </button>
      </div>
    </div>
  );
}

export default Home;
