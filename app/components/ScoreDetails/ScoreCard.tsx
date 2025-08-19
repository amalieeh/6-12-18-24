

type ScoreCardProps = {
  name: string;
  score: number;
  maxScore: number;
  onClick?: () => void;
}

const ScoreCard = ({ name, score, maxScore, onClick }: ScoreCardProps) => {
  return (
    <div className="score-card" onClick={onClick}>
      <h3>{name}</h3>
      <p>{score} / {maxScore} poeng</p>
    </div>
  )
}

export default ScoreCard