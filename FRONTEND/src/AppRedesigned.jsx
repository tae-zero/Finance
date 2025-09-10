import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from 'react-router-dom';
import IndustryAnalysisRedesigned from './components/IndustryAnalysis/IndustryAnalysisRedesigned';
import DashboardRedesigned from './components/Dashboard/DashboardRedesigned';
import CompanyDetailRedesigned from './components/CompanyDetail/CompanyDetailRedesigned';
import TreasureHuntRedesigned from './components/TreasureHunt/TreasureHuntRedesigned';
import SidebarRedesigned from './components/Sidebar/SidebarRedesigned';
import GuidePopup from './GuidePopup';
import './styles/design-system.css';
import './AppRedesigned.css';

function AppRedesigned() {
  const [showGuide, setShowGuide] = useState(false);
  const [showProjectIntro, setShowProjectIntro] = useState(true); // 프로젝트 소개 모달
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <Router>
      <div className="app-redesigned">
        {/* 사이드바 */}
        <div className="sidebar-container">
          <SidebarRedesigned />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="main-content">
          {/* 헤더 배너 */}
          <header className="page-header-banner">
            <div className="banner-content">
              <div className="banner-texts">
                <div className="title-container">
                  <h1 
                    className="banner-title"
                    onMouseEnter={handleMouseEnter}
                    onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
                    onMouseLeave={handleMouseLeave}
                  >
                    🎡 주린이 놀이터 🎡
                  </h1>
                </div>
                <h2 className="banner-subtitle">
                  주린이를 위한 친절한 주식투자 대시보드
                </h2>
                {showTooltip && (
                  <div
                    className="tooltip"
                    style={{
                      position: 'fixed',
                      top: tooltipPosition.y + 20,
                      left: tooltipPosition.x + 20,
                      zIndex: 1000,
                    }}
                  >
                    <img 
                      src="/투자는신중하게.jpg" 
                      alt="투자 주의사항" 
                      className="tooltip-image"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowGuide(true)}
                className="guide-button"
              >
                <span className="button-icon">💡</span>
                사이트 사용 가이드
              </button>
              <GuidePopup open={showGuide} onClose={() => setShowGuide(false)} />
            </div>
          </header>

          {/* 프로젝트 소개 모달 */}
          {showProjectIntro && (
            <div className="project-intro-overlay">
              <div className="project-intro-modal">
                <div className="project-intro-header">
                  <div className="project-intro-title">
                    <span className="project-icon">🎮</span>
                    <h1>주린이 놀이터</h1>
                    <span className="project-subtitle">코스피 기업 분석 플랫폼</span>
                  </div>
                  <button
                    onClick={() => setShowProjectIntro(false)}
                    className="project-intro-close"
                  >
                    ✕
                  </button>
                </div>

                <div className="project-intro-content">
                  {/* 프로젝트 요약 */}
                  <section className="intro-section">
                    <h2 className="section-title">
                      <span className="title-icon">📋</span>
                      프로젝트 요약
                    </h2>
                    <p className="section-content">
                      <strong>주린이 놀이터</strong>는 주식 초보자('주린이')들이 복잡한 금융 데이터를 놀이터처럼 재미있고 쉽게 탐색할 수 있도록 돕는 웹 기반 투자 분석 플랫폼입니다. 
                      코스피 상장 기업들의 실시간 주식 데이터, 재무제표, 뉴스 정보를 게이미피케이션 요소와 함께 제공하여, 
                      사용자가 직관적인 대시보드를 통해 기업의 투자 가치를 평가하고, 산업별 분석을 통해 시장 트렌드를 파악할 수 있습니다.
                    </p>
                  </section>

                  {/* 주요 기능 */}
                  <section className="intro-section">
                    <h2 className="section-title">
                      <span className="title-icon">🚀</span>
                      주요 기능
                    </h2>
                    <div className="features-grid">
                      <div className="feature-card">
                        <div className="feature-icon">📈</div>
                        <h3>대시보드</h3>
                        <p>실시간 코스피 지수, 핫뉴스, 투자자 현황, 주요 랭킹</p>
                      </div>
                      <div className="feature-card">
                        <div className="feature-icon">🏢</div>
                        <h3>기업 상세 분석</h3>
                        <p>주가 차트, 재무제표, 뉴스, 투자자별 거래량, 증권사 리포트</p>
                      </div>
                      <div className="feature-card">
                        <div className="feature-icon">🏭</div>
                        <h3>산업별 분석</h3>
                        <p>산업 개요, 재무지표 해석, 산업 체크포인트</p>
                      </div>
                      <div className="feature-card">
                        <div className="feature-icon">🎮</div>
                        <h3>보물찾기</h3>
                        <p>게이미피케이션 기반 종목 발굴, 직관적 필터링</p>
                      </div>
                    </div>
                  </section>

                  {/* 사용 기술 */}
                  <section className="intro-section">
                    <h2 className="section-title">
                      <span className="title-icon">🛠️</span>
                      사용 기술
                    </h2>
                    <div className="tech-stack">
                      <div className="tech-category">
                        <h4>Frontend</h4>
                        <div className="tech-tags">
                          <span className="tech-tag">React 19.1.0</span>
                          <span className="tech-tag">Vite 6.3.5</span>
                          <span className="tech-tag">Chart.js</span>
                          <span className="tech-tag">Recharts</span>
                        </div>
                      </div>
                      <div className="tech-category">
                        <h4>Backend</h4>
                        <div className="tech-tags">
                          <span className="tech-tag">FastAPI 0.104.1</span>
                          <span className="tech-tag">MongoDB</span>
                          <span className="tech-tag">PyKRX</span>
                          <span className="tech-tag">YFinance</span>
                        </div>
                      </div>
                      <div className="tech-category">
                        <h4>배포</h4>
                        <div className="tech-tags">
                          <span className="tech-tag">Vercel</span>
                          <span className="tech-tag">Railway</span>
                          <span className="tech-tag">MongoDB Atlas</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 프로젝트 의의 */}
                  <section className="intro-section">
                    <h2 className="section-title">
                      <span className="title-icon">📊</span>
                      프로젝트 의의
                    </h2>
                    <div className="significance-grid">
                      <div className="significance-card">
                        <h4>기술적 의의</h4>
                        <ul>
                          <li>실시간 데이터 처리 시스템</li>
                          <li>효율적인 웹 스크래핑</li>
                          <li>API 최적화</li>
                          <li>현대적 UI/UX 디자인</li>
                        </ul>
                      </div>
                      <div className="significance-card">
                        <h4>사용자 경험 의의</h4>
                        <ul>
                          <li>게이미피케이션을 통한 학습</li>
                          <li>접근성 향상</li>
                          <li>데이터 통합</li>
                          <li>다크 모드 최적화</li>
                        </ul>
                      </div>
                      <div className="significance-card">
                        <h4>비즈니스 의의</h4>
                        <ul>
                          <li>투자 의사결정 지원</li>
                          <li>시장 투명성 증대</li>
                          <li>개인 투자자 지원</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* 기대효과 */}
                  <section className="intro-section">
                    <h2 className="section-title">
                      <span className="title-icon">🎯</span>
                      기대효과
                    </h2>
                    <div className="expectations">
                      <div className="expectation-item">
                        <h4>단기적 효과</h4>
                        <p>투자 정보 접근성 향상, 의사결정 시간 단축, 투자 리스크 감소</p>
                      </div>
                      <div className="expectation-item">
                        <h4>장기적 효과</h4>
                        <p>금융 리터러시 향상, 시장 효율성 증대, 데이터 기반 투자 문화 확산</p>
                      </div>
                    </div>
                  </section>

                  {/* 최신 업데이트 */}
                  <section className="intro-section highlight">
                    <h2 className="section-title">
                      <span className="title-icon">🎨</span>
                      최신 업데이트 (2024년 12월)
                    </h2>
                    <div className="update-features">
                      <div className="update-item">✅ 완전한 UI/UX 리디자인</div>
                      <div className="update-item">✅ Tech-Fin 스타일 디자인 시스템</div>
                      <div className="update-item">✅ 다크 모드 기본 적용</div>
                      <div className="update-item">✅ 8pt 그리드 시스템</div>
                      <div className="update-item">✅ 게이미피케이션 강화</div>
                    </div>
                  </section>
                </div>

                <div className="project-intro-footer">
                  <button
                    onClick={() => setShowProjectIntro(false)}
                    className="start-button"
                  >
                    <span className="button-icon">🚀</span>
                    시작하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 페이지 콘텐츠 */}
          <main className="page-content">
            <Routes>
              <Route path="/" element={<DashboardRedesigned />} />
              <Route path="/company/:name" element={<CompanyDetailRedesigned />} />
              <Route path="/industry/:industry" element={<IndustryAnalysisRedesigned />} />
              <Route path="/treasure" element={<TreasureHuntRedesigned />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default AppRedesigned;
