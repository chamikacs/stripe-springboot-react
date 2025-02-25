import React, { useState } from "react"
import CartItem, { ItemData, ServerSubscriptionsResponseType } from "../components/CartItem.tsx"
import { Subscriptions } from "../data.ts"

function CancelSubscription() {
  const [email, setEmail] = useState("")
  const [subscriptions, setSubscriptions] = useState<ItemData[]>([])

  const onCustomerEmailChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(ev.target.value)
  }

  const listSubscriptions = () => {
    fetch(import.meta.env.VITE_SERVER_BASE_URL + "/subscriptions/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerEmail: email,
      }),
    })
      .then((r) => r.json())
      .then((r: ServerSubscriptionsResponseType[]) => {
        const subscriptionsList: ItemData[] = []

        r.forEach((subscriptionItem) => {
          let subscriptionDetails = Subscriptions.find((elem) => elem.id === subscriptionItem.appProductId) || undefined

          if (subscriptionDetails) {
            subscriptionDetails = {
              ...subscriptionDetails,
              price: Number.parseInt(subscriptionItem.price) / 100,
              stripeSubscriptionData: subscriptionItem,
            }

            subscriptionsList.push(subscriptionDetails)
          } else {
            console.log("Item not found!")
          }
        })

        setSubscriptions(subscriptionsList)
      })
  }

  const removeSubscription = (id: string | undefined) => {
    const newSubscriptionsList = subscriptions.filter((elem) => elem.stripeSubscriptionData?.subscriptionId !== id)
    setSubscriptions(newSubscriptionsList)
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>Cancel Subscription Example</h1>
        {subscriptions.length === 0 ? (
          <>
            <input type="email" placeholder="Customer Email" onChange={onCustomerEmailChange} value={email} style={styles.input} />
            <button onClick={listSubscriptions} style={styles.button}>
              List Subscriptions
            </button>
          </>
        ) : null}
        {subscriptions.map((elem) => (
          <CartItem key={elem.id} data={elem} mode={"subscription"} onCancelled={() => removeSubscription(elem.stripeSubscriptionData?.subscriptionId)} />
        ))}
      </div>
    </div>
  )
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
    gap: "16px",
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
}

export default CancelSubscription
