// Leaderboard.tsx
import '../../css/leaderboard.css';
import '../../css/progressBar.css';
import ProgressBar from './ProgressBar';

export interface Player {
  id: number;
  name: string;
  score: number;
  avatar?: string;
}

interface LeaderboardProps {
  players: Player[];
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
    .sort((a, b) => b.score - a.score)

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
                const progressPercentage = getProgressPercentage(player.score);
                const barColor = getRankColor(rank);
              return (
                <div className='progress-item' key={player.id}>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;