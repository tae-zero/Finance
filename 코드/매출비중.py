from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import time

# ① 종목코드 데이터 불러오기
df_codes = pd.read_excel("DART_재무_코스피전체_2024기준 (1).xlsx")
codes = df_codes[['종목코드', '종목명']].dropna()

# ② Selenium 설정
options = Options()
options.add_argument('--headless')  # → 크롬 창 안 뜨도록
options.add_argument('--window-size=1920,1080')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

# ③ 결과 저장용 리스트
results = []

for i, row in codes.iterrows():
    code = str(row['종목코드']).zfill(6)
    name = row['종목명']
    url = f"https://comp.fnguide.com/SVO2/ASP/SVD_Corp.asp?pGB=1&gicode=A{code}"

    try:
        driver.get(url)
        time.sleep(2)

        # 매출비중 테이블 (class 기반 탐색)
        table = driver.find_element(By.CSS_SELECTOR, 'table.us_table_ty1.table-hb2.h_fix.zigbg_no')
        html = table.get_attribute('outerHTML')
        df = pd.read_html(html)[0]

        df.insert(0, '종목코드', f"A{code}")
        df.insert(1, '종목명', name)
        results.append(df)
        print(f"✅ [{i+1}] {name} 크롤링 완료")

    except Exception as e:
        print(f"❌ [{i+1}] {name} 실패: {e}")
        continue

driver.quit()

# ④ 병합 후 저장
if results:
    final_df = pd.concat(results, ignore_index=True)
    final_df.to_csv("코스피_매출비중추이_전체.csv", index=False, encoding='utf-8-sig')
    print("📁 저장 완료: 코스피_매출비중추이_전체.csv")
else:
    print("❗ 크롤링된 데이터 없음")
