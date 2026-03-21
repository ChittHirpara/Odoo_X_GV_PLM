import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Package, Layers, ArrowRight, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export default function GlobalSearch({ open, setOpen }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef();
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setOpen]);

  // Auto focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults(null);
    }
  }, [open]);

  // Fetch results when query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `http://localhost:3000/api/search?q=${encodeURIComponent(debouncedQuery)}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) setResults(data.data.results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

  // Keyboard navigation
  const allResults = results ? [
    ...results.ecos,
    ...results.products,
    ...results.boms
  ] : [];

  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, allResults.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && allResults[selectedIndex]) {
        navigate(allResults[selectedIndex].url);
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, allResults, selectedIndex, navigate, setOpen]);

  // Prevent scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const typeIcons = {
    eco: <FileText size={14} className="text-teal-500" />,
    product: <Package size={14} className="text-blue-500" />,
    bom: <Layers size={14} className="text-purple-500" />
  };

  const typeLabels = {
    eco: 'ECO',
    product: 'Product',
    bom: 'Bill of Materials'
  };

  const stageBadgeColors = {
    'New': 'bg-slate-100 text-slate-600',
    'In Review': 'bg-blue-100 text-blue-700',
    'Approval': 'bg-amber-100 text-amber-700',
    'Done': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Active': 'bg-green-100 text-green-700',
    'Archived': 'bg-slate-100 text-slate-500',
  };

  // Highlight matching text
  const highlight = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-teal-100 text-teal-800 rounded px-0.5 bg-opacity-50 font-bold">{part}</mark>
        : part
    );
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 backdrop-blur-sm bg-slate-900/40"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          {loading 
            ? <Loader2 size={20} className="text-primary-500 animate-spin flex-shrink-0" />
            : <Search size={20} className="text-slate-400 flex-shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search ECOs, products, BoMs..."
            className="flex-1 outline-none text-slate-900 text-base placeholder-slate-400 bg-transparent font-medium"
          />
          <div className="flex items-center gap-2">
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors">
                <X size={16} />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] text-slate-400 font-bold bg-slate-50 rounded border border-slate-200">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden">
          {/* Empty state — no query */}
          {!query && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Search size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Search across your entire workspace</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for component names or ECO Numbers.</p>
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && !loading && results && allResults.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-slate-600">No results found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Check for typos or try a different term.</p>
            </div>
          )}

          {/* Loading state indicator minimum height block */}
          {query.length >= 2 && loading && !results && (
            <div className="py-16 text-center flex flex-col items-center justify-center">
               <Loader2 size={24} className="text-primary-400 animate-spin mb-3" />
               <p className="text-xs font-medium text-slate-500">Searching...</p>
            </div>
          )}

          {/* Results grouped by type */}
          {results && allResults.length > 0 && (
            <div className="py-2">
              {['eco', 'product', 'bom'].map(type => {
                const items = results[type + 's'] || results[type === 'bom' ? 'boms' : type + 's'];
                if (!items?.length) return null;
                
                let globalIndexStart = 0;
                if (type === 'product') globalIndexStart = results.ecos.length;
                else if (type === 'bom') globalIndexStart = results.ecos.length + results.products.length;

                return (
                  <div key={type}>
                    {/* Group header */}
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/80 sticky top-0 backdrop-blur-md border-y border-slate-100 z-10">
                      {typeLabels[type]}s
                    </div>
                    {/* Group items */}
                    {items.map((item, i) => {
                      const idx = globalIndexStart + i;
                      return (
                        <button
                          key={item.id}
                          className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors border-l-2 ${idx === selectedIndex ? 'bg-primary-50 border-primary-500' : 'border-transparent hover:bg-slate-50'}`}
                          onClick={() => {
                            navigate(item.url);
                            setOpen(false);
                          }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${idx === selectedIndex ? 'bg-white border-primary-200' : 'bg-slate-50 border-slate-200'}`}>
                            {typeIcons[type]}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold truncate ${idx === selectedIndex ? 'text-primary-900' : 'text-slate-700'}`}>
                              {highlight(item.title, query)}
                            </div>
                            <div className="text-xs text-slate-500 truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 flex-shrink-0 pl-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${stageBadgeColors[item.badge] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {item.badge}
                            </span>
                            {idx === selectedIndex ? (
                              <ArrowRight size={16} className="text-primary-500" />
                            ) : (
                              <div className="w-4" /> 
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 shadow-sm font-mono text-[10px]">↑↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1.5 hidden sm:flex">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 shadow-sm font-mono text-[10px]">↵</kbd>
              to open
            </span>
          </div>
          {results && (
            <span className="text-xs font-semibold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">
              {allResults.length} result{allResults.length !== 1 && 's'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
