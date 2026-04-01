import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  // Sample data from Gemini dashboard
  const data = [
    // Year 67 (Full Year)
    { year: 2567, month: 12, sales_value: 37628208, quantity: 573426, avg_price: 65.62 },
    { year: 2567, month: 1, sales_value: 38377974, quantity: 584852, avg_price: 65.62 },
    { year: 2567, month: 2, sales_value: 39252020, quantity: 598171, avg_price: 65.62 },
    { year: 2567, month: 3, sales_value: 45754563, quantity: 697265, avg_price: 65.62 },
    { year: 2567, month: 4, sales_value: 41765512, quantity: 636475, avg_price: 65.62 },
    { year: 2567, month: 5, sales_value: 45078526, quantity: 686963, avg_price: 65.62 },
    { year: 2567, month: 6, sales_value: 40117851, quantity: 611366, avg_price: 65.62 },
    { year: 2567, month: 7, sales_value: 37682646, quantity: 574255, avg_price: 65.62 },
    { year: 2567, month: 8, sales_value: 37869466, quantity: 577102, avg_price: 65.62 },
    { year: 2567, month: 9, sales_value: 35055907, quantity: 534226, avg_price: 65.62 },
    { year: 2567, month: 10, sales_value: 39235934, quantity: 597926, avg_price: 65.62 },
    { year: 2567, month: 11, sales_value: 37877665, quantity: 577227, avg_price: 65.62 },
    
    // Year 68 (Dec only)
    { year: 2568, month: 12, sales_value: 36368096, quantity: 568699, avg_price: 63.95 },
  ];

  const { error } = await supabase
    .from('sales_data')
    .upsert(data, { onConflict: 'year,month' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Data seeded successfully' });
}
