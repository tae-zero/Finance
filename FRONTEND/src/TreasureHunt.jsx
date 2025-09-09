import React, { useEffect, useState } from 'react';
import 'rc-slider/assets/index.css';
import FinancialGraph from './FinancialGraph';

function TreasureHunt() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [industryFilter, setIndustryFilter] = useState('전체');
  const [industries, setIndustries] = useState([]);
  const [pbrMin, setPbrMin] = useState(0);
  const [pbrMax, setPbrMax] = useState(3);
  const [perMin, setPerMin] = useState(0);
  const [perMax, setPerMax] = useState(50);
  const [roeMin, setRoeMin] = useState(0);
  const [roeMax, setRoeMax] = useState(30);
  const [industryMetrics, setIndustryMetrics] = useState(null); // 🔸 평균 데이터 추가

  useEffect(() => {
    fetch('/industry_metrics.json')
    .then(res => res.json())
    .then(setIndustryMetrics);

    fetch('http://localhost:8000/api/treasure')
      .then(res => res.json())
      .then(json => {
        const cleaned = json.filter(item => {
          const hasAnyPER = Object.values(item.PER || {}).some(v => typeof v === 'number');
          const hasAnyPBR = Object.values(item.PBR || {}).some(v => typeof v === 'number');
          const hasAnyROE = Object.values(item.ROE || {}).some(v => typeof v === 'number');
          return hasAnyPER && hasAnyPBR && hasAnyROE;
        });
        setData(cleaned);
        setFiltered(cleaned);
        const uniqueIndustries = Array.from(new Set(cleaned.map(item => item.업종명))).sort();
        setIndustries(['전체', ...uniqueIndustries]);
      })
      .catch(err => console.error('❌ 데이터 로딩 오류:', err));
  }, []);

const applyFilters = () => {
  const filteredData = data.filter(item => {
    const perAvg = parseFloat(getThreeYearAvg(item.PER));
    const pbrAvg = parseFloat(getThreeYearAvg(item.PBR));
    const roeAvg = parseFloat(getThreeYearAvg(item.ROE));

    // 하나라도 평균값이 NaN이거나 0이면 제외
    const isValid =
      ![perAvg, pbrAvg, roeAvg].some(val => isNaN(val) || val === 0);

    const matchIndustry =
      industryFilter === '전체' || item.업종명 === industryFilter;

    return (
      matchIndustry &&
      isValid &&
      perAvg >= perMin && perAvg <= perMax &&
      pbrAvg >= pbrMin && pbrAvg <= pbrMax &&
      roeAvg >= roeMin && roeAvg <= roeMax
    );
  });

  setFiltered(filteredData);
};



  const getThreeYearAvg = (obj) => {
  const years = ['2022', '2023', '2024'];
  const values = years.map(year => obj?.[year]).filter(v => typeof v === 'number');
  if (!values.length) return '-';
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg.toFixed(2);
};


      // 평균 계산 함수: 먼저 선언
    const getAverage = (obj) => {
      const nums = Object.values(obj ?? {}).map(Number).filter(v => !isNaN(v));
      const sum = nums.reduce((a, b) => a + b, 0);
      return nums.length ? (sum / nums.length).toFixed(2) : '-';
    };

       // 평균값 붙인 라벨 생성
  const formatMetricHeaders = (metrics, 업종명) => {
    if (!metrics || !metrics[업종명]) return {
      PBR: 'PBR',
      PER: 'PER',
      ROE: 'ROE',
    };
  const avg = metrics[업종명];
    return {
        PBR: `PBR (KOSPI 산업평균: ${getAverage(avg.PBR)})`,
        PER: `PER (KOSPI 산업평균: ${getAverage(avg.PER)})`,
        ROE: `ROE (KOSPI 산업평균: ${getAverage(avg.ROE)})`,
    };
  };

