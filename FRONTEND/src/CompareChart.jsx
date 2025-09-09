import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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

        // Recharts용 데이터 포맷으로 변환
        const chartData = years.map((year, index) => ({
          year: year,
          [companyName]: companyValues[index],
          '코스피 기준 업종 평균': industryValues[index]
        }));

        return (
          <div key={key} style={{ maxWidth: '800px', margin: '40px auto' }}>
            <h4 style={{fontSize: '25px', marginBottom: '20px', textAlign: 'center'}}>
              {key} 추이 비교
            </h4>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#666' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#666' }}
                />
                <Tooltip 
                  formatter={(value, name) => [value.toFixed(2), name]}
                  labelFormatter={(label) => `연도: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={companyName}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="코스피 기준 업종 평균"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
};

export default CompareChart;

// # CompareChart.jsx