import React, { useEffect, useState } from 'react';
import FinancialGraph from '../../FinancialGraph';
import { API_ENDPOINTS } from '../../config/api';
import './TreasureHuntRedesigned.css';

function TreasureHuntRedesigned() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [industryFilter, setIndustryFilter] = useState('전체');
  const [industries, setIndustries] = useState([]);
  const [pbrMin, setPbrMin] = useState(0);
  const [pbrMax, setPbrMax] = useState(3);
  const [perMin, setPerMin] = useState(0);
  const [perMax, setPerMax] = useState(50);
  const [roeMin, setRoeMin] = useState(0);
  const [roeMax, setRoeMax] = useState(30);
  const [industryMetrics, setIndustryMetrics] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [treasureFound, setTreasureFound] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [treasureRes, metricsRes] = await Promise.all([
          fetch(API_ENDPOINTS.TREASURE_DATA).then(res => res.json()),
          fetch('/industry_metrics.json').then(res => res.json())
        ]);

        setIndustryMetrics(metricsRes);

        const cleaned = treasureRes.filter(item => {
          const hasAnyPER = Object.values(item.PER || {}).some(v => typeof v === 'number');
          const hasAnyPBR = Object.values(item.PBR || {}).some(v => typeof v === 'number');
          const hasAnyROE = Object.values(item.ROE || {}).some(v => typeof v === 'number');
          return hasAnyPER && hasAnyPBR && hasAnyROE;
        });

        // 디버깅을 위한 로그
        console.log('🔍 보물찾기 데이터 샘플:', cleaned.slice(0, 2));
        console.log('🔍 지배주주지분 데이터 예시:', cleaned[0]?.지배주주지분);
        console.log('🔍 지배주주순이익 데이터 예시:', cleaned[0]?.지배주주순이익);

        setData(cleaned);
        setFiltered(cleaned);
        
        const uniqueIndustries = Array.from(new Set(cleaned.map(item => item.업종명))).sort();
        setIndustries(['전체', ...uniqueIndustries]);
        
        setFoundCount(cleaned.length);
      } catch (error) {
        console.error('❌ 데이터 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getThreeYearAvg = (obj) => {
    const years = ['2022', '2023', '2024'];
    const values = years.map(year => obj?.[year]).filter(v => typeof v === 'number');
    if (!values.length) return '-';
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(2);
  };

  const applyFilters = () => {
    const filteredData = data.filter(item => {
      const perAvg = parseFloat(getThreeYearAvg(item.PER));
      const pbrAvg = parseFloat(getThreeYearAvg(item.PBR));
      const roeAvg = parseFloat(getThreeYearAvg(item.ROE));

      // 하나라도 평균값이 NaN이거나 0이면 제외
      const isValid = ![perAvg, pbrAvg, roeAvg].some(val => isNaN(val) || val === 0);
      const matchIndustry = industryFilter === '전체' || item.업종명 === industryFilter;

      return (
        matchIndustry &&
        isValid &&
        perAvg >= perMin && perAvg <= perMax &&
        pbrAvg >= pbrMin && pbrAvg <= pbrMax &&
        roeAvg >= roeMin && roeAvg <= roeMax
      );
    });

    setFiltered(filteredData);
    setFoundCount(filteredData.length);
    
    // 보물 발견 애니메이션
    if (filteredData.length > 0) {
      setTreasureFound(true);
      setTimeout(() => setTreasureFound(false), 2000);
    }
  };

  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);

    const sorted = [...filtered].sort((a, b) => {
      const aVal = parseFloat(getThreeYearAvg(a[field]));
      const bVal = parseFloat(getThreeYearAvg(b[field]));
      
      // NaN 처리
      if (isNaN(aVal) && isNaN(bVal)) return 0;
      if (isNaN(aVal)) return 1;
      if (isNaN(bVal)) return -1;
      
      return newOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    setFiltered(sorted);
  };

  const resetFilters = () => {
    setIndustryFilter('전체');
    setPbrMin(0);
    setPbrMax(3);
    setPerMin(0);
    setPerMax(50);
    setRoeMin(0);
    setRoeMax(30);
    setFiltered(data);
    setFoundCount(data.length);
  };

  if (loading) {
    return (
      <div className="treasure-loading">
        <div className="loading-treasure">
          <div className="treasure-icon">💎</div>
          <div className="loading-spinner"></div>
        </div>
        <p className="loading-text">보물을 찾는 중...</p>
      </div>
    );
  }

  return (
    <div className="treasure-hunt-redesigned">
      {/* 헤더 섹션 */}
      <div className="treasure-header">
        <div className="header-content">
          <div className="treasure-title">
            <span className="title-icon">💎</span>
            <h1>보물찾기</h1>
            <span className="title-icon">🗺️</span>
          </div>
          <p className="treasure-subtitle">
            숨겨진 우량주를 찾아보세요! 조건을 설정하고 보물을 발굴해보세요.
          </p>
        </div>
        
        {/* 보물 발견 카운터 */}
        <div className="treasure-counter">
          <div className="counter-icon">🎯</div>
          <div className="counter-content">
            <div className="counter-number">{foundCount}</div>
            <div className="counter-label">개 보물 발견!</div>
          </div>
        </div>
      </div>

      {/* 보물 발견 애니메이션 */}
      {treasureFound && (
        <div className="treasure-found-animation">
          <div className="celebration">🎉</div>
          <div className="celebration-text">보물을 발견했습니다!</div>
        </div>
      )}

      {/* 필터 컨트롤 */}
      <div className="filter-controls">
        <div className="controls-header">
          <h3 className="controls-title">
            <span className="title-icon">🔍</span>
            보물 지도 설정
          </h3>
          <button 
            className="toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? '접기' : '펼치기'}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            {/* 산업 필터 */}
            <div className="filter-group">
              <label className="filter-label">
                <span className="label-icon">🏭</span>
                업종 선택
              </label>
              <select 
                className="filter-select"
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
              >
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* PER 필터 */}
            <div className="filter-group">
              <label className="filter-label">
                <span className="label-icon">📊</span>
                PER 범위: {perMin} ~ {perMax}
              </label>
              <div className="range-inputs">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={perMin}
                  onChange={(e) => setPerMin(parseInt(e.target.value))}
                  className="range-slider"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={perMax}
                  onChange={(e) => setPerMax(parseInt(e.target.value))}
                  className="range-slider"
                />
              </div>
            </div>

            {/* PBR 필터 */}
            <div className="filter-group">
              <label className="filter-label">
                <span className="label-icon">💰</span>
                PBR 범위: {pbrMin} ~ {pbrMax}
              </label>
              <div className="range-inputs">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={pbrMin}
                  onChange={(e) => setPbrMin(parseFloat(e.target.value))}
                  className="range-slider"
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={pbrMax}
                  onChange={(e) => setPbrMax(parseFloat(e.target.value))}
                  className="range-slider"
                />
              </div>
            </div>

            {/* ROE 필터 */}
            <div className="filter-group">
              <label className="filter-label">
                <span className="label-icon">📈</span>
                ROE 범위: {roeMin}% ~ {roeMax}%
              </label>
              <div className="range-inputs">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={roeMin}
                  onChange={(e) => setRoeMin(parseInt(e.target.value))}
                  className="range-slider"
                />
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={roeMax}
                  onChange={(e) => setRoeMax(parseInt(e.target.value))}
                  className="range-slider"
                />
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="filter-actions">
              <button className="action-button primary" onClick={applyFilters}>
                <span className="button-icon">🔍</span>
                보물 찾기
              </button>
              <button className="action-button secondary" onClick={resetFilters}>
                <span className="button-icon">🔄</span>
                초기화
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 결과 테이블 */}
      <div className="results-section">
        <div className="results-header">
          <h3 className="results-title">
            <span className="title-icon">📋</span>
            발견된 보물들
          </h3>
          <div className="results-count">{foundCount}개 발견</div>
        </div>

        <div className="treasure-table-container">
          <table className="treasure-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('PER')} className="sortable">
                  PER {sortField === 'PER' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('PBR')} className="sortable">
                  PBR {sortField === 'PBR' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('ROE')} className="sortable">
                  ROE {sortField === 'ROE' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>기업명</th>
                <th>업종</th>
                <th>시가총액</th>
                <th>지배주주지분</th>
                <th>지배주주순이익</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => (
                <tr key={index} className="treasure-row">
                  <td className="metric-cell">
                    <div className="metric-value">{getThreeYearAvg(item.PER)}</div>
                    <div className="metric-trend">3년 평균</div>
                  </td>
                  <td className="metric-cell">
                    <div className="metric-value">{getThreeYearAvg(item.PBR)}</div>
                    <div className="metric-trend">3년 평균</div>
                  </td>
                  <td className="metric-cell">
                    <div className="metric-value">
                      {getThreeYearAvg(item.ROE) !== '-' ? `${getThreeYearAvg(item.ROE)}%` : '-'}
                    </div>
                    <div className="metric-trend">3년 평균</div>
                  </td>
                  <td className="company-cell">
                    <div className="company-name">{item.기업명}</div>
                    <div className="company-badge">{item.업종명}</div>
                  </td>
                  <td className="industry-cell">{item.업종명}</td>
                  <td className="market-cap-cell">
                    {getThreeYearAvg(item.시가총액) !== '0' 
                      ? `${(parseFloat(getThreeYearAvg(item.시가총액)) / 100000000).toFixed(0)}억원`
                      : '-'
                    }
                  </td>
                  <td className="equity-cell">
                    {(() => {
                      const avg = getThreeYearAvg(item.지배주주지분);
                      const isNotDash = avg !== '-';
                      const isNotZero = avg !== '0';
                      const parsed = parseFloat(avg);
                      const converted = parsed.toFixed(0);
                      console.log(`🔍 ${item.기업명} 지배주주지분:`, {
                        avg, isNotDash, isNotZero, parsed, converted,
                        final: isNotDash && isNotZero ? `${converted}억원` : '-'
                      });
                      return isNotDash && isNotZero 
                        ? `${converted}억원`
                        : '-';
                    })()}
                  </td>
                  <td className="income-cell">
                    {(() => {
                      const avg = getThreeYearAvg(item.지배주주순이익);
                      const isNotDash = avg !== '-';
                      const isNotZero = avg !== '0';
                      const parsed = parseFloat(avg);
                      const converted = parsed.toFixed(0);
                      console.log(`🔍 ${item.기업명} 지배주주순이익:`, {
                        avg, isNotDash, isNotZero, parsed, converted,
                        final: isNotDash && isNotZero ? `${converted}억원` : '-'
                      });
                      return isNotDash && isNotZero 
                        ? `${converted}억원`
                        : '-';
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TreasureHuntRedesigned;
