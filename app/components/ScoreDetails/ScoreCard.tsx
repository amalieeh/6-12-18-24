type ScoreCardProps = {
  name: string;
  score: number;
  maxScore: number;
  onClick?: () => void;
}

const ScoreCard = ({ name, score, maxScore, onClick }: ScoreCardProps) => {
  const percentage = Math.max(0, Math.min(100, (score / maxScore) * 100));

  return (
    // TODO: brand colors
    <div
      className="min-w-0 rounded-lg p-4 border-2 border-test cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg active:from-gray-700 active:to-gray-800 active:scale-98 transition-all duration-150"
      onClick={onClick}
    >
      <h3 className="text-brand-header font-bold text-lg mb-2">{name}</h3>
      <p className="text-brand-text text-lg font-semibold">{score} / {maxScore} poeng</p>
      <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
        <div
          className="bg-main h-3"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={maxScore}
          aria-label={`${percentage.toFixed(0)}%`}
        />
      </div>

      <div className="mt-2 text-right">
        <span className="text-brand-text text-sm">Endre poeng →</span>
      </div>
    </div>
  );
};

export default ScoreCard;
