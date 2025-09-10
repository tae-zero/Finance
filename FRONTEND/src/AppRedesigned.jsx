import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from 'react-router-dom';
import IndustryAnalysis from './industryAnalysis';
import DashboardRedesigned from './components/Dashboard/DashboardRedesigned';
import CompanyDetailRedesigned from './components/CompanyDetail/CompanyDetailRedesigned';
import TreasureHuntRedesigned from './components/TreasureHunt/TreasureHuntRedesigned';
import SidebarRedesigned from './components/Sidebar/SidebarRedesigned';
import GuidePopup from './GuidePopup';
import './styles/design-system.css';
import './AppRedesigned.css';

function AppRedesigned() {
  const [showGuide, setShowGuide] = useState(false);
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

          {/* 페이지 콘텐츠 */}
          <main className="page-content">
            <Routes>
              <Route path="/" element={<DashboardRedesigned />} />
              <Route path="/company/:name" element={<CompanyDetailRedesigned />} />
              <Route path="/industry/:industry" element={<IndustryAnalysis />} />
              <Route path="/treasure" element={<TreasureHuntRedesigned />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default AppRedesigned;
