function CompanySummary({ summary, outline }) {
  console.log('CompanySummary props:', { summary, outline });
  
  return (
    <div className="company-summary-container">
      {/* 📌 말풍선 본체 */}
      <div className="company-summary-bubble">
        {/* 꼬리 테두리 */}
        <div className="bubble-tail-border"></div>
        {/* 꼬리 내부 색상 */}
        <div className="bubble-tail-inner"></div>
        {/* 내용 */}
        <div className="bubble-content">
          <h3 className="bubble-title">📝 기업 요약</h3>
          <p className="bubble-text">{summary || '요약 정보 없음'}</p>
        </div>
      </div>

      {/* 📂 기업 개요 테이블 */}
      {outline && (
        <div className="company-outline-section">
          <h3 className="outline-section-title">📂 기업 개요</h3>
          <div className="outline-table-container">
            <table className="outline-table">
              <tbody>
                {Object.entries(outline).map(([key, value]) => (
                  <tr key={key}>
                    <td className="outline-key">{key}</td>
                    <td className="outline-value">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanySummary;
