# 주린이 놀이터 - 새로운 디자인 시스템 가이드

## 🎨 컬러 팔레트

### 다크 모드 기본 컬러
- **메인 배경**: `#0A0E1A` (--dark-bg-primary)
- **카드/서피스 배경**: `#1A1D2E` (--dark-bg-secondary)
- **호버/액티브 배경**: `#252A3A` (--dark-bg-tertiary)
- **테두리**: `#2D3748` (--dark-border)

### 텍스트 컬러
- **주요 텍스트**: `#F7FAFC` (--text-primary)
- **보조 텍스트**: `#A0AEC0` (--text-secondary)
- **비활성 텍스트**: `#718096` (--text-tertiary)

### 강조 컬러 (Accent Colors)
- **메인 강조색**: `#00D1B2` (--accent-primary) - 청록색
- **호버 상태**: `#00B8A3` (--accent-primary-hover)
- **보조 강조색**: `#667EEA` (--accent-secondary)
- **3차 강조색**: `#764BA2` (--accent-tertiary)

### 데이터 시각화 컬러
- **상승**: `#00C896` (--chart-up)
- **하락**: `#FF6B6B` (--chart-down)
- **차트 색상 1**: `#00D1B2`
- **차트 색상 2**: `#667EEA`
- **차트 색상 3**: `#F093FB`

## 📝 타이포그래피

### 폰트 패밀리
- **기본**: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif

### 폰트 크기
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)
- **5xl**: 3rem (48px)

### 폰트 굵기
- **light**: 300
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700
- **extrabold**: 800

## 📏 간격 시스템 (8pt 그리드)

- **0**: 0
- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **3**: 0.75rem (12px)
- **4**: 1rem (16px)
- **5**: 1.25rem (20px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)
- **10**: 2.5rem (40px)
- **12**: 3rem (48px)
- **16**: 4rem (64px)
- **20**: 5rem (80px)
- **24**: 6rem (96px)

## 🔲 둥근 모서리

- **none**: 0
- **sm**: 0.25rem (4px)
- **md**: 0.375rem (6px)
- **lg**: 0.5rem (8px)
- **xl**: 0.75rem (12px)
- **2xl**: 1rem (16px)
- **3xl**: 1.5rem (24px)
- **full**: 9999px

## 🌟 그림자

- **xs**: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- **sm**: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
- **md**: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- **lg**: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- **xl**: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
- **2xl**: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
- **glow**: 0 0 20px rgba(0, 209, 178, 0.3)

## ⚡ 애니메이션

- **fast**: 0.15s ease-in-out
- **normal**: 0.3s ease-in-out
- **slow**: 0.5s ease-in-out
- **bounce**: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)

## 🎯 주요 컴포넌트 스타일

### 카드 (Card)
```css
.card {
  background: var(--dark-bg-secondary);
  border: 1px solid var(--dark-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
  transition: var(--transition-normal);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
  border-color: var(--accent-primary);
}
```

### 버튼 (Button)
```css
.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--text-inverse);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-xl);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-lg);
  transition: var(--transition-normal);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}
```

### 테이블 (Table)
```css
.modern-table {
  width: 100%;
  background: var(--dark-bg-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--dark-border);
}

.modern-table th {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--text-inverse);
  padding: var(--space-4);
  font-weight: var(--font-semibold);
}

.modern-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--dark-border);
  color: var(--text-primary);
}

.modern-table tr:hover {
  background: var(--dark-bg-tertiary);
  transform: scale(1.01);
}
```

## 🎮 게이미피케이션 요소

### 보물찾기 페이지
- **보물 아이콘**: 💎 (애니메이션 효과)
- **지도 메타포**: 필터 조건을 "보물 지도"로 표현
- **발견 애니메이션**: 보물 발견 시 축하 애니메이션
- **진행 표시**: 프로그레스 바와 카운터
- **보상 시스템**: 발견된 보물 개수 표시

### 인터랙션 효과
- **호버 효과**: 카드 리프트, 스케일 변화
- **클릭 피드백**: 버튼 애니메이션
- **로딩 상태**: 스피너와 로딩 텍스트
- **성공 상태**: 축하 애니메이션과 색상 변화

## 📱 반응형 디자인

### 브레이크포인트
- **모바일**: 768px 이하
- **태블릿**: 1024px 이하
- **데스크톱**: 1024px 이상

### 모바일 최적화
- 사이드바를 상단으로 이동
- 카드 레이아웃을 세로로 변경
- 폰트 크기 조정
- 터치 친화적 버튼 크기

## 🎨 시각적 계층 구조

### 중요도 순서
1. **KOSPI 시세** - 가장 큰 카드, 강조 색상
2. **주요 랭킹** - 중간 크기 카드
3. **뉴스** - 작은 카드들
4. **퀵 액션** - 하단 배치

### 색상 위계
- **Primary**: 주요 정보 (흰색)
- **Secondary**: 보조 정보 (회색)
- **Accent**: 강조 정보 (청록색)
- **Success**: 성공 상태 (녹색)
- **Warning**: 경고 상태 (노란색)
- **Error**: 오류 상태 (빨간색)
