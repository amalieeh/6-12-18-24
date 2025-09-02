export default function Unauthorized() {
  return (
    <div style={{
      maxWidth: "400px",
      margin: "2rem auto",
      padding: "2rem",
      textAlign: "center",
      marginBottom: "8rem"
    }}>
      <h1>🚫 Unauthorized</h1>
      <p>You don't have permission to access this page.</p>
      <div style={{ marginTop: "2rem" }}>
        <a href="/" style={{ color: "#007bff", textDecoration: "none" }}>
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
