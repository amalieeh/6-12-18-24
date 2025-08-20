import '../../styles/progressBar.css';

interface ProgressBarProps {
  progressPercentage: number;
  barColor: string;
  barText?: string;
}

const ProgressBar = ({ progressPercentage, barColor, barText }: ProgressBarProps) => {
  return (
    <div className="progress-bar-container">
      <div className="progress-background">
        <div 
          className="progress-bar"
          style={{ 
            width: `${progressPercentage}%`,
            backgroundColor: barColor
          }}
        >
          <div className="progress-shine" />
          {barText && (
            <span className="progress-bar-text">{barText}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;