import { Form, redirect, useActionData } from "react-router";
import { createSession, createUser } from "~/models/auth.server";
import { createSessionCookie, getUserFromRequest } from "~/utils/session.server";

export async function loader({ request }: { request: Request }) {
  // If user is already logged in, redirect to home
  const user = await getUserFromRequest(request);
  if (user) {
    return redirect("/");
  }

  return {};
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const role = formData.get("role") as string;
  const name = formData.get("name") as string;

  if (!username || !password || !confirmPassword || !role || !name) {
    return { error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  if (!["player", "admin"].includes(role)) {
    return { error: "Invalid role selected" };
  }

  try {
    const user = createUser(username, password, name, role as "player" | "admin");

    // Create session and log them in
    const session = createSession(user.id);

    return redirect("/", {
      headers: {
        "Set-Cookie": createSessionCookie(session.id),
      },
    });
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function Register() {
  const actionData = useActionData<typeof action>();

  return (
    <div style={{
      maxWidth: "400px",
      margin: "2rem auto",
      padding: "2rem",
      border: "1px solid #ddd",
      borderRadius: "8px",
      marginBottom: "8rem"
    }} className="text-brand-text">
      <h1>Register</h1>

      <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "0.25rem"
            }}
          />
        </div>

        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "0.25rem"
            }}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "0.25rem"
            }}
          />
        </div>

        <div>
          <label htmlFor="name">Display Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "0.25rem"
            }}
          />
        </div>

        <div>
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "0.25rem"
            }}
          >
            <option value="">Select role...</option>
            <option value="player">Player</option>
            {/* <option value="admin">Admin</option> */}
          </select>
        </div>

        {actionData?.error && (
          <div style={{ color: "red", fontSize: "0.9rem" }}>
            {actionData.error}
          </div>
        )}

        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "0.75rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem"
          }}
        >
          Register
        </button>
      </Form>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <a href="/login" style={{ color: "#007bff", textDecoration: "none" }}>
          Already have an account? Login here
        </a>
      </div>
    </div>
  );
}
