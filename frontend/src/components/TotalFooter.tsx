import React from "react";

function TotalFooter(props: TotalFooterProps) {
  return (
    <>
      {/* Divider */}
      <hr style={styles.divider} />

      {/* Total Price Section */}
      <div style={styles.hStack}>
        <p style={styles.text}>Total</p>
        <p style={styles.total}>{"$" + props.total}</p>
      </div>

      {/* Conditional Subscription Text */}
      {props.mode === "subscription" && (
        <p style={styles.subText}>(Monthly, starting today)</p>
      )}
      {props.mode === "trial" && (
        <p style={styles.subText}>(Monthly, starting next month)</p>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  divider: {
    borderTop: "1px solid #ccc",
    margin: "10px 0",
  },
  hStack: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "10px 0",
  },
  text: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  total: {
    fontSize: "20px",
    color: "#007BFF",
    fontWeight: "bold",
  },
  subText: {
    fontSize: "12px",
    color: "#666",
  },
};

// TypeScript Interface
interface TotalFooterProps {
  total: number;
  mode: "checkout" | "subscription" | "trial";
}

export default TotalFooter;
