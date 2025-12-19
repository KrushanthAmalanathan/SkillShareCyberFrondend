// frontend/src/pages/logFile/LogViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FiClock,
  FiTrash2,
  FiEdit,
  FiPlus,
  FiMail,
  FiCalendar,
  FiChevronDown,
  FiBox,
  FiFileText,
  FiActivity,
  FiDownload,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiX,
  FiUser,
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Dashboard from '../../components/Dashboard';
import { useAuth } from '../../hooks/useAuth';
import { ActivityLogEndPoint } from '../../utils/ApiRequest';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const badgeColor = (type) =>
  ({
    add:     'bg-emerald-50 text-emerald-700 ring-emerald-200',
    update:  'bg-blue-50    text-blue-700    ring-blue-200',
    delete:  'bg-rose-50    text-rose-700    ring-rose-200',
    template:'bg-violet-50 text-violet-700   ring-violet-200',
    product: 'bg-amber-50   text-amber-800   ring-amber-200',
  }[type] || 'bg-gray-50 text-gray-700 ring-gray-200');

const actionMeta = (action) => {
  if (action.endsWith('_add'))    return { label: 'Added',   chip: 'add',    icon: <FiPlus /> };
  if (action.endsWith('_update')) return { label: 'Updated', chip: 'update', icon: <FiEdit /> };
  if (action.endsWith('_delete')) return { label: 'Deleted', chip: 'delete', icon: <FiTrash2 /> };
  return { label: 'Action', chip: 'default', icon: <FiActivity /> };
};

const formatAction = {
  template_add:    'Template Added',
  template_update: 'Template Updated',
  template_delete: 'Template Deleted',
  product_add:     'Product Added',
  product_update:  'Product Updated',
  product_delete:  'Product Deleted',
};

