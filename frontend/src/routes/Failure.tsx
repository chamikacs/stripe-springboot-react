import React from "react"
import { useNavigate } from "react-router-dom"

function Failure() {
  const queryParams = new URLSearchParams(window.location.search)
  const navigate = useNavigate()

  const onButtonClick = () => {
    navigate("/")
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>Failure!</h1>
        <p style={styles.text}>{queryParams.toString().split("&").join("\n")}</p>
        <button style={styles.button} onClick={onButtonClick}>Try Again</button>
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
    color: "red",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    textAlign: "center",
  },
  heading: {
    fontSize: "32px",
  },
  text: {
    color: "black",
    whiteSpace: "pre-line",
  },
  button: {
    backgroundColor: "red",
    color: "white",
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
}

export default Failure
