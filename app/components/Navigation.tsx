import { Link } from "react-router-dom";

import "../css/navigation.css";

const Navigation = () => {
  return (
    <nav>
      <Link to="/">Hjem →</Link>
      <Link to="/leaderboard">Ledertavle →</Link>
      <Link to="/profile">Profil →</Link>
    </nav>
  );
};

export default Navigation;