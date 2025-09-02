import { logout } from "~/utils/session.server";

export async function action({ request }: { request: Request }) {
  return logout(request);
}

export async function loader({ request }: { request: Request }) {
  return logout(request);
}
