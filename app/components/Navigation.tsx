
import "../styles/navigation.css";

const Navigation = () => {
  return (
    <nav>
        <a
          href="/"
        >
          <h2>Hjem →</h2>
        </a>
        <a href="/dashboard">
          <h2>Ledertavle →</h2>
        </a>
        <a href="/player/ertbert">
          <h2>Profil →</h2>
        </a>
    </nav>
  );
};

export default Navigation;