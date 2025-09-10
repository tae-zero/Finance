import React, { useEffect, useState } from 'react';
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
} from 'chart.js';
import { API_ENDPOINTS } from '../../config/api';
import InvestorTable from '../../investorTable';
import TopRankings from '../../TopRankings';
import './DashboardRedesigned.css';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

function DashboardRedesigned() {
  const [hotNews, setHotNews] = useState([]);
  const [mainNews, setMainNews] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [kospiData, setKospiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 병렬로 모든 데이터 가져오기
        const [hotNewsRes, mainNewsRes, kospiRes] = await Promise.all([
          axios.get(API_ENDPOINTS.HOT_NEWS),
          axios.get(API_ENDPOINTS.MAIN_NEWS),
          axios.get(API_ENDPOINTS.KOSPI_DATA)
        ]);

        setHotNews(hotNewsRes.data);
        setMainNews(mainNewsRes.data);

        // KOSPI 데이터 처리
        const kospiData = kospiRes.data;
        if (Array.isArray(kospiData) && kospiData.length > 0) {
          const labels = kospiData.map(item => item.Date);
          const closes = kospiData.map(item => parseFloat(item.Close));
          
          setKospiData({
            current: closes[closes.length - 1],
            change: closes[closes.length - 1] - closes[closes.length - 2],
            changeRate: ((closes[closes.length - 1] - closes[closes.length - 2]) / closes[closes.length - 2] * 100)
          });

          setChartData({
            labels,
            datasets: [
              {
                label: 'KOSPI 종가',
                data: closes,
                borderColor: '#00D1B2',
                backgroundColor: 'rgba(0, 209, 178, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 0,
                pointBorderWidth: 0,
                pointBackgroundColor: 'transparent',
                pointBorderColor: 'transparent',
                tension: 0.4,
                fill: true,
              }
            ]
          });
        }
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMouseEnter = (e) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const chartOptions = {
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
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return `KOSPI (${context[0].label})`;
          },
          label: function(context) {
            return `종가: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(45, 55, 72, 0.3)',
          drawBorder: false
        },
        ticks: {
          color: '#A0AEC0',
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(45, 55, 72, 0.3)',
          drawBorder: false
        },
        ticks: {
          color: '#A0AEC0',
          font: {
            size: 12
          },
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
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-redesigned">
      {/* 헤더 섹션 */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">📊</span>
            주린이 놀이터 대시보드
          </h1>
          <p className="dashboard-subtitle">
            주식 초보자를 위한 친절한 투자 정보 플랫폼
          </p>
        </div>
      </div>

      {/* KOSPI 시세 카드 - 가장 중요한 정보 */}
      <div className="kospi-card">
        <div className="card-header">
          <h2 
            className="card-title kospi-title"
            onMouseEnter={handleMouseEnter}
            onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
            onMouseLeave={handleMouseLeave}
          >
            <span className="card-icon">📈</span>
            KOSPI 최근 1년 시세 차트
          </h2>
          <div className="card-badge">실시간</div>
        </div>
        
        <div className="kospi-content">
          <div className="kospi-main">
            <div className="kospi-value">
              {kospiData ? kospiData.current.toLocaleString() : '--'}
              <span className="kospi-unit"></span>
            </div>
            <div className={`kospi-change ${kospiData && kospiData.change >= 0 ? 'positive' : 'negative'}`}>
              {kospiData ? (kospiData.change >= 0 ? '+' : '') : ''}
              {kospiData ? kospiData.change.toLocaleString() : '--'}
              <span className="change-rate">
                ({kospiData ? (kospiData.changeRate >= 0 ? '+' : '') : ''}
                {kospiData ? kospiData.changeRate.toFixed(2) : '--'}%)
              </span>
            </div>
          </div>
          
          {chartData && (
            <div className="kospi-chart">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* KOSPI 설명 텍스트 */}
        <div className="kospi-explanation">
          <p className="explanation-text">
            <span className="highlight">KOSPI 지수</span>는 <strong>(현재 상장기업 총 시가총액 ÷ 기준 시가총액) × 100</strong> 으로 계산한거야!<br />
            예를 들어 KOSPI가 2,600이라는 건 기준 시점인 <strong className="accent">1980년 1월 4일 대비 26배 성장</strong>했다는 의미야!
          </p>
        </div>
      </div>

      {/* KOSPI 툴팁 이스터에그 */}
      {showTooltip && (
        <div
          className="kospi-tooltip"
          style={{
            position: 'fixed',
            top: tooltipPosition.y + 20,
            left: tooltipPosition.x + 20,
            zIndex: 1000
          }}
        >
          <img src="/코스피위아래.jpg" alt="EASTEREGG" className="tooltip-image" />
        </div>
      )}

      {/* 뉴스 섹션 */}
      <div className="news-section">
        <div className="news-grid">
          {/* 핫뉴스 */}
          <div className="news-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon">🔥</span>
                핫뉴스
              </h3>
              <div className="card-subtitle">코스피 관련 뉴스</div>
            </div>
            <div className="news-list">
              {hotNews.slice(0, 5).map((news, index) => (
                <a key={index} href={news.link} className="news-item" target="_blank" rel="noopener noreferrer">
                  <div className="news-number">{index + 1}</div>
                  <div className="news-content">
                    <h4 className="news-title">{news.title}</h4>
                  </div>
                  <div className="news-arrow">→</div>
                </a>
              ))}
            </div>
          </div>

          {/* 실적뉴스 */}
          <div className="news-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon">📊</span>
                실적뉴스
              </h3>
              <div className="card-subtitle">기업 실적 발표</div>
            </div>
            <div className="news-list">
              {mainNews.slice(0, 5).map((news, index) => (
                <a key={index} href={news.link} className="news-item" target="_blank" rel="noopener noreferrer">
                  <div className="news-number">{index + 1}</div>
                  <div className="news-content">
                    <h4 className="news-title">{news.title}</h4>
                  </div>
                  <div className="news-arrow">→</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 퀵 액션 버튼들 */}
      <div className="quick-actions">
        <h3 className="section-title">
          <span className="title-icon">⚡</span>
          빠른 시작
        </h3>
        <div className="action-buttons">
          <button className="action-button primary">
            <span className="button-icon">🔍</span>
            <div className="button-content">
              <div className="button-title">기업 검색</div>
              <div className="button-subtitle">종목 정보 조회</div>
            </div>
          </button>
          <button className="action-button secondary">
            <span className="button-icon">🏭</span>
            <div className="button-content">
              <div className="button-title">산업 분석</div>
              <div className="button-subtitle">업종별 분석</div>
            </div>
          </button>
          <button className="action-button accent">
            <span className="button-icon">💎</span>
            <div className="button-content">
              <div className="button-title">보물찾기</div>
              <div className="button-subtitle">종목 발굴</div>
            </div>
          </button>
        </div>
      </div>

      {/* 투자자 현황 섹션 */}
      <div className="dashboard-card">
        <div className="card-header">
          <span className="card-icon">👥</span>
          <h2 className="card-title">투자자 현황</h2>
        </div>
        <InvestorTable />
      </div>

      {/* 주요 랭킹 섹션 */}
      <div className="dashboard-card">
        <div className="card-header">
          <span className="card-icon">🏆</span>
          <h2 className="card-title">주요 랭킹</h2>
        </div>
        <TopRankings />
      </div>
    </div>
  );
}

export default DashboardRedesigned;
