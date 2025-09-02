import { useRouteLoaderData } from "react-router";
import "../styles/navigation.css";


const Navigation = () => {
  const rootData = useRouteLoaderData("root") as { user?: { name: string; role: string; id?: number } } | undefined;
  const user = rootData?.user;

  return (
    <nav>
      <a href="/">
        <h2>Hjem →</h2>
      </a>
      <a href="/dashboard">
        <h2>Ledertavle →</h2>
      </a>

      {user ? (
        <>
          {user.id && (
            <a href={`/player/${user.name}`}>
              <h2>Min Profil →</h2>
            </a>
          )}
          {user.role === 'admin' && (
            <a href="/admin">
              <h2>Admin →</h2>
            </a>
          )}
          <a href="/logout">
            <h2>Logg ut →</h2>
          </a>
        </>
      ) : (
        <a href="/login">
          <h2>Logg inn →</h2>
        </a>
      )}
    </nav>
  );
};

export default Navigation;