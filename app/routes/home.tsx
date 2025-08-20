import { useLoaderData } from "react-router";
import { getAllPlayers } from "~/models/game.server";
import '../styles/home.css';
import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
  const players = getAllPlayers();
  return { players };
}

export default function Home() {
  const { players } = useLoaderData<typeof loader>();
  
  return (
    <>
    <div className="home-content">
      <h1>6-12-18-24</h1>
    </div>
    <hr className="my-8" />
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>🎮 Game Tracker</h1>
      <p style={{ fontSize: "18px", color: "#666", marginBottom: "40px" }}>
        Track your friends' progress in the ultimate challenge game!
      </p>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "20px", 
        marginBottom: "40px" 
      }}>
        <a
          href="/admin"
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "30px",
            textDecoration: "none",
            borderRadius: "10px",
            display: "block",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}
        >
          <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>🛠️ Admin Panel</h2>
          <p style={{ margin: "0", opacity: "0.9" }}>
            Create players, set commitments, track progress
          </p>
        </a>
        
        <a
          href="/dashboard"
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "30px",
            textDecoration: "none",
            borderRadius: "10px",
            display: "block",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}
        >
          <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>📊 Dashboard</h2>
          <p style={{ margin: "0", opacity: "0.9" }}>
            View leaderboards and overall stats
          </p>
        </a>
      </div>
      
      {players.length > 0 && (
        <div style={{ textAlign: "left" }}>
          <h2>👥 Current Players ({players.length})</h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "15px" 
          }}>
            {players.map(player => (
              <a
                key={player.id}
                href={`/player/${player.name}`}
                style={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  padding: "20px",
                  textDecoration: "none",
                  borderRadius: "8px",
                  color: "#333",
                  display: "block",
                  textAlign: "center",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#e9ecef";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
                  {player.name}
                </h3>
                <small style={{ color: "#666" }}>
                  Joined: {new Date(player.created_at).toLocaleDateString()}
                </small>
                <div style={{ 
                  marginTop: "10px", 
                  fontSize: "12px", 
                  color: "#007bff",
                  fontWeight: "bold" 
                }}>
                  View Profile →
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
      
      {players.length === 0 && (
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