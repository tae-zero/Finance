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

  // 데이터 유효성 검사
  if (!metrics || !industryMetrics || !companyName) {
    return <div>데이터를 불러오는 중...</div>;
  }

  return (
    <div style={{ marginTop: '40px' }}>
      {metricKeys.map((key) => {
        const companyMetric = metrics[key];
        const industryMetric = industryMetrics[key];

        // 데이터가 없으면 건너뛰기
        if (!companyMetric || !industryMetric) {
          console.log(`⚠️ ${key} 데이터 없음:`, { companyMetric, industryMetric });
          return null;
        }

        const years = Object.keys(companyMetric || {});
        const companyValues = Object.values(companyMetric || {});
        const industryValues = Object.values(industryMetric || {});

        // 데이터가 충분하지 않으면 건너뛰기
        if (years.length === 0 || companyValues.length === 0 || industryValues.length === 0) {
          console.log(`⚠️ ${key} 데이터 부족:`, { years, companyValues, industryValues });
          return null;
        }

        // Recharts용 데이터 포맷으로 변환
        const chartData = years.map((year, index) => ({
          year: year,
          [companyName]: companyValues[index] || 0,
          '코스피 기준 업종 평균': industryValues[index] || 0
        }));

        console.log(`✅ ${key} 차트 데이터:`, chartData);

        return (
          <div key={key} style={{ maxWidth: '800px', margin: '40px auto', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
            <h4 style={{fontSize: '25px', marginBottom: '20px', textAlign: 'center', color: '#333'}}>
              📊 {key} 추이 비교
            </h4>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#666' }}
                  axisLine={{ stroke: '#666' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#666' }}
                  axisLine={{ stroke: '#666' }}
                />
                <Tooltip 
                  formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) : value, name]}
                  labelFormatter={(label) => `연도: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Line
                  type="monotone"
                  dataKey={companyName}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  name={companyName}
                />
                <Line
                  type="monotone"
                  dataKey="코스피 기준 업종 평균"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                  name="코스피 기준 업종 평균"
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