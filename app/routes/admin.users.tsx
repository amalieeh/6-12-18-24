import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { createUser, getAllUsers } from "~/models/auth.server";
import { requireAdmin } from "~/utils/session.server";

export async function loader({ request }: { request: Request }) {
  await requireAdmin(request);

  const users = await getAllUsers();

  return { users };
}

export async function action({ request }: { request: Request }) {
  await requireAdmin(request);

  const formData = await request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const name = formData.get("name") as string;

  if (!username || !password || !role || !name) {
    return { error: "Username, password, role, and name are required" };
  }

  if (!["player", "admin"].includes(role)) {
    return { error: "Invalid role selected" };
  }

  try {
    await createUser(username, password, name, role as "player" | "admin");
    return { success: "User created successfully" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function AdminUsers() {
  const { users } = useLoaderData<typeof loader>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", marginBottom: "8rem" }}>
      <h1>Users</h1>

      <h2>Existing Users ({users.length})</h2>

      {users.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {users.map(user => (
            <div key={user.id} style={{
              border: "1px solid #eee",
              padding: "15px",
              borderRadius: "5px",
            }} className="text-brand-text">
              <a href={`/player/${user.username}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: "0 0 5px 0" }}>{user.name}</h4>
                  <p style={{ margin: "0", color: "#bbb", fontSize: "14px" }}>
                    <strong>Username:</strong> {user.username} | <strong>Role:</strong> {user.role}
                  </p>
                  <p style={{ margin: "5px 0 0 0", color: "#bbb", fontSize: "12px" }}>
                    Created: {isClient ? new Date(user.created_at).toLocaleDateString() : new Date(user.created_at).toISOString().split('T')[0]}
                  </p>
                </div>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#666", fontStyle: "italic" }}>No users found.</p>
      )}
    </div>

  );
}
