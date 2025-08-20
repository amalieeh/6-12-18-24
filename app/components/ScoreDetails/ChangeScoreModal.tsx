import { useEffect } from "react";
import { useFetcher } from "react-router";
import '../../styles/scoreModal.css';

type ChangeScoreModalProps = {
  playerName: string;
  category: string;
  score: number;
  maxScore: number;
  onClose: () => void;
}

// TODO: Should not be able to add more than max number of points to category
const ChangeScoreModal = ({ playerName, category, score, maxScore, onClose }: ChangeScoreModalProps) => {
  const fetcher = useFetcher();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleAddPoints = (playerName: string, category: string, points: number) => {
    console.log(`Adding ${points} points to ${category}`);
    
    // Use fetcher to submit the form data to the action
    fetcher.submit(
      { category, amount: points.toString() },
      { method: "post" }
    );
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
          <h2 className="modal-title">Endre score</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div key={category} className="score-field">
            <label className="score-label">{category}: {score}/{maxScore}</label>
            <div className="score-input-wrapper">
              <button 
                className="btn btn-add" 
                onClick={() => handleAddPoints(playerName, category, 1)}
                disabled={fetcher.state === "submitting"}
              >
                + 1
              </button>
              <button 
                className="btn btn-add" 
                onClick={() => handleAddPoints(playerName, category, 5)}
                disabled={fetcher.state === "submitting"}
              >
                + 5
              </button>
              <br />
              <button 
                className="btn btn-remove" 
                onClick={() => handleAddPoints(playerName, category, -1)}
                disabled={fetcher.state === "submitting"}
              >
                - 1
              </button>
              <button 
                className="btn btn-remove" 
                onClick={() => handleAddPoints(playerName, category, -5)}
                disabled={fetcher.state === "submitting"}
              >
                - 5
              </button>
            </div>
            {fetcher.state === "submitting" && <p>Updating...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeScoreModal;