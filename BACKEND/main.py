from fastapi import FastAPI, Request,HTTPException,Query
from fastapi.responses import JSONResponse
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import yfinance as yf
import time
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import chromedriver_autoinstaller
from pymongo import MongoClient
from pykrx.stock import get_market_trading_volume_by_date
import json
import os
from pykrx.stock import get_market_trading_value_by_investor
from pykrx import stock


app = FastAPI()

# CORS 설정 - 배포 환경에 맞게 수정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://finance-dashboard-git-main-jeongtaeyeongs-projects.vercel.app",  # 실제 Vercel 도메인
        "https://*.vercel.app"  # Vercel의 모든 하위 도메인 허용
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB 연결 - 환경변수 사용
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = MongoClient(MONGODB_URL)

# 환경 설정
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# Chrome 드라이버 자동 설치
def setup_chrome_driver():
    """Railway 환경에서 Chrome 드라이버를 자동으로 설정"""
    try:
        # Chrome 드라이버 자동 설치
        chromedriver_autoinstaller.install()
        
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920x1080')
        options.add_argument('--disable-extensions')
        options.add_argument('--disable-plugins')
        options.add_argument('--disable-images')
        options.add_argument('--disable-javascript')
        
        # Railway 환경에서 안정적인 Chrome 드라이버 설정
        service = Service()
        driver = webdriver.Chrome(service=service, options=options)
        return driver
    except Exception as e:
        print(f"Chrome 드라이버 설정 실패: {e}")
        return None

db = client["testDB"]
collection = db["users"]
explain = db['explain']
outline = db['outline']
industry=db['industry_metrics']

#백엔드 메인페이지
@app.get("/")
async def index():
    return {"message": "✅ FastAPI 서버 실행 중: /hot /news /price/<ticker> 사용 가능"}


#기업 상세페이지 기업개요, 기업 설명
@app.get("/company/{name}")
def get_full_company_data(name: str):
    base = collection.find_one({"기업명": name}, {"_id": 0})
    if not base:
        raise HTTPException(status_code=404, detail="기업을 찾을 수 없습니다.")

    # 1. 짧은요약 (explain 컬렉션)
    explain_doc = explain.find_one({"기업명": name}, {"_id": 0, "짧은요약": 1})
    if explain_doc:
        base["짧은요약"] = explain_doc.get("짧은요약")

    # 2. outline 정보 (outline 컬렉션)
    code = base.get("종목코드")
    if code:
        outline_doc = outline.find_one({"종목코드": code}, {"_id": 0})
        if outline_doc:
            base["개요"] = outline_doc

    return base

#기업 재무재표
@app.get("/companies/names")
def get_all_company_names():
    cursor = collection.find({}, {"_id": 0, "기업명": 1})
    names = [doc["기업명"] for doc in cursor if "기업명" in doc]
    if not names:
        raise HTTPException(status_code=404, detail="기업명이 없습니다.")
    return names


# 메인페이지 코스피 키워드 뉴스 리스트
@app.get("/hot/")
async def hot_news():
    driver = setup_chrome_driver()
    if not driver:
        return JSONResponse(content={"error": "Chrome 드라이버 초기화 실패"}, status_code=500)

    driver.get('https://search.daum.net/nate?w=news&nil_search=btn&DA=PGD&enc=utf8&cluster=y&cluster_page=1&q=코스피')

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()

    path = '#dnsColl > div:nth-child(1) > ul > li > div.c-item-content > div > div.item-title > strong > a'
    a_tags = soup.select(path)

    news_list = [{"title": a.text.strip(), "link": a['href']} for a in a_tags[:5]]
    return JSONResponse(content=news_list)

# 메인페이지 실적 발표 키워드 리스트
@app.get("/main_news/")
async def main_news():
    driver = setup_chrome_driver()
    if not driver:
        return JSONResponse(content={"error": "Chrome 드라이버 초기화 실패"}, status_code=500)

    driver.get('https://search.daum.net/nate?w=news&nil_search=btn&DA=PGD&enc=utf8&cluster=y&cluster_page=1&q=실적 발표')

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()

    path = '#dnsColl > div:nth-child(1) > ul > li > div.c-item-content > div > div.item-title > strong > a'
    a_tags = soup.select(path)

    news_list = [{"title": a.text.strip(), "link": a['href']} for a in a_tags[:5]]
    return JSONResponse(content=news_list)


# 기업 상세페이지 해당 기업 키워드 뉴스 리스트
@app.get("/news/")
async def search_news(request: Request):
    keyword = request.query_params.get('keyword')
    if not keyword:
        return JSONResponse(content={"error": "keyword 파라미터가 필요합니다"}, status_code=400)

    driver = setup_chrome_driver()
    if not driver:
        return JSONResponse(content={"error": "Chrome 드라이버 초기화 실패"}, status_code=500)
    search_url = f'https://search.daum.net/nate?w=news&nil_search=btn&DA=PGD&enc=utf8&cluster=y&cluster_page=1&q={keyword}'
    driver.get(search_url)
    time.sleep(2)

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()

    a_tags = soup.select('#dnsColl > div:nth-child(1) > ul > li > div.c-item-content > div > div.item-title > strong > a')
    print(f"'{keyword}' 뉴스 개수: {len(a_tags)}")

    news_list = [{"title": a.text.strip(), "link": a['href']} for a in a_tags[:10]]
    return JSONResponse(content=news_list)


# 기업상세페이지 해당 기업 주가 시세
@app.get("/price/{ticker}")
def get_price_data(ticker: str):
    try:
        # yfinance로 데이터 받기
        df = yf.download(ticker, period="3y", interval="1d")

        if df.empty:
            return {"error": "데이터 없음"}

        # 필요한 컬럼만 추출 후 인덱스 리셋
        df = df[['Close']].reset_index()

        # Date 컬럼을 문자열로 변환
        df['Date'] = df['Date'].astype(str)

        # 필요한 컬럼만 JSON friendly로 구성
        result = [{"Date": row['Date'], "Close": float(row['Close'])} for _, row in df.iterrows()]
        return result

    except Exception as e:
        return {"error": str(e)}


# 기업상세페이지 종목분석 리포트
@app.get("/report/")
def get_report_summary(code: str = Query(..., description="종목 코드 (예: A005930)")):
    driver = setup_chrome_driver()
    if not driver:
        return JSONResponse(content={"error": "Chrome 드라이버 초기화 실패"}, status_code=500)

    url = f"https://comp.fnguide.com/SVO2/ASP/SVD_Consensus.asp?pGB=1&gicode={code}&MenuYn=Y&ReportGB=&NewMenuID=108"
    driver.get(url)
    time.sleep(2)

    data = []
    try:
        rows = driver.find_elements(By.XPATH, '//*[@id="bodycontent4"]/tr')
        for row in rows:
            try:
                date = row.find_element(By.XPATH, './td[1]').text.strip()
                title = row.find_element(By.XPATH, './td[2]//span[@class="txt2"]').text.strip()
                summary_parts = row.find_elements(By.XPATH, './td[2]//dd')
                summary = " / ".join([p.text.strip() for p in summary_parts if p.text.strip()])

                # 추가 항목: 투자의견, 목표주가, 전일종가
                opinion = ""
                try:
                    opinion = row.find_element(By.XPATH, './td[3]/span').text[1].strip()
                except:
                    pass

                target_price = ""
                try:
                    target_price = row.find_element(By.XPATH, './td[4]/span').text.strip()
                except:
                    pass

                closing_price = ""
                try:
                    closing_price = row.find_element(By.XPATH, './td[5]').text.strip()
                except:
                    pass

                analyst = ""
                try:
                    analyst = row.find_element(By.XPATH, './td[6]').text.strip()
                except:
                    pass

                data.append({
                    "date": date,
                    "title": title,
                    "summary": summary,
                    "opinion": opinion,
                    "target_price": target_price,
                    "closing_price": closing_price,
                    "analyst": analyst
                })

                if len(data) >= 5:
                    break

            except Exception as e:
                print("⚠️ 행 파싱 중 오류 발생:", e)
                continue
    finally:
        driver.quit()

    return data



