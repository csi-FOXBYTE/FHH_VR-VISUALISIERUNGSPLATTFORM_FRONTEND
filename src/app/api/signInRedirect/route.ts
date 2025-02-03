import { signIn } from "@/server/auth/auth";

export function GET() {
    return signIn("keycloak");
}