import { useLoaderData } from "react-router";
import ProgressBar from "~/components/LeaderBoard/ProgressBar";
import { getAllCategories, getSummaryPlayers } from "~/models/game.server";
import '../styles/leaderboard.css';
import '../styles/progressBar.css';
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  
  const categories = getAllCategories();

  const players = getSummaryPlayers();

  return { categories, players };
}

export default function Dashboard() {
  const { players } = useLoaderData<typeof loader>();
  const sortedPlayers = [...players].sort((a, b) => b.completion_score - a.completion_score);

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return '#ffd700'; // Gold
      case 2: return '#d1d1d1ff'; // Silver  
      case 3: return '#e17e1aff'; // Bronze
      default: return 'aqua'; // Default color
    }
  };


  return (
    <div>
      <h1>Tester funksjon</h1>
      <h2 className="mb-12">Players ({sortedPlayers.length})</h2>
      <div className="flex flex-col gap-2 w-full">
      {sortedPlayers.length > 0 ? (
        sortedPlayers.map((player, index) => {
          const rank = index + 1;
          const barColor = getRankColor(rank);
  console.log(`Checking progress: ${player.completion_percentage}% : ${player.completion_score} / ${player.max_completion_score}`);
          return (
          <div key={player.id} className="grid grid-cols-8 gap-3">

                  <span className="rank-badge col-span-1" style={{ backgroundColor: barColor }}>
                    {rank === 1 && <div className="rank-shine" />}
                    #{rank}
                  </span>
            <span className="grid col-span-7" style={{ color: barColor }}>
              <ProgressBar key={player.id} progressPercentage={player.completion_percentage} barColor={getRankColor(0)} barText={player.name} />
            </span>
          </div>
        );
      })
      ) : (
        <p>No players yet. <a href="/add-player">Add a player</a></p>
      )}
      </div>
    </div>
  );
}