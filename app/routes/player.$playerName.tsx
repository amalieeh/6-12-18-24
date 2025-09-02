import { useLoaderData } from "react-router";
import { canEditUser } from "~/models/auth.server";
import { addProgress, getAllCategories, getAllProgresses, getUser, getUserStatuses, setUserCommitments } from "~/models/game.server";
import { getUserFromRequest } from "~/utils/session.server";
import ProgressBar from '../components/LeaderBoard/ProgressBar';
import CommitmentForm from "../components/Player/CommitmentForm";
import ScoreDetails from '../components/ScoreDetails/ScoreDetails';

export async function loader({ params, request }: { params: { playerName: string }; request: Request }) {
  const playerName = params.playerName;
  if (!playerName) throw new Response("Player name required", { status: 400 });

  const user = getUser(playerName);
  if (!user) throw new Response("User not found", { status: 404 });

  const categories = getAllCategories();
  const existingCommitments = getUserStatuses(playerName);
  const userProgress = getAllProgresses();

  // Get current user and check permissions
  const currentUser = await getUserFromRequest(request);
  const canEdit = currentUser ? canEditUser(currentUser, user.id) : false;

  return { user, categories, existingCommitments, userProgress, currentUser, canEdit };
}

export async function action({ params, request }: { params: { playerName: string }; request: Request }) {
  const playerName = params.playerName;
  if (!playerName) throw new Response("Player name required", { status: 400 });

  const user = getUser(playerName);
  if (!user) throw new Response("User not found", { status: 404 });

  // Check permissions
  const currentUser = await getUserFromRequest(request);
  if (!currentUser) {
    throw new Response("Must be logged in", { status: 401 });
  }

  if (!canEditUser(currentUser, user.id)) {
    throw new Response("Not authorized to edit this user's data", { status: 403 });
  }

  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "createCommitments") {
    const categories = getAllCategories();
    const commitments = categories.map(category => {
      const targetAmount = parseInt(formData.get(category.name) as string);
      if (isNaN(targetAmount)) {
        throw new Response(`Invalid amount for ${category.name}`, { status: 400 });
      }
      return { categoryName: category.name, targetAmount };
    });

    try {
      setUserCommitments(playerName, commitments);
      return { success: true };
    } catch (error: any) {
      throw new Response(error.message, { status: 400 });
    }
  }


  const category = formData.get("category") as string;
  const amount = parseInt(formData.get("amount") as string);

  if (!category || isNaN(amount)) {
    throw new Response("Invalid category or amount", { status: 400 });
  }

  try {
    addProgress(playerName, category, amount, currentUser.id);
    return { success: true };
  } catch (error: any) {
    throw new Response(error.message, { status: 400 });
  }
}

const ProfilePage = () => {
  const { user, categories, existingCommitments, userProgress, currentUser, canEdit } = useLoaderData<typeof loader>();

  // Calculate scores from real data instead of mock data
  const scores = existingCommitments.map(commit => commit.current_progress);
  const maxScores = existingCommitments.map(commit => commit.target_amount);
  const totalMaxScore = maxScores.reduce((acc, score) => acc + score, 0);
  const totalScore = scores.reduce((acc, score) => acc + score, 0);

  const hasCommitments = existingCommitments.length > 0;

  return (
    <div style={{ marginBottom: '8rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>{user.name}'s Profile {user.id}</h1>
      {!canEdit && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>👀 Viewing Mode:</strong> You are viewing {user.name}'s profile. You cannot edit their scores.
          {!currentUser && " Please log in to edit your own profile."}
        </div>
      )}

      {hasCommitments ? (
        <>
          <ProgressBar progressPercentage={(totalScore / totalMaxScore) * 100} barColor='aqua' barText={`${totalScore} / ${totalMaxScore}`} />
          <ScoreDetails
            playerName={user.name}
            scores={scores}
            maxScores={maxScores}
            categories={categories}
            canEdit={canEdit}
          />
        </>
      ) : (
        canEdit ? (
          <CommitmentForm categories={categories} playerName={user.name} />
        ) : (
          <p>{user.name} has not set any commitments yet.</p>
        )
      )}
    </div>
  );
};

export default ProfilePage;