import { useLoaderData } from "react-router";
import { addProgress, getAllCategories, getAllProgresses, getPlayer, getPlayerStatuses } from "~/models/game.server";
import ProgressBar from '../components/LeaderBoard/ProgressBar';
import ScoreDetails from '../components/ScoreDetails/ScoreDetails';
import type { Route } from "./+types/player.$playerName";

export async function loader({ params }: Route.LoaderArgs) {
  const playerName = params.playerName;
  if (!playerName) throw new Response("Player name required", { status: 400 });
  
  const player = getPlayer(playerName);
  if (!player) throw new Response("Player not found", { status: 404 });
  
  const categories = getAllCategories();
  const existingCommitments = getPlayerStatuses(playerName);
  const playerProgress = getAllProgresses();

  return { player, categories, existingCommitments, playerProgress };
}

export async function action({ params, request }: Route.ActionArgs) {
  const playerName = params.playerName;
  if (!playerName) throw new Response("Player name required", { status: 400 });
  
  const formData = await request.formData();
  const category = formData.get("category") as string;
  const amount = parseInt(formData.get("amount") as string);
  
  if (!category || isNaN(amount)) {
    throw new Response("Invalid category or amount", { status: 400 });
  }
  
  try {
    addProgress(playerName, category, amount);
    return { success: true };
  } catch (error: any) {
    throw new Response(error.message, { status: 400 });
  }
}

const ProfilePage = () => {
  const { player, categories, existingCommitments, playerProgress } = useLoaderData<typeof loader>();
  
  // Calculate scores from real data instead of mock data
  const scores = existingCommitments.map(commit => commit.current_progress);
  const maxScores = existingCommitments.map(commit => commit.target_amount);
  const totalMaxScore = maxScores.reduce((acc, score) => acc + score, 0);
  const totalScore = scores.reduce((acc, score) => acc + score, 0);

  return (
    <div style={{ marginBottom: '8rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className='mb-24'>
        <p>Hei</p>
        <p>{JSON.stringify(playerProgress)}</p>
        {/* {playerProgress.map(progress => <p key={progress.category_name}>{progress.category_name}: {progress.amount}/{progress.unit}</p>)} */}
      </div>
      <p>{player.name}'s Profile, {player.id}</p>
      <p>{categories.map(cat => cat.name).join(", ")} — {existingCommitments.length} commitments</p>
      {existingCommitments.map(commit => <p key={commit.category_name}>kategori {commit.category_name} | prosent {commit.completion_percentage} | current progress {commit.current_progress} | target amount {commit.target_amount}</p>)}
      <h1>{player.name}'s Profile</h1>
      <ProgressBar progressPercentage={(totalScore / totalMaxScore) * 100} barColor='aqua' barText={`${totalScore} / ${totalMaxScore}`} />
      <ScoreDetails playerName={player.name} scores={scores} maxScores={maxScores} categories={categories} />
    </div>
  );
};

export default ProfilePage;