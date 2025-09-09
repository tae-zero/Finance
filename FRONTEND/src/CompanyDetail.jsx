import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './CompanyDetail.css';
import SalesTable from './SalesTable';
import CompanySummary from './CompanySummary';
import CompareChart from './CompareChart';
import PieChart from './PieChart';
import ShareholderChart from './ShareholderChart';


ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

function CompanyDetail() {
  const { name } = useParams();
  const [company, setCompany] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [news, setNews] = useState([]);
  const [report, setReport] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [error, setError] = useState(false);
  const [showSalesTable, setShowSalesTable] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const navigate = useNavigate();
  const [industryMetrics, setIndustryMetrics] = useState(null);
  const [jsonIndicators, setJsonIndicators] = useState(null);
  const [openDescriptions, setOpenDescriptions] = useState({});
  const toggleDescription = (metric) => {
  setOpenDescriptions(prev => ({...prev, [metric]: !prev[metric],})); };



  const metricDescriptions = {
    'PER': '주가가 그 회사의 이익에 비해 비싼지 싼지를 보는 숫자야. 숫자가 낮으면 "이 회사 주식이 싸네?"라고 생각할 수 있어.',
    'PBR': '회사가 가진 재산에 비해 주식이 얼마나 비싼지를 알려줘. 숫자가 높으면 "자산은 별론데 주가는 높네"일 수도 있어.',
    'ROE': '내가 투자한 돈으로 회사가 얼마나 똑똑하게 돈을 벌었는지 보여줘. 높을수록 "잘 굴리고 있네!"라는 뜻이야.',
    'ROA': '회사가 가진 모든 자산(돈, 건물 등)을 얼마나 잘 써서 이익을 냈는지 보여줘. 효율이 좋은 회사일수록 높아.',
    'DPS': '주식 1주를 가진 사람이 1년 동안 받는 배당금이야. 이 숫자가 높으면 "이 주식은 배당이 쏠쏠하네"라고 볼 수 있어.',
    'EPS': '회사가 1년에 벌어들인 이익을 주식 1주당 얼마씩 나눠 가질 수 있는지 보여줘. 많이 벌면 좋겠지!',
    'BPS': '회사가 망하고 나서 자산을 팔았을 때 주식 1주당 받을 수 있는 돈이야. 일종의 바닥 가격 같은 거야.',
    '부채비율': '회사 자본에 비해 빚이 얼마나 많은지 보여줘. 숫자가 너무 높으면 위험하다는 뜻이야.',
    '배당수익률': '이 주식을 샀을 때 1년 동안 배당으로 얼마를 벌 수 있는지 비율로 알려줘. 높으면 현금 수익이 괜찮은 거야.',
    '영업이익률': '매출에서 실제 이익이 얼마나 남았는지를 비율로 보여줘. 높을수록 본업에서 돈 잘 버는 회사야.',
    '당기순이익': '회사가 1년 동안 진짜로 벌어들인 순이익이야. 세금 등 다 빼고 남은 돈이야.',
    '매출액': '회사가 물건이나 서비스를 팔아서 벌어들인 총 매출이야. 아직 비용은 안 뺀 금액이야.',
    '영업이익': '본업으로 벌어들인 이익이야. 매출에서 인건비, 임대료 같은 비용을 뺀 금액이야.',
    '유보율': '이익 중에서 회사 안에 남겨둔 돈의 비율이야. 회사가 돈을 얼마나 모아뒀는지 보여줘.',
    '자본금': '회사를 만들 때 주주들이 처음 넣은 돈이야. 회사의 기본 씨앗 같은 존재지.',
    '자본총계': '회사가 가진 순자산이야. 자산에서 빚을 뺀 진짜 자기 돈이야.',
    '자산총계': '회사가 가지고 있는 돈, 건물, 재고 등 모든 재산의 총합이야.',
    '부채총계': '회사가 지금까지 빌린 돈이야. 갚아야 할 빚 전부를 말해.',
    '발행주식수': '회사에서 시장에 내놓은 주식 수야. EPS나 DPS 같은 걸 계산할 때 쓰여.',
    '지배주주': '우리 회사가 지배하고 있는 주주 몫이야. 다소 복잡한 지표지만 대주주 입장에서의 수익률일 수 있어.',
    '지배주주순이익': '전체 이익 중에서 우리 회사 주주들이 실제로 가져가는 순이익이야.',
    '지배주주지분': '전체 자본 중 우리 회사 주주들이 가진 몫이야. 우리 입장에서 진짜 우리 돈.',
    '비지배주주순이익': '자회사에서 벌었지만, 우리 회사가 아닌 외부 주주 몫으로 빠진 이익이야.',
    '비지배주주지분': '자회사 지분 중 우리 회사가 아닌 외부 사람들이 갖고 있는 비율이야.'}

  useEffect(() => {
    axios.get(`http://localhost:8000/company/${encodeURIComponent(name)}`)
      .then(res => {
        setCompany(res.data);
        setError(false);

        const code = String(res.data.종목코드).padStart(6, '0');
        const ticker = code + '.KS';

        axios.get(`http://localhost:8000/price/${ticker}`)
          .then(priceRes => setPriceData(priceRes.data));

        axios.get(`http://localhost:8000/news/?keyword=${encodeURIComponent(res.data.기업명)}`)
          .then(newsRes => setNews(newsRes.data));

        axios.get(`http://localhost:8000/report/?code=A${code}`)
          .then(repRes => setReport(repRes.data));

        axios.get(`http://localhost:8000/investors/?ticker=${code}`)
          .then(res => setInvestors(res.data))
          .catch(err => console.error("📛 투자자 매매 데이터 오류:", err));

        axios.get(`http://localhost:8000/company_metrics/${encodeURIComponent(name)}`)
          .then(res => setMetrics(res.data));
      })
      .catch(err => {
        console.error('기업 정보 요청 실패:', err);
        setError(true);
      });
  }, [name]);

  useEffect(() => {
    if (company?.업종명) {
      axios.get('/industry_metrics.json')
        .then(res => {
          if (res.data[company.업종명]) {
            setIndustryMetrics(res.data[company.업종명]);
          }
        })
        .catch(err => {
          console.error('📛 업종 평균 로딩 오류:', err);
        });
    }
  }, [company]);


  useEffect(() => {
    fetch('/기업별_재무지표.json')
      .then(res => res.json())
      .then(data => setJsonIndicators(data))
      .catch(err => console.error('❌ JSON 불러오기 실패:', err));
  }, []);

  if (error) return <p>❌ 기업 정보를 불러올 수 없습니다.</p>;
  if (!company) return <p>⏳ 기업 정보를 불러오는 중입니다...</p>;

  const rawIndicators = company.지표 || {};
  const indicatorMap = {};
  const allPeriods = new Set();

  for (const [key, value] of Object.entries(rawIndicators)) {
    if (!value || value === 0) continue;
    const parts = key.split('_');
    if (parts.length < 2) continue;

    const period = parts[0];
    const metric = parts.slice(1).join('_');

    if (!indicatorMap[metric]) indicatorMap[metric] = {};
    indicatorMap[metric][period] = value;
    allPeriods.add(period);
  }

  const sortedPeriods = Array.from(allPeriods)
  .filter(period => period !== '2025/05')  // 제외
  .sort();
  const sortedMetrics = Object.keys(indicatorMap).sort();
  const code = String(company.종목코드).padStart(6, '0');

function calcAverage(arr) {
  const valid = arr.filter(v => typeof v === 'number' && !isNaN(v));
  if (valid.length === 0) return null;
  return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2));
}


