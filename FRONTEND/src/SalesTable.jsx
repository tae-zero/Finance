import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SalesTable({ name }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8000/sales/${name}`)
      .then(res => setRows(res.data))
      .catch(err => console.error("매출 데이터 오류:", err));
  }, [name]);

  if (rows.length === 0) return <p>📉 매출 데이터를 불러오는 중입니다...</p>;

  const tooltipMap = {
    '내수': '국내에서 발생한 매출이야.',
    '수출': '해외 수출을 통해 얻은 매출이야.',
    '로컬': '지역 사업장에서 발생한 매출이야.',
    '미분류': '구체적인 구분 없이 집계된 매출이야.',
    '비중': '전체 매출에서 이 부문이 차지하는 비율이야.'
  };

  const grouped = rows.reduce((acc, row) => {
    const key = `${row['사업부문']} | ${row['매출품목명']}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  const renderValue = val => {
    if (typeof val === 'string' && val.includes('%')) return val;
    const num = Number(val);
    return isNaN(num) ? '-' : num.toLocaleString();
  };

  const borderStyle = {
    border: '2px solid black',
    textAlign: 'center',
    whiteSpace: 'nowrap'
  };

  return (
    <div>
      <h3>💰 사업부문별 매출액 (단위: 백만원)</h3>
      {Object.entries(grouped).map(([groupKey, items], idx) => (
        <div key={idx} style={{ marginBottom: '30px' }}>
          <h4 style={{ margin: '10px 0' }}>{groupKey}</h4>
          <table style={{
            borderCollapse: 'collapse',
            width: '100%',
            border: '2px solid black'
          }}>
            <thead>
              <tr>
                <th style={borderStyle}>구분</th>
                <th style={borderStyle}>2022/12</th>
                <th style={borderStyle}>2023/12</th>
                <th style={borderStyle}>2024/12</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={borderStyle}>
                  <td style={borderStyle} title={tooltipMap[item['구분']] || ''}>{item['구분']}</td>
                  <td style={borderStyle}>{renderValue(item['2022_12 매출액'])}</td>
                  <td style={borderStyle}>{renderValue(item['2023_12 매출액'])}</td>
                  <td style={borderStyle}>{renderValue(item['2024_12 매출액'])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default SalesTable;



// # SalesTable.jsx