import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("admin", "routes/admin.tsx"),
  route("admin/create-player", "routes/admin.create-player.tsx"),
  route("admin/setup/:playerName", "routes/admin.setup.$playerName.tsx"),
  // route("admin/add-progress", "routes/admin.add-progress.tsx"),
  route("player/:playerName", "routes/player.$playerName.tsx"),
] satisfies RouteConfig;