export default function ActivityLog() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const tableRef = useRef(null);

  // State
  const [activities, setActivities]             = useState([]);
  const [searchInput, setSearchInput]           = useState('');
  const [filter, setFilter]                     = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUser, setSelectedUser]         = useState('all');
  const [dateRange, setDateRange]               = useState([null, null]);
  const [isLoading, setIsLoading]               = useState(false);
  const [openRestore, setOpenRestore]           = useState(false);
  const [showFilters, setShowFilters]           = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(10);
  const [startDate, endDate]          = dateRange;

  // Debounce searchInput → filter
  useEffect(() => {
    const id = setTimeout(() => setFilter(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Fetch activities once
  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    axios.get(ActivityLogEndPoint)
      .then(({ data }) => {
        setActivities(data.map(act => ({
          id:        act._id,
          timestamp: act.createdAt,
          user:      act.userEmail,
          action:    act.category.toLowerCase().replace(' ', '_'),
          details:   act.description || '',
          category:  act.category.toLowerCase().startsWith('template') ? 'template' : 'product',
        })));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  // Unique users
  const uniqueUsers = Array.from(new Set(activities.map(a => a.user)));

  // Filtering logic
  const filtered = activities.filter(a => {
    const d = new Date(a.timestamp);
    if (startDate && d < startDate) return false;
    if (endDate) {
      const eod = new Date(endDate); eod.setHours(23, 59, 59, 999);
      if (d > eod) return false;
    }
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (selectedUser !== 'all' && a.user !== selectedUser) return false;
    return a.details.toLowerCase().includes(filter.toLowerCase());
  });

  // Pagination
  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx   = (currentPage - 1) * pageSize;
  const endIdx     = Math.min(startIdx + pageSize, total);
  const pageItems  = filtered.slice(startIdx, endIdx);
  const resultFrom = total ? startIdx + 1 : 0;
  const resultTo   = endIdx;

  const buildPages = () => {
    if (totalPages <= 5) return [...Array(totalPages)].map((_,i)=>i+1);
    const p = [];
    if (currentPage <= 3) p.push(1,2,3,'...', totalPages);
    else if (currentPage >= totalPages - 2) p.push(1,'...', totalPages-2, totalPages-1, totalPages);
    else p.push(1,'...', currentPage-1, currentPage, currentPage+1,'...', totalPages);
    return p;
  };

  // Export PDF
  const exportPDF = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'pt', 'a4');
    const pdfWidth  = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`activity-log-${Date.now()}.pdf`);
  };

  // Quick date presets
  const setQuickRange = preset => {
    const now = new Date(),
          today = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let s = null, e = null;
    if (preset === 'today')      { s = today;           e = now; }
    else if (preset === 'last7') { s = new Date(today.setDate(today.getDate()-6)); e = now; }
    else if (preset === 'thisMonth') { s = monthStart;    e = now; }
    else if (preset === 'last30')    { s = new Date(today.setDate(today.getDate()-29)); e = now; }
    setDateRange(preset==='clear' ? [null,null] : [s,e]);
    setCurrentPage(1);
  };

  const clearAll   = () => {
    setSearchInput('');
    setFilter('');
    setSelectedCategory('all');
    setSelectedUser('all');
    setDateRange([null,null]);
    setCurrentPage(1);
  };
  const removeChip = type => {
    if (type === 'q')    setSearchInput('') && setFilter('');
    if (type === 'cat')  setSelectedCategory('all');
    if (type === 'usr')  setSelectedUser('all');
    if (type === 'date') setDateRange([null,null]);
    setCurrentPage(1);
  };

  const hasDate    = !!startDate || !!endDate;
  const hasFilters = !!filter || selectedCategory !== 'all' || selectedUser !== 'all' || hasDate;

  return (
    <Dashboard>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-6 space-y-8">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
              <p className="mt-1 text-gray-600">Audit template & product changes.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportPDF}
                className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50"
              >
                <FiDownload /> Export PDF
              </button>
              <div className="relative">
                <button
                  onClick={() => setOpenRestore(o => !o)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-blue-600 rounded-xl text-blue-600 shadow-sm hover:bg-blue-50"
                >
                  Restore & Backup <FiChevronDown className={openRestore ? 'rotate-180':''}/>
                </button>
                {openRestore && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => { navigate('/backup'); setOpenRestore(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FiBox /> Restore Object
                    </button>
                    <button
                      onClick={() => { navigate('/backup/template'); setOpenRestore(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FiFileText /> Restore Template
                    </button>
                    <button
                      onClick={() => { navigate('/admin/backup'); setOpenRestore(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FiFileText /> System Backup
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div
              onClick={()=>setShowFilters(f=>!f)}
              className="flex items-center justify-between px-5 py-3 bg-blue-50 border-b border-blue-100 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FiFilter className="text-blue-600"/> 
                <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
              </div>
              <FiChevronDown className={`${showFilters?'rotate-180':''} transition-transform`} />
            </div>
            {showFilters && (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                  <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500">
                    <FiSearch className="ml-3 text-gray-400"/>
                    <input
                      type="text"
                      className="flex-1 p-2 text-sm outline-none"
                      placeholder="Filter details…"
                      value={searchInput}
                      onChange={e => { setSearchInput(e.target.value); setCurrentPage(1); }}
                    />
                  </div>
                </div>
                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <div className="flex gap-2">
                    {['all','template','product'].map(c=>(
                      <button
                        key={c}
                        onClick={()=>{ setSelectedCategory(c); setCurrentPage(1); }}
                        className={`flex-1 py-2 text-sm rounded-lg border ${
                          selectedCategory===c
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {c.charAt(0).toUpperCase()+c.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {/* User */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">User</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-2 text-gray-400"/>
                    <select
                      className="w-full pl-9 p-2 text-sm border border-gray-300 rounded-xl focus:ring-blue-500"
                      value={selectedUser}
                      onChange={e=>{ setSelectedUser(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="all">All users</option>
                      {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                {/* Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
                  <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500">
                    <FiCalendar className="ml-3 text-gray-400"/>
                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={r=>{ setDateRange(r); setCurrentPage(1); }}
                      isClearable
                      placeholderText="Select dates…"
                      className="flex-1 p-2 text-sm outline-none"
                    />
                  </div>
                  <div className="mt-2 flex gap-1 text-xs text-gray-600 flex-wrap">
                    {['today','last7','thisMonth','last30','clear'].map(preset=>(
                      <button
                        key={preset}
                        onClick={()=>setQuickRange(preset)}
                        className="px-2 py-1 bg-gray-100 rounded text-xs"
                      >
                        {preset==='thisMonth'?'This Mo.':preset==='clear'?'Clear':preset.charAt(0).toUpperCase()+preset.slice(1).replace('Last','Last ')}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Chips & reset */}
                {hasFilters && (
                  <div className="md:col-span-4 flex flex-wrap gap-2 items-center pt-4 border-t border-gray-100">
                    {filter && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        q: {filter}
                        <FiX onClick={()=>removeChip('q')} className="cursor-pointer"/>
                      </span>
                    )}
                    {selectedCategory!=='all' && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        cat: {selectedCategory}
                        <FiX onClick={()=>removeChip('cat')} className="cursor-pointer"/>
                      </span>
                    )}
                    {selectedUser!=='all' && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">
                        usr: {selectedUser}
                        <FiX onClick={()=>removeChip('usr')} className="cursor-pointer"/>
                      </span>
                    )}
                    {hasDate && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">
                        date
                        <FiX onClick={()=>removeChip('date')} className="cursor-pointer"/>
                      </span>
                    )}
                    <button onClick={clearAll} className="ml-auto text-sm text-gray-500 hover:underline">
                      Reset all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Table */}
          <div className="mt-6 bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
              <span className="text-sm text-gray-600">
                {resultFrom}-{resultTo} of {total}
              </span>
            </div>
            <div ref={tableRef} className="h-[500px] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-16 text-center text-gray-500">
                  <div className="mx-auto h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="mt-4">Loading…</p>
                </div>
              ) : !pageItems.length ? (
                <div className="p-16 text-center text-gray-500">
                  <FiActivity className="mx-auto h-10 w-10" />
                  <p className="mt-4">No activities</p>
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-white/90 backdrop-blur border-b">
                    <tr className="text-left text-gray-600 text-xs">
                      <th className="px-5 py-3">Time</th>
                      <th className="px-5 py-3">Action</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Details</th>
                      <th className="px-5 py-3">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageItems.map(act => {
                      const meta = actionMeta(act.action);
                      return (
                        <tr key={act.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 whitespace-nowrap text-gray-700 text-xs">
                            <div className="flex items-center gap-1">
                              <FiClock /> {new Date(act.timestamp).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-gray-900">
                            <div className="flex items-center gap-2">
                              <span className="p-1 bg-gray-100 rounded">{meta.icon}</span>
                              {formatAction[act.action]}
                            </div>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${badgeColor(meta.chip)}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${badgeColor(act.category)}`}>
                              {act.category.charAt(0).toUpperCase()+act.category.slice(1)}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-700">
                            {(act.details||'').length > 100
                              ? act.details.slice(0,100)+'…'
                              : act.details}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-700">
                                {act.user?.[0]?.toUpperCase()||'U'}
                              </div>
                              <span className="flex items-center gap-1 text-gray-700 text-sm">
                                <FiMail /> {act.user}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
<div className="flex items-center justify-between px-6 py-4 border-t">
  <span className="text-sm text-gray-600">
    {resultFrom}-{resultTo} of {total}
  </span>
  <div className="flex items-center gap-2">
    <button
      onClick={() => setCurrentPage(p => Math.max(p-1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
    >
      ‹
    </button>

    {buildPages().map((p, i) =>
      p === '...' ? (
        <span key={`ellipsis-${i}`} className="px-2 text-gray-500">
          …
        </span>
      ) : (
        <button
          key={`page-${p}`}
          onClick={() => setCurrentPage(p)}
          className={`px-3 py-1 rounded ${
            p === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-white border hover:bg-gray-50'
          }`}
        >
          {p}
        </button>
      )
    )}

    <button
      onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
    >
      ›
    </button>

    <select
      className="ml-4 p-1 border rounded"
      value={pageSize}
      onChange={e => {
        setPageSize(+e.target.value);
        setCurrentPage(1);
      }}
    >
      {[10, 20, 50, 100].map(n => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  </div>
</div>
          </div>

        </div>
      </div>

      {/* Custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 #f1f5f9; }
      `}</style>
    </Dashboard>
  );
}
