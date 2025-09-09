import React, { useState } from 'react';

export default function FinancialGraph() {
  const [price, setPrice] = useState('');
  const [netIncome, setNetIncome] = useState('');
  const [equity, setEquity] = useState('');

  const pbr = price && equity ? (price / equity).toFixed(2) : '-';
  const per = price && netIncome ? (price / netIncome).toFixed(2) : '-';
  const roe = netIncome && equity ? ((netIncome / equity) * 100).toFixed(2) + '%' : '-';

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial', width: 'auto', height: 'auto' }}>
      <h2>📊 주요 재무 지표 한 눈에 알아보기!</h2>

      <div style={{
        borderRadius: '10px',
        padding: '40px',
        backgroundColor: '#fafafa',
        marginTop: '20px',
        width: '600px',
        height: '450px',
        margin: '0 auto',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' 
      }}>
      {/* 🔺 삼각형 시각화 */}
      <div style={{ position: 'relative', height: '250px', width: '500px', marginTop: '60px', marginLeft: '40px' }}>
        <svg width="100%" height="100%">
          <line x1="50%" y1="30" x2="20%" y2="160" stroke="gray" strokeWidth="2" />
          <line x1="50%" y1="30" x2="80%" y2="160" stroke="gray" strokeWidth="2" />
          <line x1="20%" y1="160" x2="80%" y2="160" stroke="gray" strokeWidth="2" />
        </svg>

  {/* 시가총액 (위 꼭짓점) */}
  <div style={{ position: 'absolute', left: 'calc(50% - 40px)', top: '-40px', textAlign: 'center' }}>
    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>💰 시가총액 </div>
    <input
      type="number"
      value={price}
      onChange={(e) => setPrice(e.target.value)}
      style={{ width: '80px', 
        marginRight: '8px',
        padding: '7px',
        border: '1px solid #a5a5a5',
        borderRadius: '6px',
        backgroundColor: 'white',
        fontSize: '14px',
        color: '#000000' }}
    />
  </div>

  {/* 지배주주지분 (좌측) */}
  <div style={{ position: 'absolute',  top: '130px', textAlign: 'center', left: '-16px' }}>
    <div style={{ fontWeight: 'bold', fontSize: '15px' }}> 📘 지배주주지분</div>
    <input
      type="number"
      value={equity}
      onChange={(e) => setEquity(e.target.value)}
      style={{ width: '80px', 
        marginRight: '8px',
        padding: '7px',
        border: '1px solid #a5a5a5',
        borderRadius: '6px',
        backgroundColor: 'white',
        fontSize: '14px',
        color: '#000000' }}
    />
  </div>

  {/* 지배주주순이익 (우측) */}
  <div style={{ position: 'absolute', top: '130px', textAlign: 'center', right: '-30px' }}>
    <div style={{ fontWeight: 'bold', fontSize: '15px' }}> 📈 지배주주순이익</div>
    <input
      type="number"
      value={netIncome}
      onChange={(e) => setNetIncome(e.target.value)}
      style={{ width: '80px', 
        marginRight: '8px',
        padding: '7px',
        border: '1px solid #a5a5a5',
        borderRadius: '6px',
        backgroundColor: 'white',
        fontSize: '14px',
        color: '#000000' }}
    />
  </div>

  {/* PBR 텍스트 – 좌변 근처 */}
  <div style={{ position: 'absolute', left: '18%', top: '68px', fontSize: '15px' }}>
    PBR: {pbr}
  </div>

  {/* PER 텍스트 – 우변 근처 */}
  <div style={{ position: 'absolute', right: '17%', top: '68px', fontSize: '15px' }}>
    PER: {per}
  </div>

  {/* ROE 텍스트 – 하단 중앙 */}
  <div style={{
    position: 'absolute',
    top: '185px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '15px'
  }}>
    ROE: {roe}
  </div>

  {/* 회사 이모지 중앙 배치 */}
  <div style={{
    position: 'absolute',
    top: '100px',
    left: 'calc(50% - 12px)',
    fontSize: '24px'
  }}>
    🏢
  </div>
</div>


        <p style={{ fontSize: '13px', color: '#777',  textAlign: 'left' }}>
          📌 PBR = 시가총액 / 지배주주지분 <br />  📌 PER = 시가총액 / 지배주주순이익 <br />  📌 ROE = 지배주주순이익 / 지배주주지분<br /><br />
          - 지배주주순이익 = 당기순이익 - 비지배주주순이익(자회사)<br />
          - 지배주주지분 = 자본총계 - 비지배주주지분(자회사)
        </p>
      </div>
    </div>
  );
}

// # FinancialGraph.jsx