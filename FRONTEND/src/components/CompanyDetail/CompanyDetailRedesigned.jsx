import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { API_ENDPOINTS } from '../../config/api';
import CompareChart from '../../CompareChart';
import SalesTable from '../../SalesTable';
import CompanySummary from '../../CompanySummary';
import PieChart from '../../PieChart';
import ShareholderChart from '../../ShareholderChart';
import './CompanyDetailRedesigned.css';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

function CompanyDetailRedesigned() {
  const { name } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [investorData, setInvestorData] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [industryMetrics, setIndustryMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [openDescriptions, setOpenDescriptions] = useState({});
  const [showSalesTable, setShowSalesTable] = useState(true);

  const toggleDescription = (metric) => {
    setOpenDescriptions(prev => ({...prev, [metric]: !prev[metric]}));
  };

  const metricDescriptions = {
    'PER': '주가가 그 회사의 이익에 비해 비싼지 싼지를 보는 숫자야. 숫자가 낮으면 "이 회사 주식이 싸네?"라고 생각할 수 있어.',
    'PBR': '회사가 가진 재산에 비해 주식이 얼마나 비싼지를 알려줘. 숫자가 높으면 "자산은 별론데 주가는 높네"일 수도 있어.',
    'ROE': '내가 투자한 돈으로 회사가 얼마나 똑똑하게 돈을 벌었는지 보여줘. 높을수록 "잘 굴리고 있네!"라는 뜻이야.',
    'ROA': '회사가 가진 모든 자산(돈, 건물 등)을 얼마나 잘 써서 이익을 냈는지 보여줘. 효율이 좋은 회사일수록 높아.',
    'DPS': '주식 1주를 가진 사람이 1년 동안 받는 배당금이야. 이 숫자가 높으면 "이 주식은 배당이 쏠쏠하네"라고 볼 수 있어.',
    'EPS': '회사가 1년에 벌어들인 이익을 주식 1주당 얼마씩 나눠 가질 수 있는지 보여줘. 많이 벌면 좋겠지!',
    'BPS': '회사가 망하고 나서 자산을 팔았을 때 주식 1주당 받을 수 있는 돈이야. 일종의 바닥 가격 같은 거야.',
    '부채비율': '회사 자본에 비해 빚이 얼마나 많은지 보여줘. 숫자가 너무 높으면 위험하다는 뜻이야.',
    '배당수익률': '이 주식을 샀을 때 1년 동안 배당으로 얼마를 벌 수 있는지 비율로 알려줘. 높으면 현금 수익이 괜찮은 거야.',
    '영업이익률': '매출에서 실제 이익이 얼마나 남았는지를 비율로 보여줘. 높을수록 본업에서 돈 잘 버는 회사야.',
    '당기순이익': '회사가 1년 동안 진짜로 벌어들인 순이익이야. 세금 등 다 빼고 남은 돈이야.',
    '매출액': '회사가 물건이나 서비스를 팔아서 벌어들인 총 매출이야. 아직 비용은 안 뺀 금액이야.',
    '영업이익': '본업으로 벌어들인 이익이야. 매출에서 인건비, 임대료 같은 비용을 뺀 금액이야.',
    '유보율': '이익 중에서 회사 안에 남겨둔 돈의 비율이야. 회사가 돈을 얼마나 모아뒀는지 보여줘.',
    '자본금': '회사를 만들 때 주주들이 처음 넣은 돈이야. 회사의 기본 씨앗 같은 존재지.',
    '자본총계': '회사가 가진 순자산이야. 자산에서 빚을 뺀 진짜 자기 돈이야.',
    '자산총계': '회사가 가지고 있는 돈, 건물, 재고 등 모든 재산의 총합이야.',
    '부채총계': '회사가 지금까지 빌린 돈이야. 갚아야 할 빚 전부를 말해.',
    '발행주식수': '회사에서 시장에 내놓은 주식 수야. EPS나 DPS 같은 걸 계산할 때 쓰여.',
    '지배주주': '우리 회사가 지배하고 있는 주주 몫이야. 다소 복잡한 지표지만 대주주 입장에서의 수익률일 수 있어.',
    '지배주주순이익': '전체 이익 중에서 우리 회사 주주들이 실제로 가져가는 순이익이야.',
    '지배주주지분': '전체 자본 중 우리 회사 주주들이 가진 몫이야. 우리 입장에서 진짜 우리 돈.',
    '비지배주주순이익': '자회사에서 벌었지만, 우리 회사가 아닌 외부 주주 몫으로 빠진 이익이야.',
    '비지배주주지분': '자회사 지분 중 우리 회사가 아닌 외부 사람들이 갖고 있는 비율이야.'
  };

  // 업종 평균 비교 분석 함수들
  const calcAverage = (values) => {
    if (!values || !Array.isArray(values)) return null;
    const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    return validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : null;
  };

  const extractMetricValues = (map, metric) => {
    if (!map || typeof map !== 'object') return [null, null, null];
    return ["2022", "2023", "2024"].map(year => map[metric]?.[year]);
  };

  const generateComparisonText = (metricName, companyName, companyVals, industryVals) => {
    const companyAvg = calcAverage(companyVals);
    const industryAvg = calcAverage(industryVals);

    if (companyAvg === null || industryAvg === null) {
      return (
        <span>
          <strong style={{ color: '#00D1B2', fontSize: '16px' }}>{companyName}</strong>
          의 <strong style={{ color: '#F7FAFC' }}>{metricName}</strong> 데이터가 부족하여{' '}
          <span style={{ color: '#FF6B6B', fontWeight: 'bold' }}>비교할 수 없습니다.</span>
        </span>
      );
    }

    const diff = Math.abs(companyAvg - industryAvg);
    const comparison = companyAvg > industryAvg ? '상향' : '하향';

    // 지표별 격차 기준 설정
    let threshold = 5; // 기본값
    if (metricName === 'PBR') threshold = 0.5;
    if (metricName === 'ROE') threshold = 7;

    const gap = diff < threshold ? '근소한 차이를 보이고 있어.' : '큰 격차를 보이고 있어.';

    return (
      <span style={{fontSize: '20px'}}>
        <strong style={{ color: '#00D1B2'}}>{companyName}</strong>
        는 3개년 <strong style={{ color: '#F7FAFC' }}>{metricName}</strong> 평균이
        <strong style={{ color: '#FFD93D' }}> {companyAvg.toFixed(2)}</strong>로,
        코스피 기준 업종 평균
        <strong style={{ color: '#6BCF7F' }}> {industryAvg.toFixed(2)}</strong>보다
        <span style={{ color: comparison === '상향' ? '#FF6B6B' : '#4DABF7', fontWeight: 'bold' }}>
          {' '}{comparison}
        </span>
        하며 {gap}
      </span>
    );
  };

  // 기업 기본 정보 로드
  useEffect(() => {
    axios.get(API_ENDPOINTS.COMPANY_DETAIL(encodeURIComponent(name)))
      .then(res => {
        setCompanyData(res.data);
        console.log('✅ 기업 정보 로드 성공:', res.data.기업명);
      })
      .catch(err => {
        console.error('❌ 기업 정보 로드 실패:', err);
        setLoading(false);
      });
  }, [name]);

  // 주가 데이터 로드
  useEffect(() => {
    if (companyData?.종목코드) {
      const code = String(companyData.종목코드).padStart(6, '0');
      const ticker = code + '.KS';
      
      axios.get(API_ENDPOINTS.PRICE_DATA(ticker))
        .then(res => {
          setPriceData(res.data);
          console.log('✅ 주가 데이터 로드 성공:', res.data);
        })
        .catch(err => {
          console.error('❌ 주가 데이터 로드 실패:', err);
        });
    }
  }, [companyData]);

  // 뉴스 데이터 로드
  useEffect(() => {
    if (companyData?.기업명) {
      axios.get(`${API_ENDPOINTS.NEWS}?keyword=${encodeURIComponent(companyData.기업명)}`)
        .then(res => {
          setNewsData(res.data);
          console.log('✅ 뉴스 데이터 로드 성공:', res.data);
        })
        .catch(err => {
          console.error('❌ 뉴스 데이터 로드 실패:', err);
        });
    }
  }, [companyData]);

  // 리포트 데이터 로드
  useEffect(() => {
    if (companyData?.종목코드) {
      const code = String(companyData.종목코드).padStart(6, '0');
      
      axios.get(`${API_ENDPOINTS.REPORT}?code=A${code}`)
        .then(res => {
          setReportData(res.data);
          console.log('✅ 리포트 데이터 로드 성공:', res.data);
        })
        .catch(err => {
          console.error('❌ 리포트 데이터 로드 실패:', err);
          setReportData([]);
        });
    }
  }, [companyData]);

  // 투자자 데이터 로드
  useEffect(() => {
    if (!companyData) {
      console.log('🔍 companyData가 아직 로드되지 않음, 대기 중...');
      return;
    }
    
    console.log('🔍 투자자 데이터 로드 시도 - companyData:', companyData);
    if (companyData?.종목코드) {
      const code = String(companyData.종목코드).padStart(6, '0');
      console.log('🔍 종목코드 변환:', companyData.종목코드, '->', code);
      
      axios.get(`${API_ENDPOINTS.INVESTORS}?ticker=${code}`)
        .then(res => {
          console.log('🔍 투자자 데이터 API 응답:', res.data);
          setInvestorData(res.data);
          console.log('✅ 투자자 데이터 로드 성공:', res.data);
        })
        .catch(err => {
          console.error('❌ 투자자 데이터 로드 실패:', err);
          setInvestorData([]);
        });
    } else {
      console.warn('⚠️ companyData 또는 종목코드가 없음:', companyData);
    }
  }, [companyData]);

  // 재무지표 데이터 로드
  useEffect(() => {
    if (!companyData) {
      console.log('🔍 companyData가 아직 로드되지 않음, 대기 중...');
      return;
    }
    
    console.log('🔍 재무지표 로드 시도 - companyData:', companyData);
    if (companyData?.기업명) {
      console.log('🔍 기업명 확인:', companyData.기업명);
      fetch('/기업별_재무지표.json')
        .then(res => {
          console.log('🔍 재무지표 JSON 응답 상태:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('🔍 재무지표 JSON 데이터 타입:', typeof data);
          console.log('🔍 재무지표 JSON 데이터 샘플:', Array.isArray(data) ? data.slice(0, 2) : Object.keys(data).slice(0, 5));
          
          let companyMetrics = null;
          
          if (Array.isArray(data)) {
            companyMetrics = data.find(item => item.기업명 === companyData.기업명);
            console.log('🔍 배열에서 검색 결과:', companyMetrics ? '찾음' : '없음');
          } else if (typeof data === 'object' && data !== null) {
            companyMetrics = data[companyData.기업명];
            console.log('🔍 객체에서 검색 결과:', companyMetrics ? '찾음' : '없음');
          }
          
          if (companyMetrics) {
            setMetricsData(companyMetrics);
            console.log('✅ 기업 지표 로드 성공:', companyData.기업명, companyMetrics);
          } else {
            console.warn('⚠️ 기업 지표 데이터 없음:', companyData.기업명);
            // 임시 하드코딩된 데이터 제공 (테스트용)
            setMetricsData({
              PER: { "2022": 15.5, "2023": 18.2, "2024": 16.8 },
              PBR: { "2022": 1.2, "2023": 1.1, "2024": 1.3 },
              ROE: { "2022": 8.5, "2023": 9.2, "2024": 10.1 },
              시가총액: { "2022": 500000000000, "2023": 550000000000, "2024": 600000000000 }
            });
            console.log('🔧 임시 데이터 사용:', companyData.기업명);
          }
        })
        .catch(err => {
          console.error('❌ 기업 지표 로드 실패:', err);
          // fallback 데이터 제공
          setMetricsData({
            PER: { "2022": 0, "2023": 0, "2024": 0 },
            PBR: { "2022": 0, "2023": 0, "2024": 0 },
            ROE: { "2022": 0, "2023": 0, "2024": 0 }
          });
        });
    } else {
      console.warn('⚠️ companyData 또는 기업명이 없음:', companyData);
    }
  }, [companyData]);

  // 업종 평균 데이터 로드
  useEffect(() => {
    if (!companyData) {
      console.log('🔍 companyData가 아직 로드되지 않음, 대기 중...');
      return;
    }
    
    console.log('🔍 업종 평균 로드 시도 - companyData:', companyData);
    if (companyData?.업종명) {
      console.log('🔍 업종명 확인:', companyData.업종명);
      fetch('/industry_metrics.json')
        .then(res => {
          console.log('🔍 업종 평균 JSON 응답 상태:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('🔍 업종 평균 JSON 데이터 타입:', typeof data);
          console.log('🔍 업종 평균 JSON 데이터 키들:', Object.keys(data).slice(0, 10));
          
          if (data[companyData.업종명]) {
            setIndustryMetrics(data[companyData.업종명]);
            console.log('✅ 업종 평균 로드 성공:', companyData.업종명, data[companyData.업종명]);
          } else {
            console.warn('⚠️ 업종 평균 데이터 없음:', companyData.업종명);
            console.log('🔍 사용 가능한 업종들:', Object.keys(data));
            // 임시 하드코딩된 업종 평균 데이터 제공 (테스트용)
            setIndustryMetrics({
              metrics: {
                PER: { "2022": 20.5, "2023": 22.1, "2024": 19.8 },
                PBR: { "2022": 1.5, "2023": 1.4, "2024": 1.6 },
                ROE: { "2022": 12.5, "2023": 13.2, "2024": 14.1 }
              }
            });
            console.log('🔧 임시 업종 평균 데이터 사용:', companyData.업종명);
          }
        })
        .catch(err => {
          console.error('📛 업종 평균 로딩 오류:', err);
        });
    } else {
      console.warn('⚠️ companyData 또는 업종명이 없음:', companyData);
    }
  }, [companyData]);

  // 로딩 상태 관리
  useEffect(() => {
    if (companyData) {
      setLoading(false);
    }
  }, [companyData]);

  // 기존 코드의 지표 처리 로직
  const rawIndicators = companyData?.지표 || {};
  const indicatorMap = {};
  const allPeriods = new Set();

  for (const [key, value] of Object.entries(rawIndicators)) {
    if (!value || value === 0) continue;
    const parts = key.split('_');
    if (parts.length < 2) continue;

    const period = parts[0];
    const metric = parts.slice(1).join('_');

    if (!indicatorMap[metric]) indicatorMap[metric] = {};
    indicatorMap[metric][period] = value;
    allPeriods.add(period);
  }

  const sortedPeriods = Array.from(allPeriods)
    .filter(period => period !== '2025/05')  // 제외
    .sort();
  const sortedMetrics = Object.keys(indicatorMap).sort();

  if (loading) {
    return (
      <div className="company-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">기업 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="company-error">
        <div className="error-icon">❌</div>
        <h2>기업 정보를 찾을 수 없습니다</h2>
        <p>검색하신 기업의 정보가 존재하지 않습니다.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '개요', icon: '📊' },
    { id: 'financial', label: '재무', icon: '💰' },
    { id: 'sales', label: '매출', icon: '📈' },
    { id: 'shareholders', label: '주주', icon: '👥' },
    { id: 'news', label: '뉴스', icon: '📰' },
    { id: 'reports', label: '리포트', icon: '📋' }
  ];

  return (
    <div className="company-detail-redesigned">
      {/* 헤더 섹션 */}
      <div className="company-header">
        <div className="header-content">
          <div className="company-info">
            <h1 className="company-name">{companyData.기업명}</h1>
            <div className="company-meta">
              <span className="company-code">{companyData.종목코드}</span>
              <span className="company-industry">{companyData.업종명}</span>
            </div>
            {companyData.짧은요약 && (
              <p className="company-summary">{companyData.짧은요약}</p>
            )}
          </div>
          
          {priceData && (
            <div className="price-info">
              <div className="current-price">
                {priceData[priceData.length - 1]?.Close?.toLocaleString() || '--'}원
              </div>
              <div className="price-change">
                <span className="change-value">+1,200원</span>
                <span className="change-rate">(+1.2%)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* 기업 요약 */}
            {companyData && (
              <>
                {console.log('기업 데이터 확인:', companyData)}
                {console.log('짧은요약:', companyData.짧은요약)}
                {console.log('개요:', companyData.개요)}
                <CompanySummary 
                  summary={companyData.짧은요약} 
                  outline={companyData.개요} 
                />
              </>
            )}
            
            {/* 주요 지표 카드 */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon">📈</span>
                  <h3>주요 지표</h3>
                </div>
                <div className="metric-content">
                  <div className="metric-item">
                    <span className="metric-label">PER</span>
                    <span className="metric-value">
                      {metricsData?.PER?.['2024'] ? metricsData.PER['2024'].toFixed(2) : '--'}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">PBR</span>
                    <span className="metric-value">
                      {metricsData?.PBR?.['2024'] ? metricsData.PBR['2024'].toFixed(2) : '--'}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">ROE</span>
                    <span className="metric-value">
                      {metricsData?.ROE?.['2024'] ? `${metricsData.ROE['2024'].toFixed(2)}%` : '--'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon">📊</span>
                  <h3>시장 정보</h3>
                </div>
                <div className="metric-content">
                  <div className="metric-item">
                    <span className="metric-label">시가총액</span>
                    <span className="metric-value">
                      {metricsData?.시가총액?.['2024'] 
                        ? `${(metricsData.시가총액['2024'] / 100000000).toFixed(0)}억원` 
                        : '--'}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">거래량</span>
                    <span className="metric-value">
                      {priceData && priceData.length > 0 
                        ? `${(priceData[priceData.length - 1]?.Volume || 0).toLocaleString()}주` 
                        : '--'}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">현재가</span>
                    <span className="metric-value">
                      {priceData && priceData.length > 0 
                        ? `${priceData[priceData.length - 1]?.Close?.toLocaleString()}원` 
                        : '--'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 차트 섹션 */}
            {metricsData && (
              <div className="chart-section">
                <h3 className="section-title">
                  <span className="title-icon">📈</span>
                  재무 지표 비교
                </h3>
                <div className="chart-container">
                  <CompareChart 
                    metrics={metricsData}
                    industryMetrics={industryMetrics?.metrics}
                    companyName={companyData?.기업명}
                  />
                </div>
              </div>
            )}

            {/* 주가 차트 */}
            {priceData && (
              <div className="chart-section">
                <h3 className="section-title">
                  <span className="title-icon">📈</span>
                  {companyData?.기업명} 최근 3년 주가
                </h3>
                <div className="chart-container">
                  {Array.isArray(priceData) && priceData.length > 0 ? (
                    <Line
                      data={{
                        labels: priceData.map(item => item.Date),
                        datasets: [{
                          label: `${companyData?.기업명} 종가 (원)`,
                          data: priceData.map(item => item.Close),
                          borderColor: '#00D1B2',
                          backgroundColor: 'rgba(0, 209, 178, 0.1)',
                          borderWidth: 2,
                          pointRadius: 0,
                          pointHoverRadius: 0,
                          tension: 0.4,
                          fill: true,
                        }]
                      }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          backgroundColor: 'rgba(26, 29, 46, 0.9)',
                          titleColor: '#F7FAFC',
                          bodyColor: '#A0AEC0',
                          borderColor: '#00D1B2',
                          borderWidth: 1,
                          callbacks: {
                            title: context => `날짜: ${context[0].label}`,
                            label: context => `종가: ${context.parsed.y.toLocaleString()}원`,
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            color: 'rgba(45, 55, 72, 0.3)',
                            drawBorder: false
                          },
                          ticks: {
                            color: '#A0AEC0',
                            font: { size: 12 }
                          }
                        },
                        y: {
                          grid: {
                            color: 'rgba(45, 55, 72, 0.3)',
                            drawBorder: false
                          },
                          ticks: {
                            color: '#A0AEC0',
                            font: { size: 12 },
                            callback: function(value) {
                              return value.toLocaleString();
                            }
                          }
                        }
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index'
                      }
                    }}
                    />
                  ) : (
                    <div className="no-data">
                      <span className="no-data-icon">📈</span>
                      <p>주가 데이터를 불러오는 중...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 투자자별 매수현황 */}
            <div className="chart-section">
              <h3 className="section-title">
                <span className="title-icon">🏦</span>
                최근 10일 기준 투자자별 순매수 추이
                <span className="section-subtitle">(단위: 억 원)</span>
              </h3>
              <div className="investor-table-container">
                <table className="investor-table">
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>기관</th>
                      <th>개인</th>
                      <th>외국인</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(investorData) && investorData.length > 0 ? investorData.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.date?.slice(0, 10) || '--'}</td>
                        <td className="right">
                          {item.기관합계 ? (item.기관합계 / 100000000).toFixed(1) : '--'}억원
                        </td>
                        <td className="right">
                          {item.개인 ? (item.개인 / 100000000).toFixed(1) : '--'}억원
                        </td>
                        <td className="right">
                          {item.외국인합계 ? (item.외국인합계 / 100000000).toFixed(1) : '--'}억원
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {Array.isArray(investorData) && investorData.length === 0 
                            ? '투자자 데이터가 없습니다.' 
                            : '투자자 데이터를 불러오는 중...'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 매출 비중 차트 */}
            {companyData && (
              <div className="chart-section">
                <h3 className="section-title">
                  <span className="title-icon">🥧</span>
                  매출 비중 분석
                </h3>
                <PieChart companyName={companyData.기업명} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="financial-tab">
            <h3 className="section-title">
              <span className="title-icon">💰</span>
              재무 정보
            </h3>
            <div className="financial-content">
              {/* 업종 평균 비교 분석 */}
              {companyData && industryMetrics && metricsData && (
                <div className="comparison-analysis">
                  <h4 className="analysis-title">📊 업종 평균 대비 분석</h4>
                  <div className="analysis-content">
                    {['PER', 'PBR', 'ROE'].map(metric => {
                      const companyVals = extractMetricValues(metricsData, metric);
                      const industryVals = extractMetricValues(industryMetrics?.metrics, metric);
                      return (
                        <div key={metric} className="metric-comparison">
                          <div className="comparison-text">
                            {generateComparisonText(metric, companyData.기업명, companyVals, industryVals)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 재무지표 설명 시스템 */}
              <div className="metrics-explanation">
                <h4 className="explanation-title">📚 재무지표 설명</h4>
                <div className="explanation-grid">
                  {Object.entries(metricDescriptions).slice(0, 6).map(([metric, description]) => (
                    <div key={metric} className="explanation-item">
                      <button 
                        className="explanation-button"
                        onClick={() => toggleDescription(metric)}
                      >
                        <span className="metric-name">{metric}</span>
                        <span className="toggle-icon">
                          {openDescriptions[metric] ? '▼' : '▶'}
                        </span>
                      </button>
                      {openDescriptions[metric] && (
                        <div className="explanation-content">
                          {description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 차트 섹션 */}
              {metricsData && (
                <div className="chart-section">
                  <h4 className="chart-title">📈 재무 지표 비교</h4>
                  <CompareChart 
                    metrics={metricsData} 
                    industryMetrics={industryMetrics?.metrics}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="sales-tab">
            <div className="sales-header">
              <h3 className="section-title">
                <span className="title-icon">📊</span>
                매출 분석
              </h3>
              <button 
                className="toggle-sales-button"
                onClick={() => setShowSalesTable(!showSalesTable)}
              >
                {showSalesTable ? '매출 테이블 숨기기' : '매출 테이블 보기'}
              </button>
            </div>
            <div className="sales-content">
              {showSalesTable && <SalesTable name={name} />}
              {companyData && (
                <div className="sales-chart">
                  <h4 className="chart-title">📈 매출 비중 분석</h4>
                  <PieChart companyName={companyData.기업명} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'shareholders' && (
          <div className="shareholders-tab">
            <h3 className="section-title">
              <span className="title-icon">👥</span>
              주주 현황
            </h3>
            <div className="shareholders-content">
              <ShareholderChart 
                code={companyData?.종목코드?.replace('A', '') || '005930'} 
                companyName={companyData?.기업명 || name} 
              />
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="news-tab">
            <h3 className="section-title">
              <span className="title-icon">📰</span>
              관련 뉴스
            </h3>
            <div className="news-list">
              {Array.isArray(newsData) ? newsData.slice(0, 10).map((news, index) => (
                <a
                  key={index}
                  href={news.link}
                  className="news-item"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="news-number">{index + 1}</div>
                  <div className="news-content">
                    <h4 className="news-title">{news.title}</h4>
                  </div>
                  <div className="news-arrow">→</div>
                </a>
              )) : (
                <div className="news-loading">
                  <p>뉴스 데이터를 불러오는 중...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-tab">
            <h3 className="section-title">
              <span className="title-icon">📋</span>
              증권사 리포트
            </h3>
            <div className="reports-list">
              {Array.isArray(reportData) ? reportData.slice(0, 5).map((report, index) => (
                <div key={index} className="report-card">
                  <div className="report-header">
                    <div className="report-date">{report.date}</div>
                    <div className="report-opinion">{report.opinion}</div>
                  </div>
                  <h4 className="report-title">{report.title}</h4>
                  <p className="report-summary">{report.summary}</p>
                  <div className="report-footer">
                    <div className="report-target">
                      목표가: {report.target_price}
                    </div>
                    <div className="report-analyst">{report.analyst}</div>
                  </div>
                </div>
              )) : (
                <div className="reports-loading">
                  <p>리포트 데이터를 불러오는 중...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyDetailRedesigned;
