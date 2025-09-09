function CompanySummary({ summary, outline }) {
  return (
    <div style={{ marginTop: '50px' }}>
      {/* 📌 말풍선 본체 */}
      <div style={{
        position: 'relative',
        background: '#f8f9fa',
        border: '2px solid #ccc',
        borderRadius: '12px',
        padding: '20px',
        fontSize: '16px',
        maxWidth: '600px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
        marginBottom: '30px'
      }}>
        {/* 꼬리 테두리 */}
        <div style={{
          position: 'absolute',
          top: '-22px',
          left: '30px',
          width: 0,
          height: 0,
          borderLeft: '11px solid transparent',
          borderRight: '11px solid transparent',
          borderBottom: '22px solid #ccc',
          zIndex: 5
        }}></div>

        {/* 꼬리 내부 색상 */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '31px',
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: '20px solid #f8f9fa',
          zIndex: 10
        }}></div>

        <h3 style={{ fontSize: '25px', margin: '0 0 10px 0' }}>📝 기업 요약</h3>
        <p style={{ fontSize: '20px', margin: 0 }}>{summary || '요약 정보 없음'}</p>
      </div>

      {/* 📂 기업 개요 테이블 */}
      {outline && (
        <>
          <h3 style={{ fontSize: '25px', marginTop: '50px' }}>📂 기업 개요</h3>
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              border: '2px solid black',
              fontSize: '15px'
            }}
          >
            <tbody>
              {Object.entries(outline).map(([key, value]) => (
                <tr key={key} style={{ border: '2px solid black' }}>
                  <td
                    style={{
                      fontWeight: 'bold',
                      background: '#f4f4f4',
                      border: '2px solid black',
                      padding: '6px'
                    }}
                  >
                    {key}
                  </td>
                  <td
                    style={{
                      border: '2px solid black',
                      padding: '6px'
                    }}
                  >
                    {String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default CompanySummary;
