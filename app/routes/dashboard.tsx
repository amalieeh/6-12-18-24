import { useLoaderData } from "react-router";
import { getAllPlayers } from "~/models/game.server";
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  const players = getAllPlayers();
  return { players };
}

export default function Dashboard() {
  const { players } = useLoaderData<typeof loader>();
  
  return (
    <div style={{ padding: "20px" }}>
      <h1>Game Tracker Dashboard</h1>
      <h2>Players ({players.length})</h2>
      {players.length > 0 ? (
        <ul>
          {players.map(player => (
            <li key={player.id}>
              {player.name} - Joined: {new Date(player.created_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No players yet. <a href="/add-player">Add a player</a></p>
      )}
      
      <div style={{ marginTop: "20px" }}>
        <a href="/">← Back to Home</a>
      </div>
    </div>
  );
}