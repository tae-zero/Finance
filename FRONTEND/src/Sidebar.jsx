import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from './config/api';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation
} from 'react-router-dom';



const industryList = [
  "IT 서비스", "건설", "기계·장비", "기타금융", "기타제조", "금속",
  "농업, 임업 및 어업", "보험", "비금속", "섬유·의류", "식음료·담배",
  "오락·문화", "운송·창고", "운송장비·부품", "유통", "의료·정밀기기",
  "은행", "제약", "종이·목재", "증권", "전기·가스", "전기·전자",
  "통신", "화학", "부동산", "일반 서비스"
];

function Sidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [companyList, setCompanyList] = useState([]);
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
      e.target.blur(); // <- 포커스 제거
    }
  }
};

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSuggestions([]);
    } else {
      const filtered = companyList.filter(name =>
        name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 10));
    }
  };



  return (
    <aside className="sidebar">
      {/* 로고 섹션 */}
      <div className="logo-section">
        <h1 className="logo-title">주린이 놀이터</h1>
        <p className="logo-subtitle">주린이를 위한 친절한 주식투자 대시보드</p>
      </div>

      {/* 검색 섹션 */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            className="search-input"
            placeholder="종목명 검색"
            value={searchTerm}
            onChange={handleChange}
            onKeyDown={handleSearch}
          />
        </div>
        <button className="search-button" onClick={handleSearch}>
          검색
        </button>
        
        {suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className="suggestion-item"
                onClick={() => {
                  navigate(`/company/${encodeURIComponent(item)}`);
                  setSearchTerm("");
                  setSuggestions([]);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 필터 섹션 */}
      <div className="filter-section">
        <details open>
          <summary className="filter-title">
            산업별 보기
          </summary>

          {/* 보물찾기 버튼 */}
          <Link
            to="/treasure"
            className="btn btn-warning w-full mb-4 text-center"
            style={{
              background: 'var(--warning-gradient)',
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: 'var(--spacing-lg)'
            }}
          >
            🪙 보물찾기 (저PBR/PER/대형주 필터링)
          </Link>

          <div className="grid grid-cols-1 gap-2">
            {industryList.map((item, idx) => {
              const isActive = location.pathname === `/industry/${encodeURIComponent(item)}`;

              return (
                <Link
                  key={idx}
                  to={`/industry/${encodeURIComponent(item)}`}
                  className={`filter-checkbox ${isActive ? 'active' : ''}`}
                  style={{
                    textDecoration: 'none',
                    background: isActive ? 'var(--primary-gradient)' : 'transparent',
                    color: isActive ? 'white' : 'var(--light-text)',
                    fontWeight: isActive ? '600' : '500',
                    border: isActive ? 'none' : '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    transition: 'var(--transition-normal)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                  }}
                >
                  <span className="text-sm">{item}</span>
                </Link>
              );
            })}
          </div>
        </details>
      </div>

      {/* 홈 버튼 */}
      <button
        onClick={() => navigate("/")}
        className="home-button"
      >
        🏠 홈으로
      </button>
    </aside>
  );
}

export default Sidebar;
