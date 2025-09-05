import { useLoaderData } from "react-router";
import ProgressBar from "~/components/LeaderBoard/ProgressBar";
import { getAllCategories, getSummaryUsers } from "~/models/game.server";
import { requireUser } from "~/utils/session.server";
import '../styles/leaderboard.css';
import '../styles/progressBar.css';
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {

  const categories = await getAllCategories();

  const users = await getSummaryUsers();

  const currentUser = await requireUser(request);

  return { categories, users, currentUser };
}

export default function Dashboard() {
  const { users, currentUser } = useLoaderData<typeof loader>();
  const sortedUsers = [...users].sort((a, b) => b.completion_score - a.completion_score);

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
      <h1>Ledertavle</h1>
      <div className="flex flex-col gap-2 w-full">
        {sortedUsers.length > 0 ? (
          sortedUsers.map((user, index) => {
            const rank = index + 1;
            const barColor = getRankColor(rank);
            const isCurrentUser = user.id === currentUser.id;
            return (
              <div key={user.id} className={`flex flex-row gap-4 cursor-pointer ${isCurrentUser ? 'current-user-highlight' : ''}`} onClick={() => window.location.href = `/player/${user.name}`}>
                <span className="rank-badge" style={{ backgroundColor: barColor }}>
                  {rank === 1 && <div className="rank-shine" />}
                  #{rank}
                </span>
                <span className="grid w-full" style={{ color: barColor }}>
                  <ProgressBar key={user.id} progressPercentage={user.completion_percentage} barColor={getRankColor(0)} barText={user.name} />
                </span>
              </div>
            );
          })
        ) : (
          <p>No players yet.</p>
        )}
      </div>
    </div>
  );
}