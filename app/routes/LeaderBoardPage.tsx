import LeaderBoard from "../components/LeaderBoard/LeaderBoard";
import "../css/leaderboard.css";

  const LeaderBoardPage = () => {
    const players = [
    {
      id: 1,
      name: "Alex Johnson",
      score: 15420,
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      id: 2,
      name: "Sarah Chen",
      score: 14890,
      avatar: "https://i.pravatar.cc/150?img=2"
    },
    {
      id: 3,
      name: "Mike Rodriguez",
      score: 13750,
      avatar: "https://i.pravatar.cc/150?img=3"
    },
    {
      id: 4,
      name: "Emma Wilson",
      score: 12300,
      avatar: "https://i.pravatar.cc/150?img=4"
    },
    {
      id: 5,
      name: "David Kim",
      score: 11800
    },
    {
      id: 6,
      name: "Lisa Thompson",
      score: 10500,
      avatar: "https://i.pravatar.cc/150?img=5"
    }
  ];
    return (
      <>
        <h1>Ledertavle</h1>
        <LeaderBoard players={players} />
      </>
    );
  };

  export default LeaderBoardPage;
