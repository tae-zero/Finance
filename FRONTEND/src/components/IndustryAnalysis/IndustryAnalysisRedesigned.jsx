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
import { API_ENDPOINTS } from '../../config/api';
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
      fetch(API_ENDPOINTS.COMPANY_METRICS(encodeURIComponent(selectedCompanyLeft)))
        .then(res => res.json())
        .then(data => {
          console.log('🔍 산업분석 왼쪽 기업 재무지표:', data);
          setLeftMetrics(data);
        })
        .catch(err => {
          console.error("왼쪽 기업 데이터 로딩 오류:", err);
          setLeftMetrics(null);
        });
    }
  }, [selectedCompanyLeft]);

  useEffect(() => {
    if (selectedCompanyRight) {
      fetch(API_ENDPOINTS.COMPANY_METRICS(encodeURIComponent(selectedCompanyRight)))
        .then(res => res.json())
        .then(data => {
          console.log('🔍 산업분석 오른쪽 기업 재무지표:', data);
          setRightMetrics(data);
        })
        .catch(err => {
          console.error("오른쪽 기업 데이터 로딩 오류:", err);
          setRightMetrics(null);
        });
    }
  }, [selectedCompanyRight]);

  useEffect(() => {
    if (industry) {
      fetch("/산업별설명.json")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const industryData = data.find(item => item.industry === industry);
            setAnalysis(industryData);
            console.log('🔍 산업 데이터 검색:', industry, industryData ? '찾음' : '없음');
          } else {
            console.error("산업별설명.json 데이터가 배열이 아닙니다:", data);
            setAnalysis(null);
          }
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

  // 차트 데이터 생성
  const years = ["2022", "2023", "2024"];
  const chartData = allData?.[industry]?.[selectedMetric] ? {
    labels: years,
    datasets: [
      {
        label: "코스피 기준 업종 평균",
        data: years.map(year => {
          const value = allData[industry][selectedMetric][year];
          return typeof value === 'number' ? value : 0;
        }),
        borderColor: "#00D1B2",
        backgroundColor: "rgba(0, 209, 178, 0.1)",
        tension: 0.3,
        pointRadius: 3,
        borderWidth: 2
      }
    ]
  } : {};

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
        anchor: 'end',
        align: 'top',
        formatter: value => value,
        color: '#F7FAFC',
        font: { weight: 'bold' },
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
          callback: value => typeof value === 'number' ? value.toLocaleString() : value
        },
        grid: {
          color: 'var(--glass-border)',
          drawBorder: false
        }
      },
      y: {
        beginAtZero: false
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
                {analysis?.analysis?.요약 || '해당 산업에 대한 상세한 개요 정보가 없습니다.'}
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
                  <div className="header-cell">산업 평균</div>
                  <div className="header-cell">해석</div>
                </div>
                <div className="table-body">
                  {analysis?.analysis?.["주요 재무 지표 해석"] ? 
                    Object.entries(analysis.analysis["주요 재무 지표 해석"]).map(([metric, data]) => (
                      <div key={metric} className="table-row">
                        <div className="cell-label">{metric}</div>
                        <div className="cell-average">{data["산업 평균"]}</div>
                        <div className="cell-content">{data["해석"]}</div>
                      </div>
                    )) : (
                      <div className="table-row">
                        <div className="cell-content" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          해당 산업의 재무 지표 해석 정보가 없습니다.
                        </div>
                      </div>
                    )
                  }
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
                  {industryMetrics && typeof industryMetrics === 'object' ? 
                    Object.entries(industryMetrics).map(([key, value]) => (
                      <div key={key} className="table-row">
                        <div className="cell-label">{key}</div>
                        <div className="cell-value">{typeof value?.평균 === 'number' ? value.평균.toFixed(2) : '--'}</div>
                        <div className="cell-value">{typeof value?.최고 === 'number' ? value.최고.toFixed(2) : '--'}</div>
                        <div className="cell-value">{typeof value?.최저 === 'number' ? value.최저.toFixed(2) : '--'}</div>
                      </div>
                    )) : (
                      <div className="table-row">
                        <div className="cell-label" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          업종 평균 데이터가 없습니다.
                        </div>
                      </div>
                    )
                  }
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
              {/* 기업 비교 차트 */}
              {selectedCompanyLeft && selectedCompanyRight && leftMetrics && rightMetrics && (
                <div className="comparison-chart">
                  <h4 className="chart-title">📊 기업별 재무지표 비교 차트 (연도별)</h4>
                  <div className="chart-container">
                    <Line
                      data={{
                        labels: ['2022', '2023', '2024'],
                        datasets: [
                          {
                            label: `${selectedCompanyLeft} - PER`,
                            data: years.map(year => {
                              const value = leftMetrics['PER'];
                              if (typeof value === 'object' && value !== null) {
                                return typeof value[year] === 'number' ? value[year] : 0;
                              }
                              return 0;
                            }),
                            borderColor: '#00D1B2',
                            backgroundColor: 'rgba(0, 209, 178, 0.1)',
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.4,
                            fill: false
                          },
                          {
                            label: `${selectedCompanyLeft} - PBR`,
                            data: years.map(year => {
                              const value = leftMetrics['PBR'];
                              if (typeof value === 'object' && value !== null) {
                                return typeof value[year] === 'number' ? value[year] : 0;
                              }
                              return 0;
                            }),
                            borderColor: '#00D1B2',
                            backgroundColor: 'rgba(0, 209, 178, 0.1)',
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.4,
                            fill: false,
                            borderDash: [5, 5]
                          },
                          {
                            label: `${selectedCompanyLeft} - ROE`,
                            data: years.map(year => {
                              const value = leftMetrics['ROE'];
                              if (typeof value === 'object' && value !== null) {
                                return typeof value[year] === 'number' ? value[year] : 0;
                              }
                              return 0;
                            }),
                            borderColor: '#00D1B2',
                            backgroundColor: 'rgba(0, 209, 178, 0.1)',
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.4,
                            fill: false,
                            borderDash: [10, 5]
                          },
                          {
                            label: `${selectedCompanyLeft} - DPS`,
                            data: years.map(year => {
                              const value = leftMetrics['DPS'];
                              if (typeof value === 'object' && value !== null) {
                                return typeof value[year] === 'number' ? value[year] : 0;
                              }
                              return 0;
                            }),
                            borderColor: '#00D1B2',
                            backgroundColor: 'rgba(0, 209, 178, 0.1)',
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.4,
                            fill: false,
                            borderDash: [15, 5]
                          },
                          {
                            label: `${selectedCompanyRight} - PER`,
                            data: years.map(year => {
                              const value = rightMetrics['PER'];
                              if (typeof value === 'object' && value !== null) {
                                return typeof value[year] === 'number' ? value[year] : 0;
                              }
                              return 0;
                            }),
                            borderColor: '#FF6B6B',
                            backgroundColor: 'rgba(255, 107, 107, 0.1)',
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.4,
                            fill: false
                          },
                          {
                            label: `${selectedCompanyRight} - PBR`,
                            data: years.map(year => {
                              const value = rightMetrics['PBR'];
                              if (typeof value === 'object' && value !== null) {
                                return typeof value[year] === 'number' ? value[year] : 0;
                              }
                              return 0;
                            }),
                            borderColor: '#FF6B6B',
                            backgroundColor: 'rgba(255, 107, 107, 0.1)',
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.4,
                            fill: false,
                            borderDash: [5, 5]
                          },
                          {
                            label: `${selectedCompanyRight} - ROE`,
                            data: years.map(year => {
                              const value = rightMetrics['ROE'];
                              if (typeof value === 'object' && value !== null) {
                                return typeof value[year] === 'number' ? value[year] : 0;
                              }
                              return 0;
                            }),
                            borderColor: '#FF6B6B',
                            backgroundColor: 'rgba(255, 107, 107, 0.1)',
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.4,
                            fill: false,
                            borderDash: [10, 5]
                          },
                          {
                            label: `${selectedCompanyRight} - DPS`,
                            data: years.map(year => {
                              const value = rightMetrics['DPS'];
                              if (typeof value === 'object' && value !== null) {
                                return typeof value[year] === 'number' ? value[year] : 0;
                              }
                              return 0;
                            }),
                            borderColor: '#FF6B6B',
                            backgroundColor: 'rgba(255, 107, 107, 0.1)',
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.4,
                            fill: false,
                            borderDash: [15, 5]
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              color: 'var(--text-primary)',
                              font: { size: 12, weight: 'bold' },
                              boxWidth: 12,
                              padding: 8,
                              usePointStyle: true
                            },
                            maxHeight: 100
                          },
                          tooltip: {
                            backgroundColor: 'var(--glass-bg)',
                            titleColor: 'var(--text-primary)',
                            bodyColor: 'var(--text-primary)',
                            borderColor: 'var(--glass-border)',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                              title: context => `지표: ${context[0].label}`,
                              label: context => `${context.dataset.label}: ${typeof context.parsed.y === 'number' ? context.parsed.y.toFixed(2) : '--'}`,
                            },
                          }
                        },
                        scales: {
                          x: {
                            ticks: {
                              color: 'var(--text-secondary)',
                              font: { size: 12 }
                            },
                            grid: {
                              color: 'var(--glass-border)',
                              drawBorder: false
                            }
                          },
                          y: {
                            ticks: {
                              color: 'var(--text-secondary)',
                              font: { size: 12 },
                              callback: value => typeof value === 'number' ? value.toFixed(2) : value
                            },
                            grid: {
                              color: 'var(--glass-border)',
                              drawBorder: false
                            },
                            beginAtZero: true
                          }
                        },
                        interaction: {
                          mode: 'nearest',
                          axis: 'x',
                          intersect: false
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 기업 비교 테이블 */}
              <div className="comparison-table">
                <div className="table-header">
                  <div className="header-cell">지표</div>
                  <div className="header-cell">연도</div>
                  <div className="header-cell">{selectedCompanyLeft || '기업 1'}</div>
                  <div className="header-cell">{selectedCompanyRight || '기업 2'}</div>
                </div>
                <div className="table-body">
                  {metricList.map(metric => (
                    <React.Fragment key={metric}>
                      {years.map(year => (
                        <div key={`${metric}-${year}`} className="table-row">
                          <div className="cell-label">
                            {year === '2022' ? metric : ''}
                          </div>
                          <div className="cell-year">{year}</div>
                          <div className="cell-value">
                            {(() => {
                              const value = leftMetrics?.[metric];
                              if (typeof value === 'object' && value !== null) {
                                return typeof value[year] === 'number' ? value[year].toFixed(2) : '--';
                              }
                              return '--';
                            })()}
                          </div>
                          <div className="cell-value">
                            {(() => {
                              const value = rightMetrics?.[metric];
                              if (typeof value === 'object' && value !== null) {
                                return typeof value[year] === 'number' ? value[year].toFixed(2) : '--';
                              }
                              return '--';
                            })()}
                          </div>
                        </div>
                      ))}
                    </React.Fragment>
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
