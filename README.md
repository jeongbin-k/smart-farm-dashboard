# 스마트 농장: 실시간 통합 관제 대시보드

Intflow Inc. 프론트엔드 엔지니어 채용 과제

## 📋 프로젝트 개요

스마트 농장의 돈사 현황을 실시간으로 모니터링하는 대시보드 애플리케이션입니다.
REST API와 WebSocket을 통해 실시간 데이터를 표시하며, 한국어/영어 다국어를 지원합니다.

### 주요 기능

- JWT 기반 인증 (로그인/로그아웃)
- 실시간 돈사 현황 대시보드 (WebSocket)
- 돈사별 상세 그래프 (시계열 데이터)
- 다국어 지원 (한국어/영어, 새로고침 후에도 유지)
- WebSocket 자동 재연결
- 에러 핸들링 및 데이터 검증

## 🛠️ 기술 스택

- **프레임워크**: React 18 + TypeScript
- **빌드 도구**: Vite
- **라우팅**: React Router v6
- **다국어**: react-i18next
- **차트**: Recharts
- **스타일**: CSS Modules

## 설치 및 실행 방법

### 1. 프로젝트 클론

```bash
git clone [repository-url]
cd smart-farm-dashboard
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 입력

```env
VITE_API_BASE_URL=http://intflowserver2.iptime.org:60535
VITE_WS_BASE_URL=ws://intflowserver2.iptime.org:60535
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 5. 로그인

- **이메일**: test2@example.com
- **비밀번호**: (과제 페이지에서 제공)

## 📁 프로젝트 구조

```
src/
├── api/              # REST API 호출 함수
│   ├── client.ts     # 기본 설정, retry 로직
│   ├── auth.ts       # 로그인 API
│   └── pens.ts       # 돈사 목록/상세 API
├── components/       # 공통 컴포넌트
│   ├── Header.tsx    # 헤더 (언어 변경, 로그아웃)
│   └── ProtectedRoute.tsx  # Auth Guard
├── context/          # React Context
│   └── AuthContext.tsx     # 인증 상태 관리
├── hooks/            # 커스텀 훅
│   ├── useAuth.ts    # 인증 훅
│   └── useWebSocket.ts     # WebSocket 재연결 훅
├── i18n/             # 다국어 설정
│   ├── ko.ts         # 한국어 번역
│   ├── en.ts         # 영어 번역
│   └── index.ts      # i18n 설정
├── pages/            # 페이지 컴포넌트
│   ├── Login/        # 로그인 페이지
│   ├── Dashboard/    # 대시보드 페이지
│   └── Detail/       # 상세 그래프 페이지
├── types/            # TypeScript 타입 정의
│   └── index.ts
└── utils/            # 유틸 함수
    └── validate.ts   # 데이터 검증
```

## 구현 설명

### 1. 상태 관리 전략

#### Context API

- **AuthContext**: JWT 토큰 및 로그인 상태를 전역으로 관리
- `localStorage`를 사용하여 새로고침 후에도 로그인 상태 유지

#### Local State (useState)

- 각 페이지별 데이터는 컴포넌트 내부 상태로 관리
- REST API 응답 데이터, WebSocket 수신 데이터, UI 상태 등

### 2. WebSocket 처리 방식

#### 커스텀 훅 (useWebSocket)

- WebSocket 연결, 메시지 수신, 에러 처리를 추상화
- **자동 재연결**: Exponential Backoff 전략 (1초 → 2초 → 4초 ... 최대 30초)
- **최대 재시도**: 5번까지 재연결 시도
- **인증 실패 처리**: Close Code 1008 감지 시 재연결 중단

#### 실시간 데이터 갱신

- **대시보드**: 2초마다 전체 돈사 목록 업데이트 (`/ws/pens`)
- **상세 페이지**: 1초마다 개별 돈사 데이터 포인트 추가 (`/ws/pens/{penId}`)

#### 리소스 정리

- `useEffect` cleanup 함수로 컴포넌트 언마운트 시 WebSocket 연결 종료
- 타임아웃 타이머 정리로 메모리 누수 방지

### 3. i18n 설계

#### react-i18next 사용

- 한국어(ko), 영어(en) 번역 파일 분리
- `localStorage`에 언어 설정 저장하여 새로고침 후에도 유지
- 모든 텍스트는 `t()` 함수로 번역

#### 언어 변경

- Header 컴포넌트에서 언어 선택
- `i18n.changeLanguage()`로 즉시 전환
- `languageChanged` 이벤트 리스너로 localStorage 동기화

