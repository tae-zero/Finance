import React, { useEffect, useState } from 'react';
import axios from 'axios';

function formatBillions(value) {
  return (value / 1e8).toFixed(2) + ' 억원';
}

function InvestorTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/investor/value/')
      .then(res => setData(res.data))
      .catch(err => console.error('📛 투자자 데이터 오류:', err));
  }, []);

  const tableStyle = {
    borderCollapse: 'collapse',
    width: '100%',
    fontSize: '14px',
  };

  const thTdStyle = {
    border: '1px solid black',
    padding: '8px',
    textAlign: 'center', // ✅ 중앙 정렬
  };

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
            🧾 KOSPI 투자자별 매매 동향 <small style={{ fontWeight: 400 }}>*10일 기준</small>
          </h2>
        </div>
        <div style={{ fontSize: '14px', color: '#555', whiteSpace: 'nowrap' }}>(단위: 억 원)</div>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thTdStyle}>투자자</th>
            <th style={thTdStyle}>매도</th>
            <th style={thTdStyle}>매수</th>
            <th style={thTdStyle}>순매수</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td style={thTdStyle}>{row.투자자구분}</td>
              <td style={thTdStyle}>{formatBillions(row.매도)}</td>
              <td style={thTdStyle}>{formatBillions(row.매수)}</td>
              <td
                style={{
                  ...thTdStyle,
                  color: row.순매수 >= 0 ? 'blue' : 'red',
                  fontWeight: 600,
                }}
              >
                {formatBillions(row.순매수)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default InvestorTable;



// InvestorTable.jsx