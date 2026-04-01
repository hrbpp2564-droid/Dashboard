import './globals.css';

export const metadata = {
  title: 'Sales Analytics — Dashboard สรุปยอดขาย',
  description: 'แดชบอร์ดสรุปยอดขายแบบ Real-time เปรียบเทียบรายเดือนและรายปี',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
