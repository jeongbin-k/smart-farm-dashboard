import { useEffect, useRef, useState } from "react";

interface UseWebSocketOptions {
  onMessage: (data: unknown) => void;
  onError?: (error: Event) => void;
  onAuthError?: () => void;
  maxRetries?: number;
}

export function useWebSocket(url: string | null, options: UseWebSocketOptions) {
  const { onMessage, onError, maxRetries = 5 } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0); // 초기값 0 추가
  const reconnectTimeoutRef = useRef<number | undefined>(undefined); // 초기값 추가
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // url이 null이면 연결 안 함
    if (!url) return;

    function connect() {
      try {
        const ws = new WebSocket(url!);
        wsRef.current = ws;

        // 연결 성공
        ws.onopen = () => {
          console.log("WebSocket connected:", url);
          setIsConnected(true);
          reconnectAttemptsRef.current = 0;
        };

        // 메시지 받았을 때
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as unknown;
            onMessage(data);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        // 연결 끊겼을 때
        ws.onclose = (event) => {
          console.log("WebSocket closed:", event.code);
          setIsConnected(false);
          wsRef.current = null;

          // 1008 = 인증 실패  재연결 안 함
          if (event.code === 1008) {
            console.error("Token expired or invalid");
            return;
          }

          // 재연결 시도
          if (reconnectAttemptsRef.current < maxRetries) {
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttemptsRef.current),
              30000,
            );

            console.log(`Reconnecting in ${delay}ms...`);
            reconnectTimeoutRef.current = window.setTimeout(() => {
              reconnectAttemptsRef.current++;
              connect();
            }, delay);
          } else {
            console.error("Max reconnection attempts reached");
          }
        };

        // 에러 났을 때
        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          onError?.(error);
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
      }
    }

    connect();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (reconnectTimeoutRef.current !== undefined) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url, onMessage, onError, maxRetries]);

  return { isConnected };
}
