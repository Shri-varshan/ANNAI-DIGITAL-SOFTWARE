import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DesignItem } from '../../types';
import { Palette, Search, PlusCircle, Sparkles, Check, Tag } from 'lucide-react';

export const DesignCatalogueView: React.FC = () => {
  const { designs, services, setActiveView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filtered = designs.filter((d) => {
    const matchesSearch =
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = categoryFilter === 'ALL' || d.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Printing Design & Artwork Catalogue</span>
            <span className="text-xs font-mono font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {designs.length} Ready Templates
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Pre-designed customer templates for instant order selection and operator preview.
          </p>
        </div>

        <button
          onClick={() => setActiveView('new-order')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          + Create Custom Order
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Design Code (e.g. FLEX-GRAND), Keyword, or Tag..."
            className="w-full text-xs px-3 py-2 pl-9 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {['ALL', 'banner', 'cards', 'vinyl', 'stickers'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Formats' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((design) => {
          const service = services.find((s) => s.id === design.serviceId);

          return (
            <div
              key={design.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all group"
            >
              <div>
                {/* Visual Art Preview Card */}
                <div
                  className={`h-40 bg-gradient-to-br ${design.previewGradient} p-4 flex flex-col justify-between text-white relative`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold tracking-wider bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
                      {design.code}
                    </span>
                    {design.isPopular && (
                      <span className="text-[10px] font-semibold bg-amber-400 text-amber-950 px-2 py-0.5 rounded shadow-xs">
                        Popular Choice
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base leading-tight drop-shadow-xs">
                      {design.title}
                    </h3>
                    <p className="text-[11px] text-white/80 mt-0.5 font-mono">
                      Standard: {design.standardDimensions}
                    </p>
                  </div>
                </div>

                {/* Details Content */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {design.description}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {design.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-700">
                  {service?.name || 'Standard Print'}
                </span>

                <button
                  onClick={() => setActiveView('new-order')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Use Design</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