# 메인페이지 코스피 지수
@app.get("/kospi/")
def get_kospi_data():
    try:
        # 오늘 날짜 계산 (한국 기준으로 하루 빼줌)
        today = datetime.today().date()
        yesterday = today - timedelta(days=1)

        df = yf.download("^KS11", period="1y", interval="1d", auto_adjust=True, end=str(today))

        if df.empty:
            return JSONResponse(content={"error": "데이터가 없습니다."}, status_code=400)

        # Close 컬럼 찾기
        close_col = None
        for col in df.columns:
            if isinstance(col, tuple):
                if "Close" in col:
                    close_col = col
                    break
            elif col == "Close":
                close_col = col
                break

        if close_col is None:
            return JSONResponse(content={"error": f"Close 컬럼이 없습니다. 컬럼 목록: {df.columns.tolist()}"}, status_code=400)

        df = df[[close_col]].reset_index()
        df.columns = ['Date', 'Close']
        df['Date'] = df['Date'].astype(str)
        df['Close'] = df['Close'].astype(float)

        return JSONResponse(content=df.to_dict(orient="records"))

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


# 0을 제외한 해당 기업 종목 재무제표 리스트
@app.get("/sales/{name}")
def get_sales_by_name(name: str):
    df = pd.read_csv("NICE_내수수출_코스피.csv")
    grouped = df.groupby(['종목명', '사업부문', '매출품목명', '구분'])[['2022_12 매출액', '2023_12 매출액', '2024_12 매출액']].sum()

    if name not in grouped.index.get_level_values(0):
        raise HTTPException(status_code=404, detail="해당 기업 없음")

    filtered = grouped.loc[name].reset_index()
    return filtered.to_dict(orient="records")

# 기업상세피이지 해당기업 기관, 외국인, 기관 매수,매도량
@app.get("/investors/")
def get_investor_summary(ticker: str = Query(..., description="종목 코드 (예: 005930)")):
    try:
        # 기간 설정: 오늘 ~ 3개월 전
        end = datetime.today()
        start = end - timedelta(days=10)

        # 날짜 포맷
        start_str = start.strftime("%Y%m%d")
        end_str = end.strftime("%Y%m%d")

        # 데이터 조회
        df = get_market_trading_volume_by_date(start_str, end_str, ticker)

        if df.empty:
            return {"error": "조회된 데이터가 없습니다."}

        # 날짜 인덱스를 컬럼으로
        df.reset_index(inplace=True)
        df.rename(columns={"날짜": "date"}, inplace=True)

        # 기타법인 컬럼 제거 (있을 경우)
        remove_cols = ["기타법인"]
        for col in remove_cols:
            if col in df.columns:
                df.drop(columns=[col], inplace=True)

        # 숫자형 변환
        for col in df.columns:
            if col != "date":
                df[col] = df[col].astype(int)

        # JSON 변환
        return df.to_dict(orient="records")

    except Exception as e:
        return {"error": str(e)}


# 메인페이지 산업별 재무지표 분석 정보 조회
@app.get("/industry/{name}")
def get_industry_analysis(name: str):
    try:
        with open("산업별설명.json", encoding="utf-8") as f:
            data = json.load(f)
        name = name.strip()
        for item in data:
            if item.get("industry") == name:
                return item
        raise HTTPException(status_code=404, detail="해당 산업 정보 없음")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="산업별설명.json 파일 없음")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")


