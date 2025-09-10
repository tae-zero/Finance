import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import CompareChart from '../../CompareChart';
import SalesTable from '../../SalesTable';
import CompanySummary from '../../CompanySummary';
import PieChart from '../../PieChart';
import ShareholderChart from '../../ShareholderChart';
import './CompanyDetailRedesigned.css';

function CompanyDetailRedesigned() {
  const { name } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [investorData, setInvestorData] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 병렬로 모든 데이터 가져오기
        const [
          companyRes,
          priceRes,
          newsRes,
          reportRes,
          investorRes,
          metricsRes
        ] = await Promise.all([
          axios.get(`${API_ENDPOINTS.COMPANY_DETAIL}/${encodeURIComponent(name)}`),
          axios.get(`${API_ENDPOINTS.PRICE_DATA}/005930.KS`), // 임시로 삼성전자 코드 사용
          axios.get(`${API_ENDPOINTS.NEWS}?keyword=${encodeURIComponent(name)}`),
          axios.get(`${API_ENDPOINTS.REPORT}?code=A005930`), // 임시로 삼성전자 코드 사용
          axios.get(`${API_ENDPOINTS.INVESTOR_DATA}?ticker=005930`), // 임시로 삼성전자 코드 사용
          fetch('/기업별_재무지표.json').then(res => res.json())
        ]);

        setCompanyData(companyRes.data);
        setPriceData(priceRes.data);
        setNewsData(newsRes.data);
        setReportData(reportRes.data);
        setInvestorData(investorRes.data);
        setMetricsData(metricsRes);
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name]);

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
                    <span className="metric-value">12.5</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">PBR</span>
                    <span className="metric-value">1.2</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">ROE</span>
                    <span className="metric-value">15.3%</span>
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
                    <span className="metric-value">450조원</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">거래량</span>
                    <span className="metric-value">1,234만주</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">52주 최고</span>
                    <span className="metric-value">85,000원</span>
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
                    industryMetrics={null}
                  />
                </div>
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
              {metricsData && (
                <CompareChart 
                  metrics={metricsData} 
                  industryMetrics={metricsData.industryMetrics}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="sales-tab">
            <h3 className="section-title">
              <span className="title-icon">📊</span>
              매출 분석
            </h3>
            <div className="sales-content">
              <SalesTable />
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
              <ShareholderChart />
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
              {newsData.slice(0, 10).map((news, index) => (
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
              ))}
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
              {reportData.slice(0, 5).map((report, index) => (
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyDetailRedesigned;
