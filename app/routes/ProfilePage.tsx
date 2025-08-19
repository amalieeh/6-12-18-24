import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProgressBar from '../components/LeaderBoard/ProgressBar';
import ScoreDetails from '../components/ScoreDetails/ScoreDetails';

const ProfilePage = () => {
  // fetch user data based on id
  const { id } = useParams<{ id: string }>();
  const user = user1
  const totalMaxScore = user.maxScore.reduce((acc, score) => acc + score, 0);
  const totalScore = user.scores.reduce((acc, score) => acc + score, 0);
  const [scores, setScores] = useState(user.scores);

  return (
    <div style={{ marginBottom: '8rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>{user.name}'s Profile</h1>
      <ProgressBar progressPercentage={(totalScore / totalMaxScore) * 100} barColor='aqua' barText={`${totalScore} / ${totalMaxScore}`} />
      <ScoreDetails scores={scores} maxScores={user.maxScore} setScores={setScores} />
    </div>
  );
};
export default ProfilePage;

const user1 = {
  id: "1",
  name: "User1",
  scores: [8, 11, 1, 15],
  maxScore: [18, 12, 6, 24],
};