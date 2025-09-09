import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ChartDataLabels);

const CompareChart = ({ metrics, industryMetrics, companyName }) => {
  const metricKeys = ["PER", "PBR", "ROE"];

  return (
    <div style={{ marginTop: '40px' }}>
      {metricKeys.map((key) => {
        const companyMetric = metrics[key];
        const industryMetric = industryMetrics[key];

        if (!companyMetric || !industryMetric) return null;

        const years = Object.keys(companyMetric || {});
        const companyValues = Object.values(companyMetric || {});
        const industryValues = Object.values(industryMetric || {});

        return (
          <div key={key} style={{ maxWidth: '600px', margin: '40px auto' }}>
            <h4 style={{fontSize: '25px'}}>{key} 추이</h4>
            <Line
              data={{
                labels: years,
                datasets: [
                  {
                    label: `${companyName}`,
                    data: companyValues,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0,0,255,0.1)',
                    tension: 0.3,
                    pointRadius: 3,
                    borderWidth: 2,
                  },
                  {
                    label: `코스피 기준 업종 평균`,
                    data: industryValues,
                    borderColor: 'orange',
                    backgroundColor: 'rgba(255,165,0,0.1)',
                    tension: 0.3,
                    pointRadius: 3,
                    borderWidth: 2,
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                  tooltip: {
                    callbacks: {
                      label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}`
                    }
                  },
                  datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#000',
                    font: {
                      weight: 'bold'
                    },
                    formatter: value => value
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false
                  }
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default CompareChart;

// # CompareChart.jsx