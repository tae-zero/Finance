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
      className="guide-popup"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
      <div className="guide-popup-header">
        <div className="guide-popup-title">
          <span className="guide-popup-icon">📘</span>
          <h2>사이트 사용 가이드</h2>
        </div>
        <button
          onClick={onClose}
          className="guide-popup-close"
        >
          ✕
        </button>
      </div>
      <div className="guide-popup-content">
        <p className="guide-popup-intro">
          우리 사이트는 주식에 익숙하지 않은 사람을 대상으로 매우 쉽고 친절하게 투자 지표를 알아볼 수 있도록 하고 있어. 친절하게 다가가기 위해 친근한 언어로 설명하고 있어 🐷
        </p>
        <p className="guide-popup-subtitle">다음의 기능들을 사용해서 기업별 산업별 정보를 알아보자!</p>
        
        <div className="guide-popup-features">
          <div className="guide-feature">
            <div className="feature-number">1</div>
            <div className="feature-content">
              <h3>기업 검색</h3>
              <p>유가증권시장에 상장된 기업 이름을 검색해서 주요 재무 지표를 확인할 수 있어</p>
            </div>
          </div>
          
          <div className="guide-feature">
            <div className="feature-number">2</div>
            <div className="feature-content">
              <h3>산업별 보기</h3>
              <p>원하는 산업을 선택하면 산업 특징과, 적정 지표 수준을 알 수 있어. 같은 산업 안에 있는 기업끼리 주요 지표를 비교해 볼 수도 있어</p>
            </div>
          </div>
          
          <div className="guide-feature">
            <div className="feature-number">3</div>
            <div className="feature-content">
              <h3>보물찾기</h3>
              <p>주요 재무 지표를 내가 원하는대로 필터링해서 목적에 맞는 기업을 찾을 수 있어</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuidePopup;
