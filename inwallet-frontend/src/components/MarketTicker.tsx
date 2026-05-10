import React, { useEffect, useState } from 'react';
import { marketApi } from '../services/api';

const MarketTicker: React.FC = () => {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await marketApi.getPrices();
        setPrices(data);
      } catch (error) {
        console.error('Piyasa verileri çekilemedi:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // 10 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  const symbols = [
    { key: 'BTC', label: 'BITCOIN', unit: '$' },
    { key: 'XAU', label: 'ALTIN (ONS)', unit: '$' },
    { key: 'AAPL', label: 'APPLE (AAPL)', unit: '$' },
  ];

  return (
    <div className="market-ticker-container">
      <div className="market-ticker-content">
        {/* Çift döngü sonsuz kayma efekti için */}
        {[...symbols, ...symbols].map((item, idx) => (
          <div key={idx} className="ticker-item">
            <span className="ticker-symbol">{item.label}</span>
            <span className="ticker-price">
              {item.unit}{prices[item.key]?.toLocaleString() || '---'}
            </span>
            <span className="ticker-change text-success">
              ▲ +0.{Math.floor(Math.random() * 9) + 1}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
