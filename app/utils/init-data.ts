import { createUser, getAllUsers } from "../models/auth.server";

// Initialize default users if they don't exist
export async function initializeDefaultData() {
  try {
    // Create a test admin user
    try {
      await createUser("admin", "admin123", "Admin User", "admin");
      console.log("✅ Default admin user created (username: admin, password: admin123)");
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("ℹ️ Admin user already exists");
      } else {
        console.error("❌ Error creating admin user:", error.message);
      }
    }

    // Create some test players if they don't exist
    const testPlayers = [
      { username: "ertbert", name: "Ertbert", password: "player123" },
      { username: "mzatt", name: "Mzatt", password: "player123" },
      { username: "tinastina", name: "Tinastina", password: "player123" }
    ];

    for (const player of testPlayers) {
      try {
        await createUser(player.username, player.password, player.name, "player");
        console.log(`✅ Test player created: ${player.name} (username: ${player.username}, password: ${player.password})`);
      } catch (error: any) {
        if (error.message.includes("already exists")) {
          console.log(`ℹ️ Player ${player.name} already exists`);
        } else {
          console.error(`❌ Error creating player ${player.name}:`, error.message);
        }
      }
    }

    const users = await getAllUsers();
    console.log(`ℹ️ Total users: ${users.length} (${users.filter(u => u.role === 'admin').length} admin, ${users.filter(u => u.role === 'player').length} players)`);

    console.log("✅ Data initialization complete");
  } catch (error) {
    console.error("❌ Error during data initialization:", error);
    throw error;
  }
}


