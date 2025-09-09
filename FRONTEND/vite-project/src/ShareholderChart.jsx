import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // ✅ 플러그인 import

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // ✅ 플러그인 등록
);

function ShareholderChart({ code, companyName }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch('/지분현황.json')
      .then(res => res.json())
      .then(data => {
        const key = `A${code}`;
        const rows = data[key];

        if (!rows || !Array.isArray(rows)) {
          setChartData('not-found');
          return;
        }

        const labels = rows.map(row => row.주주구분?.trim() ?? '알 수 없음');
        const 지분율 = rows.map(row => Number(row.지분율 ?? 0));
        const 대표주주수 = rows.map(row => Number(row.대표주주수 ?? 0));
        const max대표자수 = Math.max(...대표주주수);
        const y1Max = Math.max(10, Math.ceil(max대표자수 / 100) * 100);

        console.log('📊 대표주주수:', 대표주주수);

        setChartData({
          labels,
          지분율,
          대표주주수,
          y1Max
        });
      })
      .catch(err => {
        console.error('지분 데이터 불러오기 실패:', err);
        setChartData('error');
      });
  }, [code]);

  if (chartData === 'not-found') return <p>❌ {companyName}의 지분 정보가 없습니다.</p>;
  if (chartData === 'error') return <p>⚠️ 지분 정보를 불러오는 중 오류가 발생했습니다.</p>;
  if (!chartData) return <p>⏳ 지분 데이터를 불러오는 중입니다...</p>;

  const { labels, 지분율, 대표주주수, y1Max } = chartData;

  return (
    <div style={{ marginTop: '60px', fontSize: '25px'}}>
      <h3>📊 {companyName} 지분율 및 대표자 수</h3>
      <Chart
        type='bar'
        data={{
          labels,
          datasets: [
            {
              type: 'bar',
              label: '지분율 (%)',
              data: 지분율,
              backgroundColor: 'rgba(135,206,250, 0.7)',
              yAxisID: 'y',
              datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#000',
                font: {
                  size: 11,
                  weight: 'bold'
                },
                formatter: value => `${value}%` // ✅ % 단위 표시
              }
            },
            {
              type: 'line',
              label: '대표 주주 수',
              data: 대표주주수,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.3)',
              borderWidth: 2,
              pointRadius: 4,
              spanGaps: true,
              yAxisID: 'y1',
              datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#000',
                font: {
                  size: 11,
                  weight: 'bold'
                },
                formatter: value => `${value.toLocaleString()}명` // ✅ 명 단위 표시
              }
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: {
              display: true,
              text: `${companyName} 지분 구조`
            },
            datalabels: {
              display: true // ✅ 전역 사용 활성화
            }
          },
          scales: {
            y: {
              type: 'linear',
              position: 'left',
              title: {
                display: true,
                text: '지분율 (%)'
              },
              min: 0,
              max: 100,
              ticks: { stepSize: 20 }
            },
            y1: {
              type: 'linear',
              position: 'right',
              title: {
                display: true,
                text: '대표 주주 수'
              },
              grid: { drawOnChartArea: false },
              min: 0,
              max: y1Max,
              ticks: {
                stepSize: y1Max / 5
              }
            }
          }
        }}
      />
    </div>
  );
}

export default ShareholderChart;

// # ShareholderChart.jsx