'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { resourceService } from '@/services/resourceService';
import { Resource } from '@/types';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { Search, Loader2 } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        const all = await resourceService.getAll({});
        const filtered = all?.filter(r => 
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.description.toLowerCase().includes(query.toLowerCase()) ||
          r.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
          r.category.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered || []);
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query]);

  return (
    <div className="container mx-auto px-8 py-12 space-y-10">
      <div className="space-y-4 border-b-4 border-black pb-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-black text-white shadow-neo">
            <Search className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter">Search Results</h1>
            <p className="text-xs font-black uppercase tracking-widest text-foreground/50 italic mt-1">
              SCANNING FOR: "<span className="text-black">{query}</span>"
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-black" />
          <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">PARSING DATABASE...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {results.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white border-4 border-black shadow-neo border-dashed">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-muted mb-6 shadow-neo border-2 border-black">
            <Search className="h-10 w-10 text-black opacity-20" />
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Signal Not Found</h3>
          <p className="text-xs font-black uppercase tracking-widest text-foreground/50 max-w-md mx-auto">
            THE REQUESTED INTEL IS NOT IN OUR CURRENT REPOSITORY. TRY ALTERNATE FREQUENCIES.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-8 py-12">
        <div className="animate-pulse flex items-center gap-4">
          <div className="h-12 w-12 bg-muted shadow-neo" />
          <div className="h-12 w-48 bg-muted shadow-neo" />
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
