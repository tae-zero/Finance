import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import IndustryExplain from './IndustryExplain';
import './IndustryAnalysis.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ChartDataLabels);

const metricList = ["PER", "PBR", "ROE", "DPS"];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function IndustryAnalysis() {
  const { industry } = useParams();
  const query = useQuery();
  const initialCompany = query.get("company");

  const [analysis, setAnalysis] = useState(null);
  const [allData, setAllData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("PER");
  const [error, setError] = useState(false);

  const [companyList, setCompanyList] = useState([]);
  const [selectedCompanyLeft, setSelectedCompanyLeft] = useState(initialCompany || "");
  const [selectedCompanyRight, setSelectedCompanyRight] = useState("");
  const [leftMetrics, setLeftMetrics] = useState(null);
  const [rightMetrics, setRightMetrics] = useState(null);
  const [industryMetrics, setIndustryMetrics] = useState(null);

  useEffect(() => {
    fetch("/industry_metrics.json")
      .then(res => res.json())
      .then(data => {
        const companies = data[industry]?.companies || [];
        const sorted = [...companies].sort();
        setCompanyList(sorted);
        if (!initialCompany && sorted.length > 0) {
          setSelectedCompanyLeft(sorted[0]);
        }
      })
      .catch(err => {
        console.error("📛 industry_metrics.json 로드 실패:", err);
        setError(true);
      });
  }, [industry]);

  useEffect(() => {
    if (initialCompany) {
      setSelectedCompanyLeft(initialCompany);
      setSelectedCompanyRight("");
    } else {
      setSelectedCompanyLeft("");
      setSelectedCompanyRight("");
      setLeftMetrics(null);
      setRightMetrics(null);
    }
  }, [industry, initialCompany]);

  useEffect(() => {
    fetch("/기업별_재무지표.json")
      .then(res => res.json())
      .then(data => {
        if (selectedCompanyLeft && data[selectedCompanyLeft]) {
          const { PER, PBR, ROE } = data[selectedCompanyLeft];
          setLeftMetrics({ PER, PBR, ROE });
        }
      })
      .catch(err => {
        console.error("📛 왼쪽 기업 지표 로드 실패:", err);
      });
  }, [selectedCompanyLeft]);

  useEffect(() => {
    fetch("/기업별_재무지표.json")
      .then(res => res.json())
      .then(data => {
        if (selectedCompanyRight && data[selectedCompanyRight]) {
          const { PER, PBR, ROE } = data[selectedCompanyRight];
          setRightMetrics({ PER, PBR, ROE });
        }
      })
      .catch(err => {
        console.error("📛 오른쪽 기업 지표 로드 실패:", err);
      });
  }, [selectedCompanyRight]);

  useEffect(() => {
    fetch("/industry_metrics.json")
      .then(res => res.json())
      .then(data => {
        setAllData(data);
        setIndustryMetrics(data[industry]);
      })
      .catch(err => {
        console.error("📛 산업 지표 요약 정보 로드 실패:", err);
        setError(true);
      });
  }, [industry]);

  useEffect(() => {
    fetch('/산업별설명.json')
      .then(res => res.json())
      .then(data => {
        const param = industry?.trim();
        const normalize = str => str.replace(/ /g, '').toLowerCase();
        const found = data.find(item => normalize(item.industry) === normalize(param));
        if (found) {
          setAnalysis(found);
        } else {
          console.warn("❗ 정확히 일치하는 industry가 없어 fallback 처리 중");
          const similar = data.find(item => normalize(param).includes(normalize(item.industry)));
          if (similar) {
            setAnalysis(similar);
          } else {
            setError(true);
          }
        }
      })
      .catch(err => {
        console.error("📛 산업 설명 파일 로딩 실패:", err);
        setError(true);
      });
  }, [industry]);

  function renderMetricChart({ companyMetrics, industryMetrics, companyName, comparisonMetrics, comparisonName }) {
    const metricKeys = ["PER", "PBR", "ROE"];

    return metricKeys.map((key) => {
      const companyMetric = companyMetrics[key];
      const industryMetricValues = industryMetrics?.[key];
      const comparisonMetric = comparisonMetrics?.[key];

      if (!companyMetric) return null;

      const years = Object.keys(companyMetric);
      const companyValues = Object.values(companyMetric);
      const industryValues = industryMetricValues ? Object.values(industryMetricValues) : null;
      const comparisonValues = comparisonMetric ? Object.values(comparisonMetric) : null;

      const datasets = [
        {
          label: `${companyName}`,
          data: companyValues,
          borderColor: 'blue',
          backgroundColor: 'rgba(0,0,255,0.1)',
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2,
        },
      ];

      if (comparisonValues) {
        datasets.push({
          label: `${comparisonName}`,
          data: comparisonValues,
          borderColor: 'green',
          backgroundColor: 'rgba(0,128,0,0.1)',
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2,
        });
      }

      if (industryValues) {
        datasets.push({
          label: `코스피 기준 업종 평균`,
          data: industryValues,
          borderColor: 'orange',
          backgroundColor: 'rgba(255,165,0,0.1)',
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2,
        });
      }

      return (
        <div key={key} className="metric-chart">
          <h4 style={{fontSize: '25px'}}>🔸 {key} 추이</h4>
          <Line
            data={{ labels: years, datasets }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true },
                tooltip: {
                  callbacks: {
                    label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}`
                  }
                },
                datalabels: {
                  anchor: 'end',
                  align: 'top',
                  formatter: value => value,
                  color: '#000',
                  font: { weight: 'bold' },
                }
              },
              scales: {
                y: { beginAtZero: false }
              }
            }}
          />
        </div>
      );
    });
  }

  if (error) return <p>❌ 산업 정보를 불러오지 못했습니다.</p>;
  if (!analysis || !allData) return <p>⏳ 데이터 로딩 중...</p>;

  const target = allData[industry];
  if (!target || !target[selectedMetric]) return <p>해당 산업의 지표 정보가 없습니다.</p>;

  const years = ["2022", "2023", "2024"];
  const chartData = {
    labels: years,
    datasets: [
      {
        label: "코스피 기준 업종 평균",
        data: years.map(year => target[selectedMetric][year]),
        borderColor: "#8884d8",
        backgroundColor: "rgba(136,132,216,0.1)",
        tension: 0.3,
        pointRadius: 3,
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="industry-container" >
      <IndustryExplain industry={analysis?.industry ?? industry} analysis={analysis?.analysis} />

      <div className="box-section" >
        <h3 style= {{fontSize: '25px'}}>📊 코스피 기준 {analysis.industry} 업종 주요 재무 지표</h3>
        <div className="metric-selector">
          {metricList.map(metric => (
            <button
              key={metric}
              className={`metric-button ${selectedMetric === metric ? 'active' : ''}`}
              onClick={() => setSelectedMetric(metric)}
            >
              {metric}
            </button>
          ))}
        </div>

        <div className="chart-wrapper">
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true },
                tooltip: {
                  callbacks: {
                    label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}`
                  }
                },
                datalabels: {
                  anchor: 'end',
                  align: 'top',
                  color: '#000',
                  font: { weight: 'bold' },
                  formatter: value => value,
                }
              },
              scales: {
                y: { beginAtZero: false }
              }
            }}
          />
        </div>
      </div>

      <div className="box-section compare-box" >
        <h2 style= {{fontSize: '25px', marginBottom: '60px'}}>📊 동종 산업 내 기업 비교하기</h2>

        <div className="select-row">
          <h3 style= {{fontSize: '20px'}}>🔵 기준 기업:</h3>
          <select
            value={selectedCompanyLeft}
            onChange={(e) => setSelectedCompanyLeft(e.target.value)}
            className="select-box"
          >
            <option value="">선택해주세요</option>
            {companyList.sort().map((name, idx) => (
              <option key={idx} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="select-row">
          <h3 style= {{fontSize: '20px'}}>🟢 비교 기업:</h3>
          <select
            value={selectedCompanyRight}
            onChange={(e) => setSelectedCompanyRight(e.target.value)}
            className="select-box"
          >
            <option value="">선택해주세요</option>
            {companyList
              .filter(name => name !== selectedCompanyLeft)
              .sort()
              .map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
          </select>
        </div>

        {leftMetrics && renderMetricChart({
          companyMetrics: leftMetrics,
          industryMetrics,
          companyName: selectedCompanyLeft,
          comparisonMetrics: selectedCompanyRight && rightMetrics ? rightMetrics : null,
          comparisonName: selectedCompanyRight
        })}
      </div>
    </div>
  );
}

export default IndustryAnalysis;