function extractMetricValues(map, metric) {
  return ["2022", "2023", "2024"].map(year => map[metric]?.[year]);
}


function generateComparisonText(metricName, companyName, companyVals, industryVals) {
  const companyAvg = calcAverage(companyVals);
  const industryAvg = calcAverage(industryVals);

  if (companyAvg === null || industryAvg === null) {
    return (
  <span>
    <strong style={{ color: '#007acc', fontSize: '16px' }}>{companyName}</strong>
    의 <strong style={{ color: '#333' }}>{metricName}</strong> 데이터가 부족하여{' '}
    <span style={{ color: 'red', fontWeight: 'bold' }}>비교할 수 없습니다.</span>
  </span>
);
  }

  const diff = Math.abs(companyAvg - industryAvg);
  const comparison = companyAvg > industryAvg ? '상향' : '하향';

  // 지표별 격차 기준 설정
  let threshold = 5; // 기본값
  if (metricName === 'PBR') threshold = 0.5;
  if (metricName === 'ROE') threshold = 7;

  const gap = diff < threshold ? '근소한 차이를 보이고 있어.' : '큰 격차를 보이고 있어.';

  return (
  <span style={{fontSize: '20px'}}>
    <strong style={{ color: '#007acc'}}>{companyName}</strong>
    는 3개년 <strong style={{ color: '#333' }}>{metricName}</strong> 평균이
    <strong style={{ color: '#d35400' }}> {companyAvg}</strong>로,
    코스피 기준 업종 평균
    <strong style={{ color: '#27ae60' }}> {industryAvg}</strong>보다
    <span style={{ color: comparison === '상향' ? '#e74c3c' : '#2980b9', fontWeight: 'bold' }}>
      {' '}{comparison}
    </span>
    하며 {gap}
  </span>
);
}


      
  return (
    
    <div style={{
  maxWidth: '1440px',
  margin: '0 auto',
  padding: '50px',
  marginLeft: '30px',
  border: '2px solid rgba(0, 0, 0, 0.4)',
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
}}>
  {/* 기업 정보 + 기업 요약 + 종가 차트 */}
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '60px'
  }}>
    {/* 왼쪽: 기업 정보 + 요약 */}
 <div style={{ flex: '1' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
    {/* 왼쪽: 기업명 */}
    <h2 style={{ fontSize: '30px', margin: 0 }}>
      🏢 {company.기업명}
    </h2>

    {/* 오른쪽: 업종명 + 종목코드 (작게) */}
    <div style={{ fontSize: '18px', color: '#555', textAlign: 'right', lineHeight: '1.5' , marginRight: '15px', marginTop: '5px'}}>
      업종명: {company.업종명}<br />
      종목코드: {code}
    </div>
  </div>

  {/* 기업 요약 말풍선 */}
  <CompanySummary summary={company.짧은요약} outline={company.개요} />



      {/* <div style={{ fontSize: '20px', marginTop: '20px' }}><strong>업종명:</strong> {company.업종명}</div>
      <div style={{ fontSize: '20px' }}><strong>종목코드:</strong> {code}</div> */}
    </div>

    {/* 오른쪽: 종가 차트 */}
    <div style={{ flex: '2' }}>
      <h2 style={{ fontSize: '25px', marginBottom: '20px', marginTop: '170px' }}>📈 {company.기업명} 최근 3년 주가</h2>
      {priceData.length > 0 ? (
        <Line
          data={{
            labels: priceData.map(item => item.Date),
            datasets: [{
              label: `${company.기업명} 종가 (원)`,
              data: priceData.map(item => item.Close),
              borderColor: 'blue',
              backgroundColor: 'rgba(0,0,255,0.1)',
              tension: 0.3,
              pointRadius: 0,
              borderWidth: 2,
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              datalabels: { display: false },
              legend: { display: true },
              title: { display: false },
              tooltip: {
                callbacks: {
                  title: context => `날짜: ${context[0].label}`,
                  label: context => `${context.parsed.y.toLocaleString()} 원`
                }
              }
            },
            scales: {
              x: { ticks: { display: false }, grid: { display: false } },
              y: {
                ticks: {
                  callback: value => value.toLocaleString() + ' 원'
                }
              }
            }
          }}
        />
      ) : (
        <p>📉 종가 데이터를 불러오는 중입니다...</p>
      )}
    </div>
  </div>


      {/* 지분 구조 */}
      <div style={{ marginTop: '60px' }}>
          <ShareholderChart code={code} companyName={company.기업명} />
      </div>

      {/* 제품별 매출 비중 + 매출 구성 세부표 양쪽 배치 */}
      <div style={{ display: 'flex', gap: '40px', marginTop: '50px', fontSize: '20px' }}>
        {/* 제품별 매출 비중 */}
        <div style={{ flex: 1 }}>
         <div><PieChart companyName={company.기업명} /></div>
        </div>

        {/* 매출 구성 세부표 */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '40px',  fontSize: '26.8px' }}>
            <h3 style={{ margin: 0 }}>📁 매출 구성 세부표</h3>
            <button
              onClick={() => setShowSalesTable(prev => !prev)}
              style={{ fontSize: '14px', padding: '4px 10px', cursor: 'pointer' }}
            >
              {showSalesTable ? '숨기기 ▲' : '보기 ▼'}
            </button>
          </div>
          {showSalesTable && <SalesTable name={company.기업명} />}
        </div>
      </div>

      {/* ———— 재무지표 제목 + 설명 + 버튼 영역 ———— */}
      <div style={{ marginTop: '200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{  fontSize: '35px' }}>📊 기업 주요 재무 지표</h2>
          <button
          onClick={() =>
            navigate(
              `/industry/${encodeURIComponent(company.업종명)}?company=${encodeURIComponent(company.기업명)}`
            )
          }
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          📊 다른 기업과 비교하기
        </button>
        </div>

        <p style={{ color: '#555', marginBottom: '16px', fontSize: '24px' }}>
          기업의 재무 지표를 <strong>표</strong>와 <strong>그래프</strong> 형태로 표현했어!<br />
          표에서는 <strong>연도별 수치</strong>를 확인할 수 있고, 그래프에서는 <strong>{company.업종명} 업종 평균과 비교한 추이</strong>를 시각적으로 확인할 수 있어!
          <br/><br/>
        </p>
        <p style={{ color: '#555', marginBottom: '0px', fontSize: '24px' }}>
          <u><strong> 🪄 버튼을 누르면 설명이 나와!</strong></u><br/><br/><br/>
        </p>

          <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start', fontSize: '30px'}}>
            {/* 좌측 - 요약 재무지표 표 */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <h3 style={{ magint: 0}}>📑 요약 재무지표</h3>
                <span style={{ fontSize: '19px', color: '#666' }}>매출액,당기순이익,영업이익(단위: 억 원)</span>
              </div>
            <table className="indicator-table">
              <thead>
                <tr>
                  <th>지표명</th>
                  {sortedPeriods.map(period => (
                    <th key={period}>{period}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedMetrics.filter(metric => !metric.includes('.1') && metric !== '시가총액').map(metric => (
                  <tr key={metric}>
                    {/* <td title={metricDescriptions[metric] || ''}>
                      <span style={{ color: 'blue', cursor: 'help' }}>{metric}</span>
                    </td> */}
                    <td style={{ position: 'relative' }}>
                      <span style={{ color: 'blue' }}>{metric}</span>

                      {/* ❓ 아이콘 버튼 */}
                      <span
                        onClick={() => toggleDescription(metric)}
                        style={{
                          marginLeft: '8px',
                          color: '#888',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'inline-block',
                        }}
                        title="지표 설명 보기"
                      >
                        🪄
                      </span>

                      {/* 떠 있는 설명 창 */}
                      {openDescriptions[metric] && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '24px',
                            left: '0',
                            zIndex: 100,
                            backgroundColor: '#f8f8f8',
                            border: '1px solid #ddd',
                            padding: '10px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#333',
                            width: '550px',
                            boxShadow: '0 0 8px rgba(0,0,0,0.1)',
                            whiteSpace: 'normal',
                          }}
                        >
                          {metricDescriptions[metric] || '설명 없음'}
                        </div>
                      )}
                    </td>

                    {sortedPeriods.map(period => {
                      const value = indicatorMap[metric][period];
                      return (
                        <td key={period} className="right">
                          {value !== undefined ? Number(value).toLocaleString() : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 우측 - 재무지표 그래프 */}
          {/* 우측 - 재무지표 그래프 */}
          {metrics && industryMetrics && jsonIndicators && (
            <div style={{ flex: 1 }}>
              <h3>📈 업종 평균과 비교한 재무지표 그래프</h3>

              {/* PER */}
              <CompareChart
                companyName={company.기업명}
                metrics={{ PER: metrics.PER }}
                industryMetrics={{ PER: industryMetrics.PER }}
                industryName={company.업종명}
              />
              <p style={{ fontSize: '14px', color: '#333', marginTop: '8px' }}>
                {generateComparisonText(
                  'PER',
                  company.기업명,
                  extractMetricValues(jsonIndicators[company.기업명], 'PER'),
                  extractMetricValues(industryMetrics, 'PER')
                )}
              </p>

              {/* PBR */}
              <CompareChart
                companyName={company.기업명}
                metrics={{ PBR: metrics.PBR }}
                industryMetrics={{ PBR: industryMetrics.PBR }}
                industryName={company.업종명}
              />
              <p style={{ fontSize: '14px', color: '#333', marginTop: '8px' }}>
                {generateComparisonText(
                  'PBR',
                  company.기업명,
                  extractMetricValues(jsonIndicators[company.기업명], 'PBR'),
                  extractMetricValues(industryMetrics, 'PBR')
                )}
              </p>

              {/* ROE */}
              <CompareChart
                companyName={company.기업명}
                metrics={{ ROE: metrics.ROE }}
                industryMetrics={{ ROE: industryMetrics.ROE }}
                industryName={company.업종명}
              />
              <p style={{ fontSize: '14px', color: '#333', marginTop: '8px' }}>
                {generateComparisonText(
                  'ROE',
                  company.기업명,
                  extractMetricValues(jsonIndicators[company.기업명], 'ROE'),
                  extractMetricValues(industryMetrics, 'ROE')
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 뉴스 + 리포트 */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', marginTop: '40px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{fontSize: '25px'}}>📰 관련 뉴스</h3>
          <ul>
            {news.length > 0 ? news.map((item, idx) => (
              <li key={idx}><a href={item.link} target="_blank" rel="noreferrer">{item.title}</a></li>
            )) : <li>뉴스를 불러오는 중입니다...</li>}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{fontSize: '25px'}}>📄 증권사 리포트</h3>
          <ul>
            {report.length > 0 ? report.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '12px' }}>
                <strong style={{fontSize: '18px'}}>[{item.date}]</strong><br />
                <span style={{ fontSize: '1em' }}>제목: {item.title} — <em>{item.analyst}</em></span><br />
                <span style={{ fontSize: '1em' }}>요약: {item.summary}</span><br />
                <span style={{ fontSize: '1em' }}>목표 주가: {item.target_price}</span>
              </li>
            )) : <li>리포트를 불러오는 중입니다...</li>}
          </ul>
        </div>
      </div>

      {/* 투자자 매매 데이터 */}
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '60px',
}}>
  <h3 style={{ margin: 0, fontSize: '25px'}}>🏦 최근 10일 기준 투자자별 순매수 추이</h3>
  <span style={{ fontSize: '16px', color: '#555' }}>(단위 : 억 원)</span>
</div>

{investors.length > 0 ? (
  <table className="indicator-table" style={{marginTop: '30px', fontSize: '1em'}}>
    <thead>
      <tr>
        <th>날짜</th>
        <th>기관</th>
        <th>개인</th>
        <th>외국인</th>
      </tr>
    </thead>
    <tbody>
      {investors.map((item, idx) => (
        <tr key={idx}>
          <td>{item.date.slice(0, 10)}</td>
          <td className="right">{item.기관합계.toLocaleString()} 원</td>
          <td className="right">{item.개인.toLocaleString()} 원</td>
          <td className="right">{item.외국인합계.toLocaleString()} 원</td>
        </tr>
      ))}
    </tbody>
  </table>
) : (
  <p>📉 투자자별 매매 데이터를 불러오는 중입니다...</p>
)}

    </div>
  );
}

export default CompanyDetail;

// # CompanyDetail.jsx