import { Form, redirect, useActionData } from "react-router";
import { createPlayer } from "~/models/game.server";
import type { Route } from "./+types/admin.create-player";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const playerName = formData.get("playerName") as string;
  
  if (!playerName || playerName.trim().length === 0) {
    return { error: "Player name is required" };
  }
  
  try {
    createPlayer(playerName.trim());
    return redirect(`/admin/setup/${encodeURIComponent(playerName.trim())}`);
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function CreatePlayer() {
  const actionData = useActionData<typeof action>();
  
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>👤 Create New Player</h1>
      
      <Form method="post" style={{ marginTop: "30px" }}>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="playerName" style={{ 
            display: "block", 
            marginBottom: "5px", 
            fontWeight: "bold" 
          }}>
            Player Name:
          </label>
          <input
            type="text"
            id="playerName"
            name="playerName"
            placeholder="Enter player name (e.g., Chad, Brad)"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "16px"
            }}
            required
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            This will be used for their profile URL: /player/their-name
          </small>
        </div>
        
        {actionData?.error && (
          <div style={{ 
            backgroundColor: "#f8d7da", 
            color: "#721c24", 
            padding: "10px", 
            borderRadius: "5px", 
            marginBottom: "20px",
            border: "1px solid #f5c6cb"
          }}>
            ❌ {actionData.error}
          </div>
        )}
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            Create Player
          </button>
          
          <a
            href="/admin"
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              padding: "12px 24px",
              textDecoration: "none",
              borderRadius: "5px",
              display: "inline-block"
            }}
          >
            Cancel
          </a>
        </div>
      </Form>
      
      <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "#e9f7ef", borderRadius: "5px" }}>
        <h3 style={{ marginTop: "0", color: "#155724" }}>💡 What happens next?</h3>
        <ol style={{ color: "#155724" }}>
          <li>Player will be created in the database</li>
          <li>You'll be taken to set up their game commitments</li>
          <li>They'll get a shareable link: <code>/player/their-name</code></li>
          <li>You can track their progress from the admin panel</li>
        </ol>
      </div>
    </div>
  );
}