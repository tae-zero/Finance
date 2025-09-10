import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate, useLocation } from 'react-router-dom';
import './SidebarRedesigned.css';

const industryList = [
  "IT 서비스", "건설", "기계·장비", "기타금융", "기타제조", "금속",
  "농업, 임업 및 어업", "보험", "비금속", "섬유·의류", "식음료·담배",
  "오락·문화", "운송·창고", "운송장비·부품", "유통", "의료·정밀기기",
  "은행", "제약", "종이·목재", "증권", "전기·가스", "전기·전자",
  "통신", "화학", "부동산", "일반 서비스"
];

const menuItems = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: '📊',
    path: '/',
    description: '메인 대시보드'
  },
  {
    id: 'treasure',
    label: '보물찾기',
    icon: '💎',
    path: '/treasure',
    description: '종목 발굴 게임'
  }
];

function SidebarRedesigned() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showIndustryFilter, setShowIndustryFilter] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('전체');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch(API_ENDPOINTS.COMPANY_NAMES)
      .then(res => res.json())
      .then(data => setCompanyList(data))
      .catch(err => console.error("기업명 불러오기 실패:", err));
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const trimmed = searchTerm.trim();
      if (trimmed) {
        navigate(`/company/${encodeURIComponent(trimmed)}`);
        setSearchTerm("");
        setSuggestions([]);
        setShowSuggestions(false);
        e.target.blur();
      }
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 0) {
      const filtered = companyList
        .filter(company => 
          company.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (company) => {
    setSearchTerm(company);
    setShowSuggestions(false);
    navigate(`/company/${encodeURIComponent(company)}`);
  };

  const handleIndustryClick = (industry) => {
    setSelectedIndustry(industry);
    setShowIndustryFilter(false);
    if (industry !== '전체') {
      navigate(`/industry/${encodeURIComponent(industry)}`);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="sidebar-redesigned">
      {/* 로고 섹션 */}
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo-icon">🎡</div>
          <div className="logo-content">
            <h1 className="logo-title">주린이 놀이터</h1>
            <p className="logo-subtitle">친절한 투자 가이드</p>
          </div>
        </div>
      </div>

      {/* 검색 섹션 */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              className="search-input"
              placeholder="기업명을 검색하세요"
              value={searchTerm}
              onChange={handleChange}
              onKeyPress={handleSearch}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
            />
            <button 
              className="search-button"
              onClick={handleSearch}
            >
              검색
            </button>
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((company, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(company)}
                >
                  <div className="suggestion-icon">🏢</div>
                  <div className="suggestion-text">{company}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 메뉴 네비게이션 */}
      <div className="navigation-section">
        <h3 className="section-title">
          <span className="title-icon">🧭</span>
          메뉴
        </h3>
        <nav className="menu-list">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <div className="menu-icon">{item.icon}</div>
              <div className="menu-content">
                <div className="menu-label">{item.label}</div>
                <div className="menu-description">{item.description}</div>
              </div>
              {isActive(item.path) && (
                <div className="active-indicator"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 산업 필터 */}
      <div className="industry-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="title-icon">🏭</span>
            산업별 분석
          </h3>
          <button 
            className="filter-toggle"
            onClick={() => setShowIndustryFilter(!showIndustryFilter)}
          >
            {showIndustryFilter ? '접기' : '펼치기'}
          </button>
        </div>
        
        {showIndustryFilter && (
          <div className="industry-filter">
            <div className="industry-list">
              <button
                className={`industry-item ${selectedIndustry === '전체' ? 'active' : ''}`}
                onClick={() => handleIndustryClick('전체')}
              >
                <span className="industry-icon">🌐</span>
                <span className="industry-name">전체</span>
              </button>
              {industryList.map((industry, index) => (
                <button
                  key={index}
                  className={`industry-item ${selectedIndustry === industry ? 'active' : ''}`}
                  onClick={() => handleIndustryClick(industry)}
                >
                  <span className="industry-icon">🏢</span>
                  <span className="industry-name">{industry}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 퀵 가이드 */}
      <div className="guide-section">
        <div className="guide-card">
          <div className="guide-icon">💡</div>
          <div className="guide-content">
            <h4 className="guide-title">투자 가이드</h4>
            <p className="guide-text">
              주린이를 위한 친절한 투자 정보를 제공합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SidebarRedesigned;
