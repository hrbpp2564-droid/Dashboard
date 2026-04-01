'use client';
import { formatCurrency, formatNumber } from '@/lib/constants';

export default function KPICards({ allYearsData = [] }) {
  const colorMap = ['blue', 'red', 'green', 'yellow', 'purple'];
  const iconMap = ['📊', '📈', '💰', '🏷️', '💎'];

  const cards = allYearsData.map((y, i) => ({
    year: `ปี ${String(y.year).slice(-2)} (${y.year})`,
    data: y.stats,
    type: colorMap[i % colorMap.length],
    icon: iconMap[i % iconMap.length]
  }));

  return (
    <div className="kpi-grid">
      {cards.map((card, idx) => (
        <div key={idx} className={`kpi-card ${card.type}`}>
          <div className="kpi-header">
            <div className="kpi-year">{card.year}</div>
            <div className="kpi-year-icon">{card.icon}</div>
          </div>
          <div className="kpi-rows">
            <div className="kpi-row">
              <span className="kpi-row-label">ยอดขาย</span>
              <span className="kpi-row-value">{formatCurrency(card.data?.totalSales)}</span>
            </div>
            <div className="kpi-row">
              <span className="kpi-row-label">ปริมาณ</span>
              <span className="kpi-row-value">{formatNumber(card.data?.totalQuantity)} <small>กก.</small></span>
            </div>
            <div className="kpi-row">
              <span className="kpi-row-label">ราคาเฉลี่ย</span>
              <span className="kpi-row-value">{formatCurrency(card.data?.avgPrice)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
