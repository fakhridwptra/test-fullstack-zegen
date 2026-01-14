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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Deteksi perubahan ukuran layar untuk responsivitas
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
    };
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

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = [...data];
    if (activeTab !== 'All') result = result.filter(p => p?.category === activeTab);
    if (search.trim() !== '') {
      const term = search.toLowerCase();
      result = result.filter(p => (p?.title?.toLowerCase()?.includes(term) ?? false) || (p?.brand?.toLowerCase()?.includes(term) ?? false));
    }
    return result;
  }, [data, search, activeTab]);

  const columns = [
    columnHelper.accessor('thumbnail', {
      header: 'Product Info',
      cell: info => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: isMobile ? '180px' : 'auto' }}>
          <img src={info.getValue()} alt="p" style={{ width: '45px', height: '45px', borderRadius: '12px', objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: '800', color: '#1A202C', fontSize: '14px' }}>{info.row.original.title}</div>
            <div style={{ fontSize: '11px', color: '#A0AEC0' }}>{info.row.original.brand}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('stock', {
      header: 'Stock',
      cell: info => <span style={{ fontWeight: '700', color: info.getValue() < 15 ? '#EF4444' : '#10B981' }}>{info.getValue()}</span>
    }),
    columnHelper.accessor('price', { 
      header: 'Price',
      cell: info => <span style={{ fontWeight: '900' }}>${info.getValue()}</span>
    }),
  ];

  const table = useReactTable({
    data: filteredData, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 5 } },
  });

  if (isLoading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0F172A', color: '#38BDF8', fontWeight: '900' }}>INITIALIZING...</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', background: '#F8FAFC', fontFamily: "system-ui, sans-serif" }}>
      
      {/* SIDEBAR (Responsive) */}
      <div style={{ width: isMobile ? '100%' : '260px', background: '#1E293B', padding: isMobile ? '20px' : '40px 20px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', justifyContent: isMobile ? 'space-between' : 'flex-start', alignItems: isMobile ? 'center' : 'stretch', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', background: 'linear-gradient(45deg, #3B82F6, #8B5CF6)', borderRadius: '8px' }}></div>
          <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>NEXUS <span style={{ color: '#38BDF8' }}>PRO</span></h2>
        </div>
        {!isMobile && (
          <nav style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['Dashboard', 'Inventory', 'Analytics'].map((item, i) => (
              <div key={item} style={{ padding: '12px 15px', borderRadius: '10px', background: i === 1 ? '#334155' : 'transparent', fontWeight: '700', color: i === 1 ? '#38BDF8' : '#94A3B8' }}>{item}</div>
            ))}
          </nav>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: isMobile ? '20px' : '40px', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '30px', gap: '10px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? '22px' : '28px', fontWeight: '900' }}>Inventory Intelligence</h1>
            <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>Real-time stock monitoring.</p>
          </div>
          <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <div style={{ fontWeight: '900', color: '#1E293B' }}>{time}</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>14 Jan 2026 • Bojongsoang</div>
          </div>
        </div>

        {/* ANALYTICS GRID (Responsive 2 columns on mobile) */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
          {[
            { label: 'Asset Value', val: `$${stats.val}`, icon: '💎' },
            { label: 'Critical', val: stats.low, icon: '🚨' },
            { label: 'Rating', val: stats.avgRating, icon: '⭐' },
            { label: 'SKUs', val: stats.total, icon: '📦' }
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', padding: '15px', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '5px' }}>{s.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#1E293B' }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* TABLE SECTION */}
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #F1F5F9', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: isMobile ? '10px' : '0' }}>
              {categories.slice(0, 5).map(cat => (
                <button key={cat} onClick={() => setActiveTab(cat)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '800', background: activeTab === cat ? '#1E293B' : '#F1F5F9', color: activeTab === cat ? 'white' : '#64748B', whiteSpace: 'nowrap' }}>{cat.toUpperCase()}</button>
              ))}
            </div>
            <input 
              placeholder="Search..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ padding: '10px 15px', borderRadius: '12px', border: '1.5px solid #F1F5F9', flex: 1, fontSize: '14px' }} 
            />
          </div>

          {/* TABLE SCROLL CONTAINER (Kunci agar tidak berantakan di HP) */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {table.getHeaderGroups().map(hg => hg.headers.map(header => (
                    <th key={header.id} style={{ padding: '15px 20px', textAlign: 'left', fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                  )))}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} style={{ padding: '15px 20px' }}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '20px', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8' }}>{filteredData.length} ITEMS</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} style={{ padding: '6px 12px', borderRadius: '8px', background: 'white', border: '1px solid #E2E8F0', cursor: 'pointer', fontSize: '12px' }}>PREV</button>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} style={{ padding: '6px 12px', borderRadius: '8px', background: '#0F172A', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>NEXT</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;