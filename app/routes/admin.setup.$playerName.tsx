import { Form, redirect, useActionData, useLoaderData } from "react-router";
import { getAllCategories, getPlayer, getPlayerCommitments, setPlayerCommitment } from "~/models/game.server";
import type { Route } from "./+types/admin.setup.$playerName";

export async function loader({ params }: Route.LoaderArgs) {
  const playerName = params.playerName;
  if (!playerName) throw new Response("Player name required", { status: 400 });
  
  const player = getPlayer(playerName);
  if (!player) throw new Response("Player not found", { status: 404 });
  
  const categories = getAllCategories();
  const existingCommitments = getPlayerCommitments(playerName);
  
  return { player, categories, existingCommitments };
}

export async function action({ request, params }: Route.ActionArgs) {
  const playerName = params.playerName;
  if (!playerName) return { error: "Player name required" };
  
  const formData = await request.formData();
  
  try {
    // Get all category commitments from the form
    const categories = getAllCategories();
    let hasCommitments = false;
    
    for (const category of categories) {
      const amount = formData.get(`${category.name}_amount`);
      if (amount && parseInt(amount as string) > 0) {
        setPlayerCommitment(playerName, category.name, parseInt(amount as string));
        hasCommitments = true;
      }
    }
    
    if (!hasCommitments) {
      return { error: "Please set at least one commitment" };
    }
    
    return redirect(`/admin`);
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function SetupPlayer() {
  const { player, categories, existingCommitments } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  // Create a map of existing commitments for easy lookup
  const commitmentMap = existingCommitments.reduce((map, commitment) => {
    map[commitment.category_name] = commitment.target_amount;
    return map;
  }, {} as Record<string, number>);
  
  const amounts = [6, 12, 18, 24];
  
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🎯 Setup Game for {player.name}</h1>
      
      <div style={{ 
        backgroundColor: "#e7f3ff", 
        padding: "15px", 
        borderRadius: "5px", 
        marginBottom: "30px",
        border: "1px solid #b3d7ff"
      }}>
        <h3 style={{ marginTop: "0", color: "#0056b3" }}>🎮 Game Rules</h3>
        <p style={{ color: "#0056b3", margin: "0" }}>
          Each player must choose to do each category either <strong>6, 12, 18, or 24 times</strong>. 
          They can assign any amount to any category, but each category needs a number.
        </p>
      </div>
      
      <Form method="post">
        <div style={{ display: "grid", gap: "25px" }}>
          {categories.map(category => (
            <div key={category.id} style={{ 
              border: "1px solid #ddd", 
              padding: "20px", 
              borderRadius: "8px",
              backgroundColor: "#fafafa"
            }}>
              <h3 style={{ 
                marginTop: "0", 
                marginBottom: "15px",
                color: "#333"
              }}>
                {category.name} ({category.unit})
              </h3>
              
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {amounts.map(amount => (
                  <label key={amount} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 15px",
                    border: "2px solid #ddd",
                    borderRadius: "5px",
                    cursor: "pointer",
                    backgroundColor: "white",
                    minWidth: "80px"
                  }}>
                    <input
                      type="radio"
                      name={`${category.name}_amount`}
                      value={amount}
                      defaultChecked={commitmentMap[category.name] === amount}
                      style={{ margin: "0" }}
                    />
                    <span style={{ fontWeight: "bold" }}>{amount}</span>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      {category.unit}
                    </span>
                  </label>
                ))}
              </div>
              
              {commitmentMap[category.name] && (
                <div style={{ 
                  marginTop: "10px", 
                  fontSize: "12px", 
                  color: "#28a745",
                  fontWeight: "bold"
                }}>
                  ✅ Currently set to: {commitmentMap[category.name]} {category.unit}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {actionData?.error && (
          <div style={{ 
            backgroundColor: "#f8d7da", 
            color: "#721c24", 
            padding: "15px", 
            borderRadius: "5px", 
            marginTop: "20px",
            border: "1px solid #f5c6cb"
          }}>
            ❌ {actionData.error}
          </div>
        )}
        
        <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "15px 30px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            {existingCommitments.length > 0 ? "Update" : "Save"} Commitments
          </button>
          
          <a
            href="/admin"
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              padding: "15px 30px",
              textDecoration: "none",
              borderRadius: "5px",
              display: "inline-block"
            }}
          >
            Back to Admin
          </a>
          
          {existingCommitments.length > 0 && (
            <a
              href={`/player/${player.name}`}
              style={{
                backgroundColor: "#17a2b8",
                color: "white",
                padding: "15px 30px",
                textDecoration: "none",
                borderRadius: "5px",
                display: "inline-block"
              }}
            >
              View {player.name}'s Profile
            </a>
          )}
        </div>
      </Form>
    </div>
  );
}