# 메인페이지 기업 재무지표 JSON
@app.get("/company_metrics/{name}")
def get_company_metrics(name: str):
    try:
        with open("기업별_재무지표.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        if name in data:
            return JSONResponse(content=data[name])
        else:
            raise HTTPException(status_code=404, detail="해당 기업 지표 없음")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# 메인페이지 투자자별 매수, 매도량 코스피 총 기준
@app.get("/investor/value/")
def get_kospi_investor_value():
    try:
        # 최근 10일 날짜 계산
        end_date = datetime.today()
        start_date = end_date - timedelta(days=10)

        start = start_date.strftime("%Y%m%d")
        end = end_date.strftime("%Y%m%d")

        # pykrx 데이터
        df = get_market_trading_value_by_investor(start, end, "KOSPI")

        # 날짜 인덱스가 맞는지 확인하고 변환
        try:
            df.index = pd.to_datetime(df.index, format="%Y%m%d")
            df.index = df.index.strftime('%Y-%m-%d')
            df = df.reset_index(names="날짜")
        except:
            df = df.reset_index()  # fallback

        return df.to_dict(orient="records")

    except Exception as e:
        return {"error": str(e)}



# 메인페이지 매출액, DPS, 영업이익률 상위 5개 리스트
@app.get("/rankings/")
def get_top_rankings():
    try:
        # MongoDB에서 필요한 데이터만 조회
        cursor = collection.find({
            "지표.2024/12_매출액": {"$exists": True},
            "지표.2024/12_DPS": {"$exists": True},
            "지표.2024/12_영업이익률": {"$exists": True}

        }, {
            "기업명": 1,
            "지표.2024/12_매출액": 1,
            "지표.2024/12_DPS": 1,
            "지표.2024/12_영업이익률": 1

        })

        df = pd.json_normalize(list(cursor)).rename(columns={
            "기업명": "기업명",
            "지표.2024/12_매출액": "매출액",
            "지표.2024/12_DPS": "DPS",
            "지표.2024/12_영업이익률": "영업이익률"

        })

        # 숫자 변환
        for col in ["매출액", "DPS", "영업이익률"]:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        # 각각 상위 5개 추출
        result = {
            "매출액_TOP5": df.nlargest(5, "매출액")[["기업명", "매출액"]].to_dict(orient="records"),
            "DPS_TOP5": df.nlargest(5, "DPS")[["기업명", "DPS"]].to_dict(orient="records"),
            "영업이익률_TOP5": df.nlargest(5, "영업이익률")[["기업명", "영업이익률"]].to_dict(orient="records"),

        }

        return result

    except Exception as e:
        return {"error": str(e)}

#시가총액 top 10
@app.get("/marketcap/")
def get_marketcap_top10():
    try:
        today = datetime.today().strftime("%Y%m%d")

        # KOSPI 시가총액 전체 종목 불러오기
        df = stock.get_market_cap_by_ticker(today, market="KOSPI")

        # 필요한 컬럼만 선택
        df = df.reset_index()[["티커", "시가총액", "종가"]]
        df["기업명"] = df["티커"].apply(lambda x: stock.get_market_ticker_name(x))

        # 상위 10개 기업 정렬
        df = df.sort_values(by="시가총액", ascending=False).head(10)

        # 컬럼 순서 정리
        df = df[["기업명", "티커", "시가총액", "종가"]]

        return {"시가총액_TOP10": df.to_dict(orient="records")}

    except Exception as e:
        return {"error": str(e)}

# 거래량 top5
@app.get("/top_volume")
def get_top_volume():
    try:
        today = datetime.today().strftime("%Y%m%d")

        # KOSPI 종목 전체 OHLCV 데이터
        df = stock.get_market_ohlcv(today, market="KOSPI")

        # 거래량 상위 5개
        top5 = df.sort_values(by="거래량", ascending=False).head(5)
        top5["종목코드"] = top5.index
        top5["종목명"] = top5["종목코드"].apply(lambda code: stock.get_market_ticker_name(code))
        top5.reset_index(drop=True, inplace=True)

        # JSON 형태로 반환
        result = top5[["종목명", "종목코드", "거래량"]].to_dict(orient="records")
        return JSONResponse(content=result)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# 주린이들을 위한 보물찾기
from fastapi import FastAPI
from fastapi.responses import JSONResponse

@app.get("/api/treasure")
def get_treasure_data():
    docs = list(collection.find({}, {
        "_id": 0,
        "기업명": 1,
        "업종명": 1,
        "지표": 1
    }))

    years = ["2022", "2023", "2024"]
    result = []

    for doc in docs:
        기업명 = doc.get("기업명", "알 수 없음")
        업종명 = doc.get("업종명", "알 수 없음")
        지표 = doc.get("지표", {})

        try:
            per = {}
            pbr = {}
            roe = {}
            mktcap = {}
            equity = {}         # ✅ 지배주주지분 (신규)
            owner_income = {}   # ✅ 지배주주순이익 (신규)

            for year in years:
                per[year] = 지표.get(f"{year}/12_PER")
                pbr[year] = 지표.get(f"{year}/12_PBR")
                roe[year] = 지표.get(f"{year}/12_ROE")
                mktcap[year] = 지표.get(f"{year}/12_시가총액")
                equity[year] = 지표.get(f"{year}/12_지배주주지분")
                owner_income[year] = 지표.get(f"{year}/12_지배주주순이익")

            result.append({
                "기업명": 기업명,
                "업종명": 업종명,
                "PER": per,
                "PBR": pbr,
                "ROE": roe,
                "시가총액": mktcap,
                "지배주주지분": equity,             # ✅ 추가됨
                "지배주주순이익": owner_income       # ✅ 추가됨
            })
        except Exception as e:
            print(f"❌ {기업명} 처리 중 오류:", e)

    
    return JSONResponse(content=result)


# uvicorn main:app --reload

