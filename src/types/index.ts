// 인증 관련
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

//
export interface AbnormalPig {
  wid: number;
  thumbnail_url: string;
  activity: number;
  feeding_time: number;
}

//
export interface Pen {
  pen_id: string;
  pen_name: string;
  current_pig_count: number;
  avg_activity_level: number;
  avg_feeding_time_minutes: number;
  avg_temperature_celsius: number;
  abnormal_pigs: AbnormalPig[];
}

//
export interface Piggery {
  piggery_id: string;
  piggery_name: string;
  total_pigs: number;
  pens: Pen[];
}

// 돈사 목록
export interface PensResponse {
  piggeies: Piggery[];
}

// 돈사 상세 시계열 데이터
export interface TimeSeriesPoint {
  activity: number;
  feeding_time: number;
}

// 돈사 상세 응답
export interface PenDetail {
  id: number;
  name: string;
  time_series: TimeSeriesPoint[];
}

// WebSocket 실시간 데이터
export interface WsTimeSeriesMessage {
  pen_id: string;
  timestamp: string;
  data: {
    activity: number;
    feeding_time: number;
  };
}
