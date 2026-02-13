import { apiFetch } from "./client";
import type { LoginResponse } from "../types";

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  // Form-Encoded 형식으로 전송
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });
}
