// GuidePopup.jsx
import React, { useEffect, useRef } from 'react';

function GuidePopup({ open, onClose }) {
  const popupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        top: '0',
        left: '100%', // 부모 div의 오른쪽 바깥
        marginLeft: '10px',
        backgroundColor: 'white',
        padding: '16px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 10,
        width: '400px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <strong style={{ fontSize: '20px' }}>📘 사이트사용 가이드</strong>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          ❌
        </button>
      </div>
      <div style={{ fontSize: '17px', lineHeight: '1.5', textAlign: 'left' }}>
      우리 사이트는 주식에 익숙하지 않은 사람을 대상으로 매우 쉽고 친절하게 투자 지표를 알아볼 수 있도록 하고 있어.<br/> 친절하게 다가가기 위해 친근한 언어로 설명하고 있어🐷<br/>다음의 기능들을 사용해서 기업별 산업별 정보를 알아보자! <br/><br/>

    1. 기업 검색 <br/>
    유가증권시장에 상장된 기업 이름을 검색해서 주요 재무 지표를 확인할 수 있어<br/><br/>

    2. 산업별 보기 <br/>
    원하는 산업을 선택하면 산업 특징과, 적정 지표 수준을 알 수 있어. 같은 산업 안에 있는 기업끼리 주요 지표를 비교해 볼 수도 있어<br/><br/>

    3. 보물찾기 <br/>
    주요 재무 지표를 내가 원하는대로 필터링해서 목적에 맞는 기업을 찾을 수 있어
      </div>
    </div>
  );
}

export default GuidePopup;
