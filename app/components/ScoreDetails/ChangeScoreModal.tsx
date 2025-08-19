import { useEffect, useState } from "react";
import '../../css/scoreModal.css';

type ChangeScoreModalProps = {
  onClose: () => void;
  onSave: (newScores: number[]) => void;
  currentScores: number[];
}
const ChangeScoreModal = ({ onClose, onSave, currentScores }: ChangeScoreModalProps) => {
  const [scores, setScores] = useState(currentScores);
  const categories = ["Øl", "Dougnuts", "Censored", "Km løpt"];
  const maxScores = [18, 12, 6, 24]; // You might want to pass this as a prop

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleScoreChange = (index: number, newScore: string) => {
    const scoreValue = parseInt(newScore) || 0;
    const clampedScore = Math.max(0, Math.min(scoreValue, maxScores[index]));
    
    const newScores = [...scores];
    newScores[index] = clampedScore;
    setScores(newScores);
  };

  const handleSave = () => {
    onSave(scores);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Change Scores</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {categories.map((category, index) => (
            <div key={category} className="score-field">
              <label className="score-label">{category}</label>
              <div className="score-input-wrapper">
                <input
                  type="number"
                  min="0"
                  max={maxScores[index]}
                  value={scores[index]}
                  onChange={(e) => handleScoreChange(index, e.target.value)}
                  className="score-input"
                />
                <span className="score-max">/ {maxScores[index]} poeng</span>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-save" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeScoreModal;