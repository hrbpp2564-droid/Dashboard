'use client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { MONTH_NAMES_TH, COLORS } from '@/lib/constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function MonthlyTrendChart({ allYearsData = [], metric = 'sales_value' }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11 } }
      }
    }
  };

  const colorMap = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7'];
  const bgColorMap = ['rgba(59, 130, 246, 0.15)', 'rgba(239, 68, 68, 0.05)', 'rgba(34, 197, 94, 0.05)', 'rgba(234, 179, 8, 0.05)', 'rgba(168, 85, 247, 0.05)'];

  const chartData = {
    labels: MONTH_NAMES_TH,
    datasets: allYearsData.map((y, i) => ({
      label: `ปี ${String(y.year).slice(-2)}`,
      data: y.data.map(d => d[metric] || 0),
      borderColor: colorMap[i % colorMap.length],
      backgroundColor: i === 0 ? bgColorMap[i % bgColorMap.length] : 'transparent',
      borderWidth: i === 0 ? 3 : 2,
      pointBackgroundColor: colorMap[i % colorMap.length],
      pointRadius: i === 0 ? 4 : 3,
      tension: 0.4,
      fill: i === 0,
      borderDash: i === 0 ? [] : [5, 5],
    }))
  };

  return <Line options={options} data={chartData} />;
}

export function ComparisonBarChart({ data1, data2, year1, year2, metric = 'sales_value' }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        ticks: { color: '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' }
      }
    }
  };

  const chartData = {
    labels: MONTH_NAMES_TH,
    datasets: [
      {
        label: `ส่วนต่าง (ปี ${String(year1).slice(-2)} - ปี ${String(year2).slice(-2)})`,
        data: MONTH_NAMES_TH.map((_, i) => (data1[i]?.[metric] || 0) - (data2[i]?.[metric] || 0)),
        backgroundColor: (context) => {
          const val = context.raw;
          return val >= 0 ? COLORS.green : COLORS.red;
        },
        borderRadius: 4,
      }
    ]
  };

  return <Bar options={options} data={chartData} />;
}
