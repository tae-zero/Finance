import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from './config/api';

function SalesTable({ name }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!name) return;
    
    console.log(`🔍 매출 데이터 요청: ${name}`);
    
    // 매출 데이터 JSON 파일에서 직접 로드
    fetch('/매출비중_chartjs_데이터.json')
      .then(res => res.json())
      .then(data => {
        // 기업명으로 매출 데이터 찾기
        const companyData = data.find(item => item.종목명 === name);
        if (companyData && companyData.data) {
          // 매출 데이터를 테이블 형태로 변환
          const tableData = companyData.data.map(item => ({
            '사업부문': '매출',
            '매출품목명': item.label || '',
            '구분': '매출액',
            '2022_12 매출액': item.value || 0,
            '2023_12 매출액': item.value || 0,
            '2024_12 매출액': item.value || 0
          }));
          
          // 수출비중 데이터 추가 (예시 데이터)
          const exportData = [
            {
              '사업부문': '수출비중',
              '매출품목명': '내수',
              '구분': '비중',
              '2022_12 매출액': '65%',
              '2023_12 매출액': '62%',
              '2024_12 매출액': '58%'
            },
            {
              '사업부문': '수출비중',
              '매출품목명': '수출',
              '구분': '비중',
              '2022_12 매출액': '35%',
              '2023_12 매출액': '38%',
              '2024_12 매출액': '42%'
            }
          ];
          
          // 기존 매출 데이터와 수출비중 데이터 합치기
          const combinedData = [...tableData, ...exportData];
          setRows(combinedData);
          console.log(`✅ ${name} 매출 데이터 로드 성공:`, combinedData);
        } else {
          console.warn(`⚠️ ${name} 매출 데이터 없음`);
          setRows([]);
        }
      })
      .catch(err => {
        console.error("매출 데이터 오류:", err);
        setRows([]);
      });
  }, [name]);

  if (rows.length === 0) return <p>📉 매출 데이터를 불러오는 중입니다...</p>;

  const tooltipMap = {
    '내수': '국내에서 발생한 매출이야.',
    '수출': '해외 수출을 통해 얻은 매출이야.',
    '로컬': '지역 사업장에서 발생한 매출이야.',
    '미분류': '구체적인 구분 없이 집계된 매출이야.',
    '비중': '전체 매출에서 이 부문이 차지하는 비율이야.',
    '수출비중': '국내외 수출 비중을 보여주는 데이터야.'
  };

  const grouped = Array.isArray(rows) ? rows.reduce((acc, row) => {
    const key = `${row['사업부문']} | ${row['매출품목명']}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {}) : {};

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
      <h3>💰 사업부문별 매출액 및 수출비중 (단위: 백만원, %)</h3>
      {Object.entries(grouped).map(([groupKey, items], idx) => (
        <div key={idx} style={{ marginBottom: '30px' }}>
          <h4 style={{ margin: '10px 0' }}>
            {groupKey.includes('수출비중') ? '🌍 ' + groupKey : groupKey}
          </h4>
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
              {Array.isArray(items) ? items.map((item, i) => (
                <tr key={i} style={borderStyle}>
                  <td style={borderStyle} title={tooltipMap[item['구분']] || ''}>{item['구분']}</td>
                  <td style={borderStyle}>{renderValue(item['2022_12 매출액'])}</td>
                  <td style={borderStyle}>{renderValue(item['2023_12 매출액'])}</td>
                  <td style={borderStyle}>{renderValue(item['2024_12 매출액'])}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={borderStyle}>데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default SalesTable;



// # SalesTable.jsx