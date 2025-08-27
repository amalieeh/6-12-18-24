import { useState } from 'react';
import ChangeScoreModal from './ChangeScoreModal';
import ScoreCard from './ScoreCard';

interface ScoreDetailsProps {
  playerName: string;
  scores: number[];
  maxScores: number[];
  categories?: { name: string; unit: string }[]; // Add categories as prop
}

const ScoreDetails = ({ playerName, scores, maxScores, categories }: ScoreDetailsProps) => {
  const [showChangeModalCategory, setShowChangeModalCategory] = useState<string | null>(null);
  
  // Use database categories if provided, otherwise fallback to hardcoded ones
  // TODO: remove ^ ?
  const categoryNames = categories ? categories.map(cat => cat.name) : ["Øl", "Dougnuts", "Censored", "Km løpt"];

  return (
    <>
      {showChangeModalCategory && <ChangeScoreModal playerName={playerName} category={showChangeModalCategory} score={scores[categoryNames.indexOf(showChangeModalCategory)]} maxScore={maxScores[categoryNames.indexOf(showChangeModalCategory)]} onClose={() => setShowChangeModalCategory(null)} />}
      <div className="grid grid-cols-2 gap-4 max-w-3xl">
        {categoryNames.map((category, index) => (
          <ScoreCard
            key={category}
            name={category}
            score={scores[index]}
            maxScore={maxScores[index]}
            onClick={() => setShowChangeModalCategory(category)}
          />
        ))}
      </div>
    </>
  )
}

export default ScoreDetails