const handleSort = (field) => {
  const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';

  const sorted = [...filtered].sort((a, b) => {
    const aAvg = parseFloat(getThreeYearAvg(field === '시가총액' ? a.시가총액 : a[field])) || 0;
    const bAvg = parseFloat(getThreeYearAvg(field === '시가총액' ? b.시가총액 : b[field])) || 0;
    return order === 'asc' ? aAvg - bAvg : bAvg - aAvg;
  });

  setFiltered(sorted);
  setSortField(field);
  setSortOrder(order);
};


// ⬇ 컴포넌트 안에 삽입
const renderAverageMarker = (metricKey, label, min, max) => {
  if (!industryMetrics) return null;

  const selectedIndustry = industryFilter === '전체' ? '전체 업종' : industryFilter;
  const metricData = industryMetrics[selectedIndustry]?.[metricKey];

  if (!metricData) return null;

  const years = ['2022', '2023', '2024'];
  const values = years.map(y => Number(metricData[y])).filter(v => !isNaN(v));
  if (!values.length) return null;

  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  return (
    <div style={{
      textAlign: 'center',
      fontSize: '13px',
      color: 'tomato',
      marginBottom: '6px',
      fontWeight: 'bold'
    }}>
      ▼ {selectedIndustry} {label} 평균: {avg.toFixed(2)}
    </div>
  );
};

  const labels = industryMetrics
  ? formatMetricHeaders(industryMetrics, industryFilter)
  : { PBR: 'PBR', PER: 'PER', ROE: 'ROE' };




  return (
      <div style={{
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '30px',
    border: '2px solid rgba(0, 0, 0, 0.4)',
    borderRadius: '12px',
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)'
  }}>
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '40px' }}>💰🕵️ 보물찾기 (저평가 우량주 탐색)</h2>

      {/* 두 섹션을 Flex로 묶음 */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', justifyContent: 'space-between'}}>

        {/* 왼쪽 섹션 */}
        <div style={{ flex: 1,  marginTop: '10px'   }}>
          <label style={{ fontSize: '25px'}}><strong>✔️ 업종 선택</strong></label><br />
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            style={{
              width: '100%', padding: '7px', border: '1px solid #a5a5a5', borderRadius: '6px',
              backgroundColor: 'white', fontSize: '14px', color: '#000000', marginTop: '30px', height: '40px'
            }}>
            {industries.map((industry, idx) => (
              <option key={idx} value={industry}>{industry}</option>
            ))}
          </select>

          <button
            onClick={applyFilters}
            style={{
              padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none',
              borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
              width: '100%', marginBottom: '70px', marginTop: '10px'
            }}>
            ✅ 조건 적용
          </button>

          {/* 슬라이더들 */}
          <div style={{ marginBottom: '40px', fontSize: '20px' }}>
            <label><strong>PBR 범위 (2024)</strong></label><br />
            최소 <input type="number" value={pbrMin} onChange={(e) => setPbrMin(Number(e.target.value))} style={{ width: '60px' }} />
            <input type="range" min={0} max={15} step={0.1} value={pbrMin} onChange={(e) => setPbrMin(Number(e.target.value))} />
            <input type="range" min={0} max={15} step={0.1} value={pbrMax} onChange={(e) => setPbrMax(Number(e.target.value))} />
            <input type="number" value={pbrMax} onChange={(e) => setPbrMax(Number(e.target.value))} style={{ width: '60px' }} /> 최대
          </div>

          <div style={{ marginBottom: '40px', fontSize: '20px' }}>
            <label><strong>PER 범위 (2024)</strong></label><br />
            최소 <input type="number" value={perMin} onChange={(e) => setPerMin(Number(e.target.value))} style={{ width: '60px' }} />
            <input type="range" min={0} max={100} step={0.1} value={perMin} onChange={(e) => setPerMin(Number(e.target.value))} />
            <input type="range" min={0} max={100} step={0.1} value={perMax} onChange={(e) => setPerMax(Number(e.target.value))} />
            <input type="number" value={perMax} onChange={(e) => setPerMax(Number(e.target.value))} style={{ width: '60px' }} /> 최대
          </div>

          <div style={{ marginBottom: '40px', fontSize: '20px' }}>
            <label><strong>ROE 범위 (2024)</strong></label><br />
            최소 <input type="number" value={roeMin} onChange={(e) => setRoeMin(Number(e.target.value))} style={{ width: '60px' }} />
            <input type="range" min={-50} max={80} step={0.1} value={roeMin} onChange={(e) => setRoeMin(Number(e.target.value))} />
            <input type="range" min={-50} max={80} step={0.1} value={roeMax} onChange={(e) => setRoeMax(Number(e.target.value))} />
            <input type="number" value={roeMax} onChange={(e) => setRoeMax(Number(e.target.value))} style={{ width: '60px' }} /> 최대
          </div>
        </div>

        {/* 오른쪽 섹션 */}
        <div style={{
          minWidth: '360px',
          maxWidth: '700px',
          border: '1px solid #ddd',
          borderRadius: '10px',
          padding: '20px',
          backgroundColor: '#fafafa'
        }}>
          <FinancialGraph />
    </div>
  </div>


<div style={{ display: 'flex', gap: '10px', marginBottom: '20px'}}>
  <button onClick={() => handleSort('시가총액')}>시가총액 정렬 (2024)</button>
  <button onClick={() => handleSort('PBR')}>PBR 정렬 (3년 평균)</button>
  <button onClick={() => handleSort('PER')}>PER 정렬 (3년 평균)</button>
  <button onClick={() => handleSort('ROE')}>ROE 정렬 (3년 평균)</button>
</div>

      <table border="1" width="100%" cellPadding="8">
<thead>
  <tr>
    <th rowSpan="2">기업명</th>
    <th rowSpan="2">업종명</th>
    <th colSpan="4">{labels.PBR}</th>
    <th colSpan="4">{labels.PER}</th>
    <th colSpan="4">{labels.ROE}</th>
    <th rowSpan="2">지배주주지분(단위:억 원)<br/>(2024)</th>
    <th rowSpan="2">지배주주순이익(단위:억 원)<br/>(2024)</th>
    <th rowSpan="2">시가총액(단위:억 원)<br/>(2024)</th><div style={{
  display: 'flex',
  gap: '40px',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  maxWidth: '1600px',
  margin: '0 auto',
}}>

</div>
  </tr>
  <tr>
    <th>2022</th><th>2023</th><th>2024</th><th>3년평균</th>
    <th>2022</th><th>2023</th><th>2024</th><th>3년평균</th>
    <th>2022</th><th>2023</th><th>2024</th><th>3년평균</th>
  </tr>
</thead>
<tbody>
  {filtered.map((item, idx) => (
    <tr key={idx}>
      <td>{item.기업명}</td>
      <td>{item.업종명}</td>

      <td>{item.PBR?.['2022'] ?? '-'}</td>
      <td>{item.PBR?.['2023'] ?? '-'}</td>
      <td>{item.PBR?.['2024'] ?? '-'}</td>
      <td style={{ backgroundColor: '#f9f9f9' }}>{getThreeYearAvg(item.PBR)}</td>

      <td>{item.PER?.['2022'] ?? '-'}</td>
      <td>{item.PER?.['2023'] ?? '-'}</td>
      <td>{item.PER?.['2024'] ?? '-'}</td>
      <td style={{ backgroundColor: '#f9f9f9' }}>{getThreeYearAvg(item.PER)}</td>

      <td>{item.ROE?.['2022'] ?? '-'}</td>
      <td>{item.ROE?.['2023'] ?? '-'}</td>
      <td>{item.ROE?.['2024'] ?? '-'}</td>
      <td style={{ backgroundColor: '#f9f9f9' }}>{getThreeYearAvg(item.ROE)}</td>

      <td>{item.지배주주지분?.['2024']?.toLocaleString() ?? '-'}</td>
      <td>{item.지배주주순이익?.['2024']?.toLocaleString() ?? '-'}</td>
      <td>
  {item.시가총액?.['2024']
    ? (item.시가총액['2024'] / 100000000).toFixed(1) : '-'}
</td>
    </tr>
  ))}
      </tbody>
    </table>
  </div>
  </div>
);
}

export default TreasureHunt;