import { apiFetch } from "./client";
import type { PensResponse, PenDetail } from "../types";

// 돈사 목록 조회 (대시보드)
export async function getPens(token: string): Promise<PensResponse> {
  return apiFetch<PensResponse>("/pens", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// 돈사 상세 조회 (그래프 초기 데이터)
export async function getPenDetail(
  token: string,
  penId: number,
): Promise<PenDetail> {
  return apiFetch<PenDetail>(`/pens/${penId}/detail`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
