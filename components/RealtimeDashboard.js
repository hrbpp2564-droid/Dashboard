'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import KPICards from './KPICards';
import { MonthlyTrendChart, ComparisonBarChart } from './Charts';
import MonthlyTable from './MonthlyTable';
import CSVImportModal from './CSVImportModal';
import { MONTH_INDICES } from '@/lib/constants';

export default function RealtimeDashboard() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [metric, setMetric] = useState('sales_value');
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales_data' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from('sales_data')
      .select('*')
      .order('year', { ascending: true })
      .order('month', { ascending: true });

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setSalesData(data || []);
    }
    setLoading(false);
  }

  // Process data for charts/cards
  const dataMap = (year) => {
    return MONTH_INDICES.map(m => {
      const entry = salesData.find(d => d.year === year && d.month === m);
      return entry || { month: m, sales_value: 0, quantity: 0, avg_price: 0 };
    });
  };

  const calculateStats = (data) => {
    const totalSales = data.reduce((sum, d) => sum + (Number(d.sales_value) || 0), 0);
    const totalQuantity = data.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
    const avgPrice = totalQuantity > 0 ? totalSales / totalQuantity : 0;
    return { totalSales, totalQuantity, avgPrice };
  };

  // Find unique years and prepare data for all of them
  const uniqueYears = Array.from(new Set(salesData.map(d => d.year))).sort((a, b) => b - a);
  
  const allYearsData = uniqueYears.map(year => {
    const data = dataMap(year);
    const stats = calculateStats(data);
    return { year, data, stats };
  });

  // Keep year1/year2 for specific comparison components
  const year1 = uniqueYears[0] || 2568;
  const year2 = uniqueYears[1] || (uniqueYears[0] ? uniqueYears[0] - 1 : 2567);

  const dataYear1 = dataMap(year1);
  const dataYear2 = dataMap(year2);

  const stats1 = calculateStats(dataYear1);
  const stats2 = calculateStats(dataYear2);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <div className="header-icon">💰</div>
          <div>
            <h1>Sales Analytics</h1>
            <div className="header-subtitle">Dashboard & Comparison Tool</div>
          </div>
        </div>
        <div className="header-right">
          <div className="realtime-badge">
            <div className="realtime-dot"></div>
            Real-time Active
          </div>
          <button className="csv-btn" onClick={() => setIsImportOpen(true)}>
            📥 นำเข้า CSV
          </button>
        </div>
      </header>

      <CSVImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
      />

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 ภาพรวม (Overview)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          🔄 เปรียบเทียบ (Comparison)
        </button>
      </div>

      <KPICards allYearsData={allYearsData} />

      {activeTab === 'overview' ? (
        <>
          <div className="chart-card">
            <div className="chart-title">
              <span className="chart-title-icon">📈</span>
              แนวโน้มรายเดือน (เปรียบเทียบทุกปีที่มีข้อมูล)
            </div>
            <div className="chart-subtitle">กราฟแสดงแนวโน้มยอดขาย ปริมาณ และราคาเฉลี่ย</div>
            
            <div className="chart-toggle-group">
              <button 
                className={`chart-toggle ${metric === 'sales_value' ? 'active' : ''}`}
                onClick={() => setMetric('sales_value')}
              >
                มูลค่า (บาท)
              </button>
              <button 
                className={`chart-toggle ${metric === 'quantity' ? 'active' : ''}`}
                onClick={() => setMetric('quantity')}
              >
                ปริมาณ (กก.)
              </button>
              <button 
                className={`chart-toggle ${metric === 'avg_price' ? 'active' : ''}`}
                onClick={() => setMetric('avg_price')}
              >
                ราคาเฉลี่ย (@ A/V)
              </button>
            </div>

            <div className="chart-container">
              <MonthlyTrendChart 
                allYearsData={allYearsData} 
                metric={metric} 
              />
            </div>
            <div className="chart-legend">
              {allYearsData.map((y, i) => {
                const colorMap = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7'];
                const color = colorMap[i % colorMap.length];
                return (
                  <div className="legend-item" key={y.year}>
                    <span className="legend-dot" style={{background: color}}></span>
                    ปี {String(y.year).slice(-2)} ({y.year})
                  </div>
                );
              })}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-title">
              <span className="chart-title-icon">📊</span>
              เปรียบเทียบส่วนต่าง (ปี {String(year1).slice(-2)} - ปี {String(year2).slice(-2)})
            </div>
            <div className="chart-container">
              <ComparisonBarChart 
                data1={dataYear1} 
                data2={dataYear2} 
                year1={year1} 
                year2={year2} 
                metric={metric} 
              />
            </div>
          </div>
        </>
      ) : (
        <div className="chart-card">
          <div className="chart-title">
            <span className="chart-title-icon">📝</span>
            รายละเอียดรายเดือน (เปรียบเทียบทุกปี)
          </div>
          <MonthlyTable 
            data1={dataYear1} 
            data2={dataYear2} 
            year1={year1} 
            year2={year2} 
          />
        </div>
      )}
    </div>
  );
}
