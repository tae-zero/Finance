import React from 'react';
import './IndustryAnalysis.css';

function IndustryExplain({ industry, analysis }) {
  if (!analysis) return <p>⏳ 산업 정보를 불러오는 중입니다...</p>;

  return (
    <div >
      <h2 style={{fontSize: '35px'}}>📘 {industry} 산업 분석</h2>

      {analysis.개요 && (
        <section>
          <h3 style={{fontSize: '25px'}}>📂 산업 개요</h3>
          <p className="pre-line">{analysis.개요}</p>
        </section>
      )}

      {analysis.요약 && (
        <section className="section-spacing">
          <h3 style= {{fontSize: '25px'}}>💡 산업 요약</h3>
          {typeof analysis.요약 === 'string' ? (
            <p className="pre-line">{analysis.요약}</p>
          ) : (
            <ul className="default-ul">
              {Object.entries(analysis.요약).map(([key, value], idx) => (
                <li key={idx} className="li-spacing">
                  <strong className="pre-line">{key}</strong>
                  <div className="pre-line li-value">{value}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {analysis["주요 재무 지표 해석"] && (
        <section className="section-spacing">
          <h3 style={{fontSize: '25px'}}>📊 주요 재무 지표 해석</h3>
          <table className="styled-table">
            <thead>
              <tr>
                <th>지표명</th>
                <th>산업 평균</th>
                <th>해석</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analysis["주요 재무 지표 해석"]).map(([key, value]) => (
                <tr key={key}>
                  <td><strong>{key}</strong></td>
                  <td>{value["산업 평균"] ?? "-"}</td>
                  <td className="pre-line">{value["해석"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {Array.isArray(analysis["산업 체크포인트"]) && (
        <section className="section-spacing">
          <h3 style= {{fontSize: '25px'}}>📌 산업 체크포인트</h3>
          <table className="styled-table">
            <thead>
              <tr>
                <th>항목</th>
                <th>설명</th>
              </tr>
            </thead>
            <tbody>
              {analysis["산업 체크포인트"].map((item, idx) => (
                <tr key={idx}>
                  <td>{item.항목}</td>
                  <td className="pre-line">{item.설명}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default IndustryExplain;
