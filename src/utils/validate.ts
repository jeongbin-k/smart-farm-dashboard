import type { PensResponse, Piggery, Pen } from "../types";

// 돈사 목록 데이터 검증 및 수정
export function validatePensData(data: unknown): PensResponse {
  // 1. 기본 구조 체크
  if (!data || typeof data !== "object") {
    throw new Error("잘못된 데이터 구조입니다.");
  }

  // 2. piggeies 배열 체크
  const dataObj = data as Record<string, unknown>;
  if (!Array.isArray(dataObj.piggeies)) {
    return { piggeies: [] };
  }

  // 3. piggery 검증
  const validatedPiggeies: Piggery[] = dataObj.piggeies
    .filter((piggery: unknown) => piggery && typeof piggery === "object")
    .map((piggery: unknown) => {
      const p = piggery as Record<string, unknown>;
      return {
        piggery_id: String(p.piggery_id || ""),
        piggery_name: String(p.piggery_name || "알수없는 농장"),
        total_pigs: Number(p.total_pigs) || 0,
        pens: validatePens(p.pens),
      };
    });

  return { piggeies: validatedPiggeies };
}

// 돈방pen 배열 검증
function validatePens(pens: unknown): Pen[] {
  if (!Array.isArray(pens)) return [];

  return pens
    .filter((pen: unknown) => pen && typeof pen === "object")
    .map((pen: unknown) => {
      const p = pen as Record<string, unknown>;
      return {
        pen_id: String(p.pen_id || ""),
        pen_name: String(p.pen_name || "Unknown Pen"),
        current_pig_count: Number(p.current_pig_count) || 0,
        avg_activity_level: Number(p.avg_activity_level) || 0,
        avg_feeding_time_minutes: Number(p.avg_feeding_time_minutes) || 0,
        avg_temperature_celsius: Number(p.avg_temperature_celsius) || 0,
        abnormal_pigs: Array.isArray(p.abnormal_pigs)
          ? p.abnormal_pigs
              .filter((pig: unknown) => pig && typeof pig === "object")
              .map((pig: unknown) => {
                const pg = pig as Record<string, unknown>;
                return {
                  wid: Number(pg.wid) || 0,
                  thumbnail_url: String(pg.thumbnail_url || ""),
                  activity: Number(pg.activity) || 0,
                  feeding_time: Number(pg.feeding_time) || 0,
                };
              })
          : [],
      };
    });
}
