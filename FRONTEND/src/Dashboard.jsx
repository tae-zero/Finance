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
import './App.css';
import InvestorTable from './investorTable';
import TopRankings from './TopRankings';
import { API_ENDPOINTS } from './config/api';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

function App() {
  const [hotNews, setHotNews] = useState([]);
  const [mainNews, setMainNews] = useState([]);
  const [chartData, setChartData] = useState(null);


  useEffect(() => {
    axios.get(API_ENDPOINTS.HOT_NEWS)
      .then(res => setHotNews(res.data))
      .catch(err => console.error("📛 핫뉴스 오류:", err));

    axios.get(API_ENDPOINTS.MAIN_NEWS)
      .then(res => setMainNews(res.data))
      .catch(err => console.error("📛 실적뉴스 오류:", err));

    axios.get(API_ENDPOINTS.KOSPI_DATA)
      .then(res => {
        const data = res.data;
        if (!Array.isArray(data) || data.length === 0) {
          console.warn("⚠️ KOSPI 데이터 없음");
          return;
        }
        const labels = data.map(item => item.Date);
        const closes = data.map(item => parseFloat(item.Close));
        setChartData({
          labels,
          datasets: [
            {
              label: 'KOSPI 종가',
              data: closes,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.1)',
              tension: 0.3,
              pointRadius: 0,
              borderWidth: 2,
            },
          ],
        });
      })
      .catch(err => console.error("📛 KOSPI 오류:", err));
  }, []);

  // 코스피 주석 이미지
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
    <div className="main-content fade-in">
      {/* 헤더 섹션 */}
      <div className="card mb-5">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient bg-clip-text text-transparent">
            주린이 놀이터
          </h1>
          <p className="text-lg text-secondary opacity-90">
            주린이를 위한 친절한 주식투자 대시보드
          </p>
        </div>
      </div>

      {/* 시가총액 랭킹 섹션 */}
      <div className="card slide-in-right">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-2xl font-bold text-warning">시가총액 TOP 10</h2>
        </div>
        <TopRankings />
      </div>

      <main className="content-wrapper">
        {/* 뉴스 좌우 배치 컨테이너 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 왼쪽 - 핫 뉴스 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📌</span>
              <h2 className="text-xl font-bold text-primary">최신 핫뉴스</h2>
            </div>
            <div className="space-y-3">
              {hotNews.length > 0 ? hotNews.map((item, idx) => (
                <div key={idx} className="news-item hover:scale-105 transition-all duration-300">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block p-3 rounded-lg hover:bg-glass transition-all duration-300"
                  >
                    <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </a>
                </div>
              )) : (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <div className="loading-text">뉴스를 불러오는 중입니다...</div>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽 - 실적 발표 뉴스 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📰</span>
              <h2 className="text-xl font-bold text-success">실적 발표 뉴스</h2>
            </div>
            <div className="space-y-3">
              {mainNews.length > 0 ? mainNews.map((item, idx) => (
                <div key={idx} className="news-item hover:scale-105 transition-all duration-300">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block p-3 rounded-lg hover:bg-glass transition-all duration-300"
                  >
                    <h3 className="font-semibold text-sm line-clamp-2 hover:text-success transition-colors">
                      {item.title}
                    </h3>
                  </a>
                </div>
              )) : (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <div className="loading-text">뉴스를 불러오는 중입니다...</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* KOSPI 차트 섹션 */}
        <div className="chart-container">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📈</span>
            <h2 
              className="text-2xl font-bold text-accent cursor-pointer hover:text-primary transition-colors"
              onMouseEnter={handleMouseEnter}
              onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
              onMouseLeave={handleMouseLeave}
            >
              KOSPI 최근 1년 시세 차트
            </h2>
            {showTooltip && (
              <div
                className="fixed z-50 bg-white border border-gray-300 p-2 rounded-lg shadow-lg"
                style={{
                  top: tooltipPosition.y + 20,
                  left: tooltipPosition.x + 20,
                }}
              >
                <img src="/코스피위아래.jpg" alt="EASTEREGG" className="w-96 rounded" />
              </div>
            )}
          </div>
          
          {chartData ? (
            <div className="chart-wrapper" style={{ height: '400px' }}>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    datalabels: { 
                      display: false
                    },
                    legend: { 
                      display: true,
                      labels: {
                        color: 'var(--light-text)',
                        font: {
                          size: 14,
                          weight: '600'
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: 'white',
                      bodyColor: 'white',
                      borderColor: 'var(--primary-color)',
                      borderWidth: 1,
                      mode: 'index',
                      intersect: false,
                      callbacks: {
                        title: context => `날짜: ${context[0].label}`,
                        label: context => `KOSPI 지수: ${context.parsed.y.toLocaleString()} pt`,
                      },
                    },
                  },
                  interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false,
                  },
                  scales: {
                    x: {
                      ticks: { 
                        display: false,
                        color: 'var(--light-text-secondary)'
                      },
                      grid: { 
                        display: false,
                        color: 'var(--glass-border)'
                      },
                    },
                    y: {
                      ticks: {
                        color: 'var(--light-text-secondary)',
                        font: {
                          size: 12
                        },
                        callback: value => value.toLocaleString() + ' pt',
                      },
                      grid: {
                        color: 'var(--glass-border)'
                      }
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">KOSPI 데이터를 불러오는 중입니다...</div>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-glass rounded-lg border border-glass-border">
            <p className="text-sm text-secondary leading-relaxed">
              <span className="font-semibold text-primary">KOSPI 지수</span>는 <strong>(현재 상장기업 총 시가총액 ÷ 기준 시가총액) × 100</strong> 으로 계산한거야!<br />
              예를 들어 KOSPI가 2,600이라는 건 기준 시점인 <strong className="text-accent">1980년 1월 4일 대비 26배 성장</strong>했다는 의미야!
            </p>
          </div>
        </div>

        {/* 투자자 현황 섹션 */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">👥</span>
            <h2 className="text-2xl font-bold text-error">투자자 현황</h2>
          </div>
          <InvestorTable />
        </div>
        </main>
      </div>
  );
}

export default App;

// # Dashboard.jsx