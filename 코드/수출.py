from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import time

# 종목코드 리스트 로딩
df_codes = pd.read_excel(r"C:\Users\bitcamp\OneDrive\Desktop\pythontraning\DART_재무_코스피전체_2024기준 (1).xlsx")
df_codes = df_codes[['종목코드', '종목명']].dropna()

# 셀레니움 설정
options = Options()
options.add_argument('--headless')  # 주석 처리하면 창 보임
options.add_argument('--window-size=1920,1080')
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

results = []

for i, row in df_codes.iterrows():
    raw_code = str(int(row['종목코드'])).zfill(6)
    name = row['종목명']
    url = f"https://comp.nicebizline.com/co/CO0100M010GE.nice?stockcd={raw_code}&nav=2"

    try:
        driver.get(url)
        time.sleep(3)

        # 페이지 내 모든 테이블에서 "내수/수출" 관련 테이블 찾기
        tables = pd.read_html(driver.page_source)
        for df in tables:
            if any(df.astype(str).apply(lambda x: x.str.contains('내수|수출')).any()):
                df.insert(0, '종목코드', raw_code)
                df.insert(1, '종목명', name)
                results.append(df)
                print(f"✅ [{i+1}] {name} 크롤링 성공")
                break
        else:
            print(f"⚠️ [{i+1}] {name} 관련 테이블 없음")

    except Exception as e:
        print(f"❌ [{i+1}] {name} 오류: {e}")
        continue

driver.quit()

# 결과 저장
if results:
    final_df = pd.concat(results, ignore_index=True)
    final_df.to_csv("NICE_내수수출_코스피전체.csv", index=False, encoding='utf-8-sig')
    print("📁 저장 완료: NICE_내수수출_코스피전체.csv")
else:
    print("❗ 수집된 데이터가 없습니다.")
