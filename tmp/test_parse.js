const thaiMonthToNum = {
  'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'มี.ค': 3, 'เม.ย.': 4,
  'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8,
  'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12
};

const parseThaiDateStr = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return { year: NaN, month: NaN };
  const parts = dateStr.trim().split('-');
  if (parts.length !== 2) return { year: NaN, month: NaN };
  
  const mStr = parts[0];
  const yStr = parts[1];
  
  const month = thaiMonthToNum[mStr] || NaN;
  let year = parseInt(yStr);
  if (!isNaN(year)) {
    if (year < 100) year += 2500;
  }
  
  return { year, month };
};

console.log(parseThaiDateStr("ธ.ค.-66"));
console.log(parseThaiDateStr("ม.ค.-67"));
console.log(parseThaiDateStr("ก.พ.-68"));
