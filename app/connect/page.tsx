"use client"

import React from 'react';

const MGSupermartLanding = () => {
  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        animation: 'fadeIn 0.5s ease'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px 20px 25px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛒</div>
          <h1 style={{
            fontSize: '26px',
            marginBottom: '8px',
            fontWeight: '700'
          }}>MG Supermart</h1>
          <p style={{
            fontSize: '14px',
            opacity: '0.95',
            lineHeight: '1.4'
          }}>Humse judein aur latest offers, deals aur updates paayein!</p>
        </div>
        
        {/* Options */}
        <div style={{ padding: '20px 15px' }}>
          {/* Google Review */}
          <a 
            href="https://g.page/r/CTdHGeXyQG7sEBM/review" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              background: '#f8f9fa',
              borderRadius: '15px',
              padding: '18px',
              marginBottom: '12px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: '55px',
              height: '55px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginRight: '15px',
              flexShrink: 0,
              background: '#fff',
              border: '2px solid #4285F4',
              boxShadow: '0 2px 8px rgba(66, 133, 244, 0.2)'
            }}>⭐</div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '17px',
                color: '#333',
                marginBottom: '4px',
                fontWeight: '600'
              }}>Google Review Dein</h3>
              <p style={{
                fontSize: '13px',
                color: '#666',
                lineHeight: '1.3'
              }}>Apna experience share karein</p>
            </div>
            <div style={{ fontSize: '22px', color: '#999' }}>→</div>
          </a>

          {/* WhatsApp Channel */}
          <a 
            href="https://whatsapp.com/channel/0029VbBwjKw9hXFEUYK1Bo3o" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              background: '#f8f9fa',
              borderRadius: '15px',
              padding: '18px',
              marginBottom: '12px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              cursor: 'pointer',
              animation: 'pulse 2s infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: '55px',
              height: '55px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginRight: '15px',
              flexShrink: 0,
              background: '#25D366',
              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
            }}>📢</div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '17px',
                color: '#333',
                marginBottom: '4px',
                fontWeight: '600'
              }}>WhatsApp Channel Join Karein</h3>
              <p style={{
                fontSize: '13px',
                color: '#666',
                lineHeight: '1.3'
              }}>Daily offers aur new stock updates</p>
            </div>
            <div style={{ fontSize: '22px', color: '#999' }}>→</div>
          </a>

          {/* Instagram Page*/}
          <a 
            href="https://www.instagram.com/mgsupermart.pipra?igsh=MWI2dzZiOW1sZTF0bw==" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              background: '#f8f9fa',
              borderRadius: '15px',
              padding: '18px',
              marginBottom: '12px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: '55px',
              height: '55px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginRight: '15px',
              flexShrink: 0,
              background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
              boxShadow: '0 2px 8px rgba(188, 24, 136, 0.3)'
            }}>📸</div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '17px',
                color: '#333',
                marginBottom: '4px',
                fontWeight: '600'
              }}>Instagram Follow Karein</h3>
              <p style={{
                fontSize: '13px',
                color: '#666',
                lineHeight: '1.3'
              }}>Photos aur stories dekhein</p>
            </div>
            <div style={{ fontSize: '22px', color: '#999' }}>→</div>
          </a>

          {/* Facebook */}
          <a 
            href="https://www.facebook.com/share/14WnQDpVNm9" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              background: '#f8f9fa',
              borderRadius: '15px',
              padding: '18px',
              marginBottom: '12px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: '55px',
              height: '55px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginRight: '15px',
              flexShrink: 0,
              background: '#1877F2',
              boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)'
            }}>👍</div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '17px',
                color: '#333',
                marginBottom: '4px',
                fontWeight: '600'
              }}>Facebook Page Like Karein</h3>
              <p style={{
                fontSize: '13px',
                color: '#666',
                lineHeight: '1.3'
              }}>Updates aur posts dekhein</p>
            </div>
            <div style={{ fontSize: '22px', color: '#999' }}>→</div>
          </a>

          {/* WhatsApp Order */}
          <a 
            href="https://wa.me/918084840429?text=नमस्ते,%20मुझे%20order%20करना%20है" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              background: '#f8f9fa',
              borderRadius: '15px',
              padding: '18px',
              marginBottom: '12px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: '55px',
              height: '55px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginRight: '15px',
              flexShrink: 0,
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
              boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
            }}>📱</div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '17px',
                color: '#333',
                marginBottom: '4px',
                fontWeight: '600'
              }}>WhatsApp Par Order Karein</h3>
              <p style={{
                fontSize: '13px',
                color: '#666',
                lineHeight: '1.3'
              }}>8084840429 / 8809979748</p>
            </div>
            <div style={{ fontSize: '22px', color: '#999' }}>→</div>
          </a>
        </div>
        
        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: '#f8f9fa',
          fontSize: '13px',
          color: '#666',
          borderTop: '1px solid #e9ecef'
        }}>
          <div>🙏 Dhanyavaad! Shopping ke liye!</div>
          <a 
            href="https://mgsupermart.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: '#667eea',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: '5px'
            }}
          >mgsupermart.com</a>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default MGSupermartLanding;
