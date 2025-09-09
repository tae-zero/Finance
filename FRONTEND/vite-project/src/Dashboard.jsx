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
import InvestorTable from './InvestorTable';
import TopRankings from './TopRankings';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

function App() {
  const [hotNews, setHotNews] = useState([]);
  const [mainNews, setMainNews] = useState([]);
  const [chartData, setChartData] = useState(null);


  useEffect(() => {
    axios.get('http://localhost:8000/hot/')
      .then(res => setHotNews(res.data))
      .catch(err => console.error("📛 핫뉴스 오류:", err));

    axios.get('http://localhost:8000/main_news/')
      .then(res => setMainNews(res.data))
      .catch(err => console.error("📛 실적뉴스 오류:", err));

    axios.get('http://localhost:8000/kospi/')
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
    <>
      <div
        className="dashboard-container"
        style={{
          maxWidth: '1400px',
          padding: '20px',
          border: '2px solid rgba(0, 0, 0, 0.4)',       // ✅ 검은 테두리
          borderRadius: '10px',             // ✅ 모서리 둥글게
          boxShadow: '0 0 10px rgba(0,0,0,0.05)', // ✅ 그림자
          backgroundColor: 'white'          // ✅ 배경 흰색
        }}>
        <div className="insight-panel">
          <section>
            <TopRankings />
          </section>
        </div>

        <main className="content-wrapper">
          {/* 뉴스 좌우 배치 컨테이너 */}
          <section style={{
            display: 'flex',
            gap: '40px',
            marginBottom: '40px',
            flexWrap: 'wrap',
          }}>
            {/* 왼쪽 - 핫 뉴스 */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>📌 최신 핫뉴스</h2>
              <ul>
                {hotNews.length > 0 ? hotNews.map((item, idx) => (
                  <li key={idx}>
                    <a href={item.link} target="_blank" rel="noreferrer">{item.title}</a>
                  </li>
                )) : <li>뉴스를 불러오는 중입니다...</li>}
              </ul>
            </div>

            {/* 오른쪽 - 실적 발표 뉴스 */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>📰 실적 발표 뉴스</h2>
              <ul>
                {mainNews.length > 0 ? mainNews.map((item, idx) => (
                  <li key={idx}>
                    <a href={item.link} target="_blank" rel="noreferrer">{item.title}</a>
                  </li>
                )) : <li>뉴스를 불러오는 중입니다...</li>}
              </ul>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'inline-block'  }}
            onMouseEnter={handleMouseEnter}
            onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
            onMouseLeave={handleMouseLeave}
            >📈 KOSPI 최근 1년 시세 차트</h2>
             {showTooltip && (
              <div
                style={{
                  position: 'fixed',
                  top: tooltipPosition.y + 20,
                  left: tooltipPosition.x + 20,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  padding: '8px',
                  borderRadius: '6px',
                  boxShadow: '0 0 6px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                }}
              >
                <img src="/코스피위아래.jpg" alt="EASTEREGG" style={{ width: '400px' }} />
              </div>
            )}


            {chartData ? (
              <>
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {datalabels: { // disables추가
                               display: false // ✅ 데이터 라벨 숨기기
                              },
                      legend: { display: true },
                      title: { display: true},
                      tooltip: {
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
                        ticks: { display: false },
                        grid: { display: false },
                      },
                      y: {
                        ticks: {
                          callback: value => value.toLocaleString() + ' pt',
                        },
                      },
                    },
                  }}
                />
                <p style={{ fontSize: '14px', color: '#666', marginTop: '16px' }}>
                  KOSPI 지수는 <strong>(현재 상장기업 총 시가총액 ÷ 기준 시가총액) × 100</strong> 으로 계산한거야!<br />
                  예를 들어 KOSPI가 2,600이라는 건 기준 시점인 <strong>1980년 1월 4일 대비 26배 성장</strong>했다는 의미야!
                </p>
              </>
            ) : (
              <p>📉 KOSPI 데이터를 불러오는 중입니다...</p>
            )}
          </section>

          <section>
            <InvestorTable />
          </section>
        </main>
      </div>
    </>
  );
}

export default App;

// # Dashboard.jsx