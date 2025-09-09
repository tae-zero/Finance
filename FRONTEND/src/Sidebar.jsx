import React, { useState, useEffect } from 'react';
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
    fetch("http://localhost:8000/companies/names")
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
    <aside className="sidebar" style={{ position: 'relative', borderRadius: '6px', }}>
      <div style={{ marginTop: '30px' }}>
        <h3>🔍 검색</h3>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="종목명 검색"
            value={searchTerm}
            onChange={handleChange}
            onKeyDown={handleSearch}
            style={{
              flex: 1,
              padding: '8px',
              boxSizing: 'border-box',
            }}
          />
          <button onClick={handleSearch} style={{ padding: '8px 12px' }}>
            검색
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul style={{
            listStyle: 'none',
            padding: '4px',
            marginTop: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            maxHeight: '100px',
            overflowY: 'auto',
            position: 'absolute',
            zIndex: 1000,
            fontSize: '13px',
            width: 'calc(100% - 20px)'
          }}>
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onClick={() => {
                  navigate(`/company/${encodeURIComponent(item)}`);
                  setSearchTerm("");
                  setSuggestions([]);
                }}
                style={{
                  padding: '4px 6px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee'
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ 산업 리스트 및 보물찾기 버튼 */}
      <div style={{ marginTop: '30px' }}>
        <details open>
          <summary style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '10px', cursor: 'pointer' }}>
            🏭 산업별 보기
          </summary>

          {/* ✅ 보물찾기 버튼 추가 (맨 위) */}
          <Link
            to="/treasure"
            style={{
              gridColumn: '1 / -1',
              padding: '8px 10px',
              background: '#ffe599',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#333',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '10px'
            }}
          >
            🪙 보물찾기 (저PBR/PER/대형주 필터링)
          </Link>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            {industryList.map((item, idx) => {
              const isActive = location.pathname === `/industry/${encodeURIComponent(item)}`; // 현재 선택된 항목

              return (
                <Link
                  key={idx}
                  to={`/industry/${encodeURIComponent(item)}`}
                  style={{
                    padding: '6px 10px',
                    background: isActive ? '#555555' : '#f0f0f0',  // 선택된 항목 배경색
                    borderRadius: '6px',
                    textDecoration: 'none',
                    color: isActive ? 'white' : '#333',           // 선택된 항목 텍스트색
                    fontWeight: isActive ? 'bold' : 'normal'
                  }}
                >
                  {item}
                </Link>
              );
            })}
          </div>
        </details>
      </div>

      {/* 🏠 홈으로 버튼 */}
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={() => navigate("/")}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007acc',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🏠 홈으로
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