### 4. 에러 핸들링

#### HTTP 에러

- **Retry 로직**: 500번대 에러는 최대 3번까지 재시도 (Exponential Backoff)
- **401 에러**: 토큰 만료로 판단하여 즉시 로그인 페이지로 이동
- **타임아웃**: 10초 이상 응답 없으면 요청 중단

#### 데이터 검증 (validate.ts)

- API 응답 데이터의 null, 타입 불일치, 필드 누락 처리
- 손상된 데이터가 와도 기본값으로 대체하여 앱이 중단되지 않도록 방어

#### 사용자 피드백

- 로딩 상태 표시
- 에러 메시지 표시
- WebSocket 연결 상태 표시 (Live/Disconnected)

### 5. Auth Guard

#### ProtectedRoute 컴포넌트

- 인증되지 않은 사용자의 대시보드/상세 페이지 접근 차단
- 자동으로 로그인 페이지로 리다이렉트

## 주요 화면

### 로그인 페이지

- 이메일/비밀번호 입력
- 언어 선택 (한국어/영어)
- 유효성 검사 및 에러 메시지 표시

### 대시보드

- 농장별 돈사 목록 표시
- 실시간 데이터 갱신 (재고, 활동도, 식사시간, 온도)
- 이상 개체 펼침/접힘
- 상세 그래프로 이동

### 상세 그래프

- 초기 10개 시계열 데이터 로드 (REST API)
- 1초마다 새 데이터 포인트 추가 (WebSocket)
- 활동량 / 식사시간 이중 축 그래프 (Recharts)
- 최대 50개 데이터 포인트 유지

## 🧪 테스트 방법

### 에러 핸들링 테스트

서버가 의도적으로 다음 에러를 발생시킵니다:

- HTTP 500/503/504 에러 (5% 확률)
- 응답 지연 1~2초 (5% 확률)
- 데이터 손상 (3% 확률)
- WebSocket 연결 끊김 (5% 확률)

### 확인 사항

- ✅ 에러 발생 시 자동 재시도
- ✅ WebSocket 끊김 시 자동 재연결
- ✅ 손상된 데이터 처리
- ✅ 토큰 만료 시 로그인 페이지 이동

## 📝 개발 노트

#### 배운점

- **WebSocket**: 실시간 양방향 통신, 재연결 전략 (Exponential Backoff)
- **TypeScript**: 타입 안전성, interface 설계, unknown vs any
- **react-i18next**: 다국어 처리, localStorage 연동
- **Recharts**: 이중 Y축 그래프, 실시간 데이터 시각화

#### React 심화 학습

- **useEffect**: cleanup 함수로 리소스 정리 (WebSocket 연결 해제)
- **useState**: 복잡한 상태 관리 (Set, 배열 불변성)
- **useCallback**: WebSocket 메시지 핸들러 최적화
- **useRef**: DOM 참조, 재렌더링 없는 값 저장
- **Context API**: 전역 상태 관리 (Auth)

#### 에러 핸들링

- **방어적 프로그래밍**: 데이터 검증, null 체크, 타입 변환
- **Retry 로직**: HTTP 에러 자동 재시도
- **사용자 피드백**: 로딩/에러 상태 UI 표시

#### 설계 원칙

- 컴포넌트 분리와 재사용성
- API 레이어 추상화
- 커스텀 훅으로 로직 분리

## 👤 작성자

강정빈 - Intflow Inc. 프론트엔드 엔지니어 채용 과제

## 제출일

2026-02-13

### ⚠️ 배포 환경 로그인 관련 유의사항

- 프로젝트는 **Vercel(HTTPS)**을 통해 배포되었으나, 제공된 과제 서버 API는 **HTTP** 프로토콜을 사용합니다.
- 브라우저의 보안 정책상 HTTPS 환경에서 HTTP로의 데이터 전송을 차단하므로, 배포 링크에서 로그인이 실패할 수 있습니다.

- **해결 방법**:
  1. **로컬 환경**: `npm run dev`를 통한 로컬 환경에서는 정상적으로 로그인이 가능합니다.
  2. **배포 환경**: 브라우저 주소창 좌측의 [사이트 설정] -> [개인정보 및 보안] -> [사이트 설정] -> [추가 콘텐츠 설정] -> [안전하지 않은 콘텐츠]를 **'링크 추가'**로 변경하면 테스트가 가능합니다.
