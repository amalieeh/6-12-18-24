import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { getAllUsers } from "~/models/game.server";
import '../styles/home.css';
import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
  const users = await getAllUsers();
  return { users };
}

export default function Home() {
  const { users } = useLoaderData<typeof loader>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <div className="home-content">
        <h1>6-12-18-24</h1>
      </div>
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>

        {users.length === 0 && (
          <div style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#856404", marginTop: "0" }}>🎯 Ready to start?</h3>
            <p style={{ color: "#856404", marginBottom: "15px" }}>
              No players yet! Head to the admin panel to create your first player and set up the game.
            </p>
            <a
              href="/admin/create-player"
              style={{
                backgroundColor: "#ffc107",
                color: "#212529",
                padding: "10px 20px",
                textDecoration: "none",
                borderRadius: "5px",
                fontWeight: "bold"
              }}
            >
              Create First Player
            </a>
          </div>
        )}
      </div></>
  );
}