import { useState } from 'react';
import '../../css/scoreDetails.css';
import ChangeScoreModal from './ChangeScoreModal';
import ScoreCard from './ScoreCard';

interface ScoreDetailsProps {
  scores: number[];
  maxScores: number[];
  setScores: (newScores: number[]) => void;
}

const ScoreDetails = ({ scores, maxScores, setScores }: ScoreDetailsProps) => {
  const [showChangeModal, setShowChangeModal] = useState(false);
  const categories = ["Øl", "Dougnuts", "Censored", "Km løpt"]

  return (
    <>
      {showChangeModal && <ChangeScoreModal onClose={() => setShowChangeModal(false)} onSave={setScores} currentScores={scores} />}
      <div className="score-trackers">
        {categories.map((category, index) => (
          <ScoreCard
            key={category}
            name={category}
            score={scores[index]}
            maxScore={maxScores[index]}
            onClick={() => setShowChangeModal(true)}
          />
        ))}
      </div>
    </>
  )
}

export default ScoreDetails