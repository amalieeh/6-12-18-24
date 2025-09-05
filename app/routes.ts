import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("logout", "routes/logout.tsx"),
  route("unauthorized", "routes/unauthorized.tsx"),
  route("admin", "routes/admin.tsx"),
  route("admin/users", "routes/admin.users.tsx"),
  route("player/:username", "routes/player.$username.tsx"),
] satisfies RouteConfig;