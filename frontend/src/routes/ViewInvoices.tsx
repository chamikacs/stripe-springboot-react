import React, { useState } from "react"

function ViewInvoices() {
  const [email, setEmail] = useState("")
  const [invoices, setInvoices] = useState<InvoiceData[]>([])

  const onCustomerEmailChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(ev.target.value)
  }

  const listInvoices = () => {
    fetch(import.meta.env.VITE_SERVER_BASE_URL + "/invoices/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerEmail: email,
      }),
    })
      .then((r) => r.json())
      .then((r: InvoiceData[]) => {
        setInvoices(r)
      })
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>View Invoices for Customer</h1>

        {invoices.length === 0 ? (
          <>
            <input type="email" placeholder="Customer Email" onChange={onCustomerEmailChange} value={email} style={styles.input} />
            <button onClick={listInvoices} style={styles.button}>
              Look up Invoices
            </button>
          </>
        ) : null}

        {invoices.map((invoice) => (
          <div key={invoice.number} style={styles.invoiceCard}>
            <p style={styles.invoiceNumber}>{invoice.number}</p>
            <div style={styles.invoiceActions}>
              <p style={styles.amount}>${invoice.amount}</p>
              <button onClick={() => window.location.href = invoice.url} style={styles.downloadButton}>
                ⬇ Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Define CSS styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
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
    fontSize: "16px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },
  invoiceCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "500px",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
  },
  invoiceNumber: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  invoiceActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  amount: {
    fontSize: "18px",
    color: "#007BFF",
    fontWeight: "bold",
  },
  downloadButton: {
    backgroundColor: "#007BFF",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
}

// Type Definitions
interface InvoiceData {
  number: string
  amount: string
  url: string
}

export default ViewInvoices
