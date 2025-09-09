import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TopRankings() {
  const [rankingData, setRankingData] = useState(null);
  const [marketCapData, setMarketCapData] = useState(null);
  const [volumeData, setVolumeData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/rankings/')
      .then(res => setRankingData(res.data))
      .catch(err => console.error("📛 랭킹 데이터 오류:", err));

    axios.get('http://localhost:8000/marketcap/')
      .then(res => setMarketCapData(res.data.시가총액_TOP10))
      .catch(err => console.error("📛 시가총액 데이터 오류:", err));

    axios.get('http://localhost:8000/top_volume')
      .then(res => {
        console.log("🔥 거래량 데이터:", res.data);
        setVolumeData(res.data);
      })
      .catch(err => console.error("📛 거래량 데이터 오류:", err));
  }, []);

  const tableStyle = {
    borderCollapse: 'collapse',
    width: '100%',
    fontSize: '14px'
  };

  const thTdStyle = {
    border: '1px solid black',
    padding: '8px',
    textAlign: 'center',
    whiteSpace: 'nowrap'
  };

  // ✅ 제목 + 단위를 좌우로 나눠 보여주는 버전
  const renderTable = (title, rows, valueKey, unit = '') => (
    <div style={{ marginBottom: '30px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {unit && <span style={{ fontSize: '14px', color: '#555' }}>{unit}</span>}
      </div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thTdStyle}>기업명</th>
            <th style={thTdStyle}>{valueKey}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, idx) => (
            <tr key={idx}>
              <td style={thTdStyle}>{item.종목명 || item.기업명 || "-"}</td>
              <td style={thTdStyle}>
                {typeof item[valueKey] === "number"
                  ? item[valueKey].toLocaleString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

const renderMarketCapTable = (rows) => (
  <div style={{ marginBottom: '30px' }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    }}>
      <h3 style={{ margin: 0 }}>🏦 시가총액 TOP 10</h3>
      <span style={{ fontSize: '14px', color: '#555' }}>(단위: 조)</span>
    </div>
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thTdStyle}>순위</th>
          <th style={thTdStyle}>기업명</th>
          <th style={thTdStyle}>시가총액</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item, idx) => (
          <tr key={item.티커}>
            <td style={thTdStyle}>{idx + 1}</td>
            <td style={thTdStyle}>{item.기업명}</td>
            <td style={thTdStyle}>{(item.시가총액 / 1e12).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

  if (!rankingData || !marketCapData || !volumeData) {
    return <p>📊 데이터를 불러오는 중입니다...</p>;
  }

  return (
    <div>
      <span title="특정 종목의 하루 거래량을 말해. 많이 거래될수록 주식이 활발히 사고팔리는 중이라는 뜻이야.">
        {renderTable("📊 거래량 TOP 5", volumeData, "거래량", "(단위: 주)")}
      </span>

      <span title="시가총액은 '회사의 주식 가격 × 주식 수'로 계산한, 그 회사의 전체 가격이야. 쉽게 말하면, 이 회사를 통째로 산다면 얼마일까? 를 나타내는 금액이야">
        {renderMarketCapTable(marketCapData)}
      </span>

      <span title="회사가 물건이나 서비스를 팔아서 벌어들인 총 매출이야. 아직 비용은 안 뺀 금액이야.">
        {renderTable("🏆 매출액 TOP 5", rankingData.매출액_TOP5, "매출액", "(단위: 억 원)")}
      </span>

      <span title="매출에서 실제 이익이 얼마나 남았는지를 비율로 보여줘. 높을수록 본업에서 돈 잘 버는 회사야.">
        {renderTable("📈 영업이익률 TOP 5", rankingData.영업이익률_TOP5, "영업이익률")}
      </span>

      <span title="주식 1주를 가진 사람이 1년 동안 받는 배당금이야. 이 숫자가 높으면 '이 주식은 배당이 쏠쏠하네'라고 볼 수 있어.">
        {renderTable("💰 DPS TOP 5", rankingData.DPS_TOP5, "DPS")}
      </span>
    </div>
  );
}

export default TopRankings;
