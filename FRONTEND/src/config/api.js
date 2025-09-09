// API 설정 파일
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // 메인 페이지
  HOT_NEWS: `${API_BASE_URL}/hot/`,
  MAIN_NEWS: `${API_BASE_URL}/main_news/`,
  KOSPI_DATA: `${API_BASE_URL}/kospi/`,
  RANKINGS: `${API_BASE_URL}/rankings/`,
  MARKET_CAP: `${API_BASE_URL}/marketcap/`,
  TOP_VOLUME: `${API_BASE_URL}/top_volume`,
  INVESTOR_VALUE: `${API_BASE_URL}/investor/value/`,
  
  // 기업 상세
  COMPANY_DETAIL: (name) => `${API_BASE_URL}/company/${name}`,
  COMPANY_NAMES: `${API_BASE_URL}/companies/names`,
  COMPANY_METRICS: (name) => `${API_BASE_URL}/company_metrics/${name}`,
  SALES_DATA: (name) => `${API_BASE_URL}/sales/${name}`,
  
  // 뉴스 및 분석
  NEWS: `${API_BASE_URL}/news/`,
  PRICE_DATA: (ticker) => `${API_BASE_URL}/price/${ticker}`,
  REPORT: `${API_BASE_URL}/report/`,
  INVESTORS: `${API_BASE_URL}/investors/`,
  
  // 산업 분석
  INDUSTRY_ANALYSIS: (name) => `${API_BASE_URL}/industry/${name}`,
  
  // 보물찾기
  TREASURE_DATA: `${API_BASE_URL}/api/treasure`
};

export default API_BASE_URL;
