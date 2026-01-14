import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, createColumnHelper } from '@tanstack/react-table';

interface Product { 
  id: number; title: string; price: number; category: string; thumbnail: string; brand: string; rating: number; stock: number;
}

const columnHelper = createColumnHelper<Product>();

function App() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('https://dummyjson.com/products');
      return res.data.products as Product[];
    },
  });

  const categories = useMemo(() => ['All', ...new Set(data?.map(p => p.category) || [])], [data]);

  const stats = useMemo(() => {
    if (!data) return { total: 0, val: "0", low: 0, avgRating: "0" };
    const total = data.length;
    const val = data.reduce((a, b) => a + b.price, 0);
    const low = data.filter(p => p.stock < 15).length;
    const avgRating = (data.reduce((a, b) => a + b.rating, 0) / total).toFixed(1);
    return { total, val: val.toLocaleString(), low, avgRating };
  }, [data]);

  // LOGIKA FILTER DENGAN SAFETY GUARD (UNTUK MENCEGAH WHITE SCREEN)
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let result = [...data];
    
    // Filter Kategori
    if (activeTab !== 'All') {
      result = result.filter(p => p?.category === activeTab);
    }
    
    // Filter Search dengan Optional Chaining agar tidak crash jika data null
    if (search.trim() !== '') {
      const term = search.toLowerCase();
      result = result.filter(p => {
        const titleMatch = p?.title?.toLowerCase()?.includes(term) ?? false;
        const brandMatch = p?.brand?.toLowerCase()?.includes(term) ?? false;
        return titleMatch || brandMatch;
      });
    }
    
    return result;
  }, [data, search, activeTab]);

  const columns = [
    columnHelper.accessor('thumbnail', {
      header: 'Product Details',
      cell: info => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <img src={info.getValue()} alt="p" style={{ width: '65px', height: '65px', borderRadius: '20px', objectFit: 'cover', border: '3px solid white', boxShadow: '0 10px 20px rgba(0,0,0,0.06)' }} />
            <div style={{ position: 'absolute', top: '-5px', left: '-5px', background: info.row.original.rating > 4.5 ? '#ECC94B' : '#3182CE', color: 'white', fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '8px', border: '2px solid white' }}>
              {info.row.original.rating > 4.5 ? 'TOP' : 'NEW'}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '800', color: '#1A202C', fontSize: '15px', letterSpacing: '-0.2px' }}>{info.row.original.title}</div>
            <div style={{ fontSize: '12px', color: '#A0AEC0', fontWeight: '600' }}>ID: #{info.row.original.id} • {info.row.original.brand}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('stock', {
      header: 'Inventory Health',
      cell: info => {
        const val = info.getValue() ?? 0;
        const isLow = val < 15;
        const color = isLow ? '#F56565' : '#48BB78';
        return (
          <div style={{ width: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: '900', color: color, background: `${color}15`, padding: '2px 8px', borderRadius: '6px' }}>{isLow ? 'CRITICAL' : 'STABLE'}</span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#4A5568' }}>{val} Units</span>
            </div>
            <div style={{ height: '8px', background: '#EDF2F7', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(val, 100)}%`, height: '100%', background: color, borderRadius: '10px', transition: 'width 1s ease' }}></div>
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor('price', { 
      header: 'Market Price',
      cell: info => <div style={{ fontSize: '20px', fontWeight: '900', color: '#2D3748' }}><span style={{ fontSize: '12px', color: '#A0AEC0' }}>$</span>{info.getValue()}</div>
    }),
  ];

  const table = useReactTable({
    data: filteredData, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 5 } },
  });

  if (isLoading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0F172A', color: '#38BDF8', fontWeight: '900', letterSpacing: '4px' }}>BOOTING NEXUS CORE...</div>;
  if (isError) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'red' }}>SYSTEM ERROR: DATA FETCH FAILED</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC', fontFamily: "system-ui, sans-serif" }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '280px', background: '#1E293B', padding: '40px 20px', display: 'flex', flexDirection: 'column', color: 'white' }}>
        <div style={{ marginBottom: '50px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(45deg, #3B82F6, #8B5CF6)', borderRadius: '12px' }}></div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>NEXUS <span style={{ color: '#38BDF8' }}>PRO</span></h2>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['Dashboard', 'Inventory', 'Analytics', 'Settings'].map((item, i) => (
            <div key={item} style={{ padding: '14px 20px', borderRadius: '12px', background: i === 1 ? '#334155' : 'transparent', fontWeight: '700', cursor: 'pointer', color: i === 1 ? '#38BDF8' : '#94A3B8' }}>{item}</div>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', height: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>Inventory Intelligence</h1>
            <p style={{ margin: '5px 0 0', color: '#64748B' }}>Manage assets and monitor real-time stock health.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '900', color: '#1E293B' }}>{time}</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>14 Jan 2026 • Bojongsoang</div>
          </div>
        </div>

        {/* ANALYTICS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
          {[
            { label: 'Asset Value', val: `$${stats.val}`, color: '#3B82F6', icon: '💎' },
            { label: 'Critical Units', val: stats.low, color: '#EF4444', icon: '🚨' },
            { label: 'Global Rating', val: stats.avgRating, color: '#F59E0B', icon: '⭐' },
            { label: 'Active SKUs', val: stats.total, color: '#10B981', icon: '📦' }
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{s.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8' }}>{s.label}</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#1E293B' }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* DATA TABLE SECTION */}
        <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '30px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveTab(cat)} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '800', background: activeTab === cat ? '#1E293B' : '#F1F5F9', color: activeTab === cat ? 'white' : '#64748B' }}>{cat.toUpperCase()}</button>
              ))}
            </div>
            <input 
              placeholder="Search products, brands..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ padding: '12px 20px', width: '280px', borderRadius: '14px', border: '1.5px solid #F1F5F9', background: '#F8FAFC' }} 
            />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {table.getHeaderGroups().map(hg => hg.headers.map(header => (
                  <th key={header.id} style={{ padding: '20px 30px', textAlign: 'left', fontSize: '11px', fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase' }}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                )))}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={{ padding: '22px 30px' }}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding: '25px 30px', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>TOTAL: {filteredData.length} ITEMS</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} style={{ background: 'white', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}>PREV</button>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} style={{ background: '#0F172A', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}>NEXT</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;