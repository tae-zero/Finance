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
import IndustryExplain from '../../IndustryExplain';
import './IndustryAnalysisRedesigned.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ChartDataLabels);

const metricList = ["PER", "PBR", "ROE", "DPS"];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function IndustryAnalysisRedesigned() {
  const { industry } = useParams();
  const query = useQuery();
  const initialCompany = query.get("company");

  const [analysis, setAnalysis] = useState(null);
  const [allData, setAllData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("PER");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [companyList, setCompanyList] = useState([]);
  const [selectedCompanyLeft, setSelectedCompanyLeft] = useState(initialCompany || "");
  const [selectedCompanyRight, setSelectedCompanyRight] = useState("");
  const [leftMetrics, setLeftMetrics] = useState(null);
  const [rightMetrics, setRightMetrics] = useState(null);
  const [industryMetrics, setIndustryMetrics] = useState(null);

  // 아코디언 상태 관리
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    financial: true,
    metrics: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    setLoading(true);
    fetch("/industry_metrics.json")
      .then(res => res.json())
      .then(data => {
        const companies = data[industry]?.companies || [];
        const sorted = [...companies].sort();
        setCompanyList(sorted);
        if (!initialCompany && sorted.length > 0) {
          setSelectedCompanyLeft(sorted[0]);
        }
        setIndustryMetrics(data[industry]?.metrics || {});
        setAllData(data);
      })
      .catch(err => {
        console.error("산업 데이터 로딩 오류:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [industry, initialCompany]);

  useEffect(() => {
    if (selectedCompanyLeft) {
      fetch("/기업별_재무지표.json")
        .then(res => res.json())
        .then(data => {
          const companyData = data.find(item => item.기업명 === selectedCompanyLeft);
          if (companyData) {
            setLeftMetrics(companyData);
          }
        })
        .catch(err => console.error("왼쪽 기업 데이터 로딩 오류:", err));
    }
  }, [selectedCompanyLeft]);

  useEffect(() => {
    if (selectedCompanyRight) {
      fetch("/기업별_재무지표.json")
        .then(res => res.json())
        .then(data => {
          const companyData = data.find(item => item.기업명 === selectedCompanyRight);
          if (companyData) {
            setRightMetrics(companyData);
          }
        })
        .catch(err => console.error("오른쪽 기업 데이터 로딩 오류:", err));
    }
  }, [selectedCompanyRight]);

  useEffect(() => {
    if (industry) {
      fetch("/산업별설명.json")
        .then(res => res.json())
        .then(data => {
          const industryData = data.find(item => item.산업명 === industry);
          setAnalysis(industryData);
        })
        .catch(err => console.error("산업 분석 데이터 로딩 오류:", err));
    }
  }, [industry]);

  if (loading) {
    return (
      <div className="industry-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">산업 분석 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="industry-error">
        <div className="error-icon">❌</div>
        <h2>데이터를 불러올 수 없습니다</h2>
        <p>산업 분석 데이터를 가져오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  const chartData = allData?.[industry]?.chartData?.[selectedMetric] || {};

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'var(--text-primary)',
          font: {
            size: 14,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(26, 29, 46, 0.95)',
        titleColor: 'var(--accent-color)',
        bodyColor: 'var(--text-primary)',
        borderColor: 'var(--accent-color)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: context => `날짜: ${context[0].label}`,
          label: context => `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`,
        },
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--text-secondary)',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'var(--glass-border)',
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: 'var(--text-secondary)',
          font: {
            size: 12
          },
          callback: value => value.toLocaleString()
        },
        grid: {
          color: 'var(--glass-border)',
          drawBorder: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="industry-analysis-redesigned">
      {/* 헤더 섹션 */}
      <div className="industry-header">
        <div className="header-content">
          <div className="industry-title">
            <span className="title-icon">🏭</span>
            <h1>{industry} 산업 분석</h1>
          </div>
          <div className="industry-subtitle">
            {analysis?.산업개요 ? '전문적인 산업 분석과 투자 인사이트' : '산업별 상세 분석'}
          </div>
        </div>
      </div>

      {/* 아코디언 섹션들 */}
      <div className="accordion-container">
        {/* 산업 개요 섹션 */}
        <div className="accordion-section">
          <button 
            className={`accordion-header ${expandedSections.overview ? 'expanded' : ''}`}
            onClick={() => toggleSection('overview')}
          >
            <div className="accordion-title">
              <span className="accordion-icon">💡</span>
              <h3>산업 개요</h3>
            </div>
            <span className="accordion-arrow">
              {expandedSections.overview ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.overview && (
            <div className="accordion-content">
              <div className="content-text">
                {analysis?.산업개요 || '해당 산업에 대한 상세한 개요 정보가 없습니다.'}
              </div>
            </div>
          )}
        </div>

        {/* 주요 재무 지표 해석 섹션 */}
        <div className="accordion-section">
          <button 
            className={`accordion-header ${expandedSections.financial ? 'expanded' : ''}`}
            onClick={() => toggleSection('financial')}
          >
            <div className="accordion-title">
              <span className="accordion-icon">📊</span>
              <h3>주요 재무 지표 해석</h3>
            </div>
            <span className="accordion-arrow">
              {expandedSections.financial ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.financial && (
            <div className="accordion-content">
              <div className="metrics-table">
                <div className="table-header">
                  <div className="header-cell">지표명</div>
                  <div className="header-cell">해석</div>
                </div>
                <div className="table-body">
                  <div className="table-row">
                    <div className="cell-label">PER (주가수익비율)</div>
                    <div className="cell-content">
                      기업의 주가가 1주당 순이익의 몇 배인지를 나타내는 지표입니다. 
                      낮을수록 저평가, 높을수록 고평가를 의미합니다.
                    </div>
                  </div>
                  <div className="table-row">
                    <div className="cell-label">PBR (주가순자산비율)</div>
                    <div className="cell-content">
                      주가가 1주당 순자산의 몇 배인지를 나타내는 지표입니다. 
                      1보다 낮으면 순자산보다 저평가된 상태입니다.
                    </div>
                  </div>
                  <div className="table-row">
                    <div className="cell-label">ROE (자기자본이익률)</div>
                    <div className="cell-content">
                      기업이 자기자본을 얼마나 효율적으로 활용하여 이익을 창출했는지를 보여주는 지표입니다.
                    </div>
                  </div>
                  <div className="table-row">
                    <div className="cell-label">DPS (주당배당금)</div>
                    <div className="cell-content">
                      주주 1주당 지급되는 배당금의 금액을 나타내는 지표입니다.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 산업별 재무 지표 섹션 */}
        <div className="accordion-section">
          <button 
            className={`accordion-header ${expandedSections.metrics ? 'expanded' : ''}`}
            onClick={() => toggleSection('metrics')}
          >
            <div className="accordion-title">
              <span className="accordion-icon">📌</span>
              <h3>산업별 재무 지표</h3>
            </div>
            <span className="accordion-arrow">
              {expandedSections.metrics ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.metrics && (
            <div className="accordion-content">
              <div className="metrics-data-table">
                <div className="table-header">
                  <div className="header-cell">지표</div>
                  <div className="header-cell">평균값</div>
                  <div className="header-cell">최고값</div>
                  <div className="header-cell">최저값</div>
                </div>
                <div className="table-body">
                  {Object.entries(industryMetrics || {}).map(([key, value]) => (
                    <div key={key} className="table-row">
                      <div className="cell-label">{key}</div>
                      <div className="cell-value">{value?.평균?.toFixed(2) || '--'}</div>
                      <div className="cell-value">{value?.최고?.toFixed(2) || '--'}</div>
                      <div className="cell-value">{value?.최저?.toFixed(2) || '--'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="chart-section">
        <div className="chart-header">
          <h3 className="chart-title">
            <span className="title-icon">📈</span>
            코스피 기준 업종 평균
          </h3>
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
        </div>
        <div className="chart-container">
          {chartData.labels && chartData.datasets ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="no-data">
              <span className="no-data-icon">📊</span>
              <p>차트 데이터가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 기업 비교 섹션 */}
      <div className="comparison-section">
        <h3 className="section-title">
          <span className="title-icon">⚖️</span>
          기업 비교 분석
        </h3>
        <div className="comparison-content">
          <div className="company-selectors">
            <div className="selector-group">
              <label className="selector-label">기업 1</label>
              <select
                value={selectedCompanyLeft}
                onChange={(e) => setSelectedCompanyLeft(e.target.value)}
                className="company-select"
              >
                <option value="">기업을 선택하세요</option>
                {companyList.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
            <div className="selector-group">
              <label className="selector-label">기업 2</label>
              <select
                value={selectedCompanyRight}
                onChange={(e) => setSelectedCompanyRight(e.target.value)}
                className="company-select"
              >
                <option value="">기업을 선택하세요</option>
                {companyList.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>
          
          {(leftMetrics || rightMetrics) && (
            <div className="metrics-comparison">
              <div className="comparison-table">
                <div className="table-header">
                  <div className="header-cell">지표</div>
                  <div className="header-cell">{selectedCompanyLeft || '기업 1'}</div>
                  <div className="header-cell">{selectedCompanyRight || '기업 2'}</div>
                </div>
                <div className="table-body">
                  {metricList.map(metric => (
                    <div key={metric} className="table-row">
                      <div className="cell-label">{metric}</div>
                      <div className="cell-value">
                        {leftMetrics?.[metric]?.toFixed(2) || '--'}
                      </div>
                      <div className="cell-value">
                        {rightMetrics?.[metric]?.toFixed(2) || '--'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IndustryAnalysisRedesigned;
