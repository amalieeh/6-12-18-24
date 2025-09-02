// Leaderboard.tsx
import type { UserSummary } from '~/models/game.server';
import '../../styles/leaderboard.css';
import '../../styles/progressBar.css';
import ProgressBar from './ProgressBar';


interface LeaderboardProps {
  players: UserSummary[];
  title?: string;
  maxEntries?: number;
  maxScore?: number;
}

const Leaderboard = ({
  players,
  title = "Leaderboard",
  maxScore = 16000
}: LeaderboardProps) => {
  // Sort players by score in descending order and limit entries
  const sortedPlayers = [...players]
    .sort((a, b) => b.completion_score - a.completion_score);

  const getProgressPercentage = (score: number): number => {
    if (maxScore === 0) return 0;
    return (score / maxScore) * 100;
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return '#ffd700'; // Gold
      case 2: return '#d1d1d1ff'; // Silver  
      case 3: return '#e17e1aff'; // Bronze
      default: return 'aqua'; // Default color
    }
  };


  return (
    <div className="leaderboard">
      <div>
        {sortedPlayers.length === 0 ? (
          <div className="empty-state">
            <p>No players yet</p>
          </div>
        ) : (
          <div className="progress-items">
            {sortedPlayers.map((player, index) => {
              const rank = index + 1;
              const progressPercentage = getProgressPercentage(player.completion_score);
              const barColor = getRankColor(rank);
              return (
                <div className='' key={player.id}>
                  <p>{player.name}</p>
                  <div className='progress-item'>
                    <span className="rank-badge" style={{ backgroundColor: barColor }}>
                      {rank === 1 && <div className="rank-shine" />}
                      #{rank}
                    </span>
                    <ProgressBar
                      key={player.id}
                      progressPercentage={progressPercentage}
                      barColor={'aqua'}
                      barText={player.name}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;