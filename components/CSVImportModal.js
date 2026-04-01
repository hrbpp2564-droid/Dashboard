'use client';
import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';

export default function CSVImportModal({ isOpen, onClose }) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      processFile(file);
    } else {
      setStatus({ type: 'error', message: 'กรุณาเลือกไฟล์ .csv เท่านั้น' });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const thaiMonthToNum = {
    'ม.ค.': 1, 'ม.ค': 1,
    'ก.พ.': 2, 'ก.พ': 2,
    'มี.ค.': 3, 'มี.ค': 3,
    'เม.ย.': 4, 'เม.ย': 4,
    'พ.ค.': 5, 'พ.ค': 5,
    'มิ.ย.': 6, 'มิ.ย': 6,
    'ก.ค.': 7, 'ก.ค': 7,
    'ส.ค.': 8, 'ส.ค': 8,
    'ก.ย.': 9, 'ก.ย': 9,
    'ต.ค.': 10, 'ต.ค': 10,
    'พ.ย.': 11, 'พ.ย': 11,
    'ธ.ค.': 12, 'ธ.ค': 12
  };

  const parseThaiDateStr = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return { year: NaN, month: NaN };
    
    const cleanStr = dateStr.trim();
    
    // Sort month names by length descending to match longest first (e.g., "ม.ค." before "ม.ค")
    const monthNames = Object.keys(thaiMonthToNum).sort((a, b) => b.length - a.length);
    
    for (const mName of monthNames) {
      if (cleanStr.startsWith(mName)) {
        const remaining = cleanStr.substring(mName.length).replace(/[- ./]/g, '').trim();
        let year = parseInt(remaining);
        
        if (!isNaN(year)) {
          if (year < 100) year += 2500;
          return { year, month: thaiMonthToNum[mName] };
        }
      }
    }
    
    // Fallback for cases like "66-ธ.ค." (rare but possible)
    const parts = cleanStr.split(/[- /]/);
    if (parts.length === 2) {
      let mStr, yStr;
      if (isNaN(parseInt(parts[0]))) {
        mStr = parts[0].trim();
        yStr = parts[1].trim();
      } else {
        yStr = parts[0].trim();
        mStr = parts[1].trim();
      }
      
      const month = thaiMonthToNum[mStr] || thaiMonthToNum[mStr + '.'] || NaN;
      let year = parseInt(yStr);
      if (!isNaN(year) && !isNaN(month)) {
        if (year < 100) year += 2500;
        return { year, month };
      }
    }
    
    return { year: NaN, month: NaN };
  };

  const processFile = (file) => {
    setLoading(true);
    setStatus({ type: 'loading', message: 'กำลังอ่านไฟล์...' });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        // Trim headers and remove UTF-8 BOM if present
        const headers = (results.meta.fields || []).map(f => f.trim().replace(/^\uFEFF/, ''));
        
        const requiredEnglish = ['year', 'month', 'sales_value', 'quantity', 'avg_price'];
        const requiredThai = ['เดือน', 'ยอดขาย(กก.)', 'มูลค่าขาย(บาท)', '@ A/V'];
        
        // Flexible check: remove spaces for matching
        const cleanHeader = (s) => (s || '').replace(/\s+/g, '');
        const headersCleaned = headers.map(cleanHeader);
        
        const hasEnglish = requiredEnglish.every(f => headersCleaned.includes(cleanHeader(f)));
        const hasThai = requiredThai.every(f => headersCleaned.includes(cleanHeader(f)));

        if (!hasEnglish && !hasThai) {
          console.log('Detected Headers:', headers);
          setStatus({ 
            type: 'error', 
            message: `ไฟล์ไม่ถูกต้อง ขาดคอลัมน์สำคัญ (ตรวจพบ: ${headers.slice(0, 3).join(', ')}... ต้องการ: เดือน, ยอดขาย(กก.), ...)` 
          });
          setLoading(false);
          return;
        }

        // Map headers to row accessors
        const getVal = (row, key, requiredList) => {
          const cleanTarget = cleanHeader(key);
          const actualKey = headers.find(h => cleanHeader(h) === cleanTarget);
          return row[actualKey];
        };

        // Clean and format data
        const cleanData = data.map((row, index) => {
          let year, month, sales_value, quantity, avg_price;
          
          try {
            if (hasThai) {
              const dateStr = getVal(row, 'เดือน');
              const parsedDate = parseThaiDateStr(dateStr);
              year = parsedDate.year;
              month = parsedDate.month;
              sales_value = parseFloat(String(getVal(row, 'มูลค่าขาย(บาท)') || '0').replace(/[^0-9.-]+/g, ""));
              quantity = parseFloat(String(getVal(row, 'ยอดขาย(กก.)') || '0').replace(/[^0-9.-]+/g, ""));
              avg_price = parseFloat(String(getVal(row, '@ A/V') || '0').replace(/[^0-9.-]+/g, ""));
            } else {
              year = parseInt(getVal(row, 'year'));
              month = parseInt(getVal(row, 'month'));
              sales_value = parseFloat(String(getVal(row, 'sales_value') || '0').replace(/[^0-9.-]+/g, ""));
              quantity = parseFloat(String(getVal(row, 'quantity') || '0').replace(/[^0-9.-]+/g, ""));
              avg_price = parseFloat(String(getVal(row, 'avg_price') || '0').replace(/[^0-9.-]+/g, ""));
            }

            if (isNaN(year) || isNaN(month)) {
              if (index === 0) console.log('Row 0 failed parsing:', { row, year, month });
              return null;
            }

            return {
              year,
              month,
              sales_value: isNaN(sales_value) ? 0 : sales_value,
              quantity: isNaN(quantity) ? 0 : quantity,
              avg_price: isNaN(avg_price) ? 0 : avg_price,
            };
          } catch (e) {
            console.error('Error parsing row:', index, e);
            return null;
          }
        }).filter(row => row !== null);

        if (cleanData.length === 0) {
          const firstRow = data[0] ? JSON.stringify(data[0]).substring(0, 100) : 'empty';
          setStatus({ 
            type: 'error', 
            message: `ไม่พบข้อมูลที่ถูกต้อง (ตรวจพบ ${data.length} แถว แต่แปลงวันที่ไม่ได้ ตัวอย่างแถวแรก: ${firstRow})` 
          });
          setLoading(false);
          return;
        }

        try {
          setStatus({ type: 'loading', message: `กำลังนำเข้าข้อมูล ${cleanData.length} รายการ...` });
          
          // Clear all data before import as requested by "ล้างหมดเลย"
          const { error: deleteError } = await supabase
            .from('sales_data')
            .delete()
            .neq('year', 0);
          
          if (deleteError) throw deleteError;
          
          const { error } = await supabase
            .from('sales_data')
            .upsert(cleanData, { onConflict: 'year,month' });

          if (error) throw error;

          setStatus({ type: 'success', message: 'นำเข้าข้อมูลสำเร็จ!' });
          setTimeout(() => {
            onClose();
            setStatus({ type: '', message: '' });
          }, 1500);
        } catch (err) {
          setStatus({ type: 'error', message: 'เกิดข้อผิดพลาดในการบันทึก: ' + err.message });
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setStatus({ type: 'error', message: 'ไม่สามารถอ่านไฟล์ได้: ' + err.message });
        setLoading(false);
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 นำเข้าข้อมูลยอดขาย (CSV)</h2>
          <p>อัปโหลดไฟล์ CSV เพื่อเพิ่มหรืออัปเดตยอดขายรายเดือน</p>
        </div>

        <div 
          className={`file-drop-zone ${isDragging ? 'drag-over' : ''} ${loading ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv" 
            onChange={handleFileSelect} 
            style={{ display: 'none' }}
          />
          <div className="icon">📂</div>
          {loading ? (
            <div className="loading-spinner-sm"></div>
          ) : (
            <>
              <p>ลากไฟล์ .csv มาวางที่นี่ หรือ<strong>คลิกเพื่อเลือกไฟล์</strong></p>
              <div className="format-hint">
                รองรับ: เดือน (ธ.ค.-66), ยอดขาย(กก.), มูลค่าขาย(บาท), @ A/V<br/>
                หรือ: year, month, sales_value, quantity, avg_price
              </div>
            </>
          )}
        </div>

        {status.message && (
          <div className={`import-status ${status.type}`}>
            {status.type === 'loading' && <span className="spinner-mini"></span>}
            {status.message}
          </div>
        )}

        <div className="modal-actions">
          <button className="modal-close" onClick={onClose} disabled={loading}>ยกเลิก</button>
        </div>
      </div>
    </div>
  );
}
