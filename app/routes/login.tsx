import { Form, redirect, useActionData } from "react-router";
import { authenticateUser, createSession } from "~/models/auth.server";
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

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const user = await authenticateUser(username, password);

  if (!user) {
    return { error: "Invalid username or password" };
  }

  // Create session
  const session = await createSession(user.id);

  // Redirect with session cookie
  return redirect("/", {
    headers: {
      "Set-Cookie": createSessionCookie(session.id),
    },
  });
}

export default function Login() {
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
      <h1>Login</h1>

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
          Login
        </button>
      </Form>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <a href="/register" style={{ color: "#007bff", textDecoration: "none" }}>
          Don't have an account? Register here
        </a>
      </div>
    </div>
  );
}
