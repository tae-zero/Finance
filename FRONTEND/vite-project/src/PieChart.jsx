import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function PieChart({ companyName }) {
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    if (!companyName) return;

    fetch('/매출비중_chartjs_데이터.json')
      .then(res => res.json())
      .then(json => {
        const matched = json.find(item => item.종목명 === companyName);
        if (matched) {
          setCompanyData(matched);
        }
      })
      .catch(err => {
        console.error("📛 데이터 로딩 오류:", err);
      });
  }, [companyName]);

  if (!companyData) return <p>📉 매출 데이터를 불러오는 중입니다...</p>;

  const data = companyData.data;
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: '제품별 매출비중',
        data: data.map(item => item.value),
        backgroundColor: [
          '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
          '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10, // 👉 그래프 내부 여백만 살짝
        bottom: 10,
        left: 20,
        right: 20,
      },
    },
    plugins: {
        legend: {
            position: 'bottom',
            align: 'start', // ✅ 실제로 왼쪽 정렬 시도
            labels: {
              boxWidth: 18,
              padding: 10,
              font: { size: 12 },
              textAlign: 'left', // ❌ 잘 안 먹히지만 추가
            },
            fullSize: true,
          },

      datalabels: {
        color: '#000',
        font: {
          weight: 'bold',
          size: 12,
        },
        offset: 10,
        clamp: true,
        align: (ctx) => {
          const value = ctx.dataset.data[ctx.dataIndex];
          const total = ctx.chart._metasets[0].total;
          const percent = (value / total) * 100;
          return percent >= 10 ? 'center' : 'end';
        },
        anchor: (ctx) => {
          const value = ctx.dataset.data[ctx.dataIndex];
          const total = ctx.chart._metasets[0].total;
          const percent = (value / total) * 100;
          return percent >= 10 ? 'center' : 'end';
        },
        formatter: (value, context) => {
          const total = context.chart._metasets[0].total;
          const percent = (value / total) * 100;
          return `${percent.toFixed(1)}%`;
        },
      },
      title: {
        display: false, // ⛔ 제목은 수동으로 밖에 넣음
      },
    },
  };

  return (
    <div style={{ height: '460px', textAlign: 'left' }}>
      <h3 style={{ marginBottom: '40px',fontSize: '30px' }}>
        📦  제품별 매출 비중 (2014.12)
      </h3>
      <Pie data={chartData} options={options} />
    </div>
  );
}

export default PieChart;

// PieChart.jsx