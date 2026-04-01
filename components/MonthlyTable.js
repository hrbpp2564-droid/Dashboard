'use client';
import { MONTH_NAMES_TH, formatCurrency, formatPercent } from '@/lib/constants';

export default function MonthlyTable({ data1, data2, year1, year2 }) {
  const tableData = MONTH_NAMES_TH.map((month, i) => {
    const v1 = data1[i]?.sales_value || 0;
    const v2 = data2[i]?.sales_value || 0;
    const diff = v1 - v2;
    const percent = v2 !== 0 ? (diff / v2) * 100 : 0;

    return { month, v1, v2, diff, percent };
  });

  const total1 = tableData.reduce((sum, d) => sum + d.v1, 0);
  const total2 = tableData.reduce((sum, d) => sum + d.v2, 0);
  const totalDiff = total1 - total2;
  const totalPercent = total2 !== 0 ? (totalDiff / total2) * 100 : 0;

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>เดือน</th>
            <th>ปี {String(year1).slice(-2)} ({year1})</th>
            <th>ปี {String(year2).slice(-2)} ({year2})</th>
            <th>ส่วนต่าง</th>
            <th>% Change</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, idx) => (
            <tr key={idx}>
              <td className="month-cell">{row.month}</td>
              <td>{formatCurrency(row.v1)}</td>
              <td>{formatCurrency(row.v2)}</td>
              <td className={row.diff >= 0 ? 'positive' : 'negative'}>
                {row.diff >= 0 ? '+' : ''}{formatCurrency(row.diff)}
              </td>
              <td className={row.percent >= 0 ? 'positive' : 'negative'}>
                {row.percent >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(row.percent))}
              </td>
            </tr>
          ))}
          <tr className="total-row">
            <td>รวมทั้งหมด</td>
            <td>{formatCurrency(total1)}</td>
            <td>{formatCurrency(total2)}</td>
            <td className={totalDiff >= 0 ? 'positive' : 'negative'}>
              {totalDiff >= 0 ? '+' : ''}{formatCurrency(totalDiff)}
            </td>
            <td className={totalPercent >= 0 ? 'positive' : 'negative'}>
              {totalPercent >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(totalPercent))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
