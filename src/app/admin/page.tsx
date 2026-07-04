'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { resourceService } from '@/services/resourceService';
import { Resource } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ExternalLink, ShieldCheck, Clock, Users, Star } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [pending, setPending] = useState<Resource[]>([]);
  const [stats, setStats] = useState({ total: 0, users: 0, pending: 0, featured: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [pendingRes, allRes] = await Promise.all([
          resourceService.getAll({ status: 'PENDING' }),
          resourceService.getAll({ status: 'APPROVED' }) // Simplified stats for now
        ]);
        setPending(pendingRes || []);
        setStats({
          total: (allRes?.length || 0) + (pendingRes?.length || 0),
          users: 124, // Mock users count for now
          pending: pendingRes?.length || 0,
          featured: allRes?.filter(r => r.isFeatured).length || 0
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [isAdmin]);

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await resourceService.updateStatus(id, status);
      setPending(prev => prev.filter(r => r.id !== id));
      toast.success(`Resource ${status === 'APPROVED' ? 'approved' : 'rejected'}`);
    } catch (error) {
      toast.error('Failed to update resource status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-8 py-20 text-center">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-red-600">Restricted Access</h2>
        <p className="text-foreground/70 uppercase font-medium italic">Terminal permissions not detected.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-black pb-8 gap-4">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Command Center</h1>
          <p className="text-xs font-black uppercase tracking-widest text-foreground/70 italic mt-2">Manage appraisals, community intelligence, and system diagnostics.</p>
        </div>
        <div className="flex items-center gap-2 bg-black text-white px-6 py-2 shadow-neo font-black uppercase text-[10px] tracking-widest">
          <ShieldCheck className="h-4 w-4" />
          Level 0 Admin
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Inflow', value: stats.total, icon: Star, color: 'text-indigo-600' },
          { label: 'Pending Audit', value: stats.pending, icon: Clock, color: 'text-orange-500' },
          { label: 'Network Nodes', value: stats.users, icon: Users, color: 'text-purple-600' },
          { label: 'Verified Intel', value: stats.featured, icon: ShieldCheck, color: 'text-emerald-500' },
        ].map((item) => (
          <Card key={item.label} className="border-2 border-black shadow-neo bg-white">
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{item.label}</CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-black">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-4 border-black shadow-neo-lg bg-white overflow-hidden">
        <CardHeader className="border-b-4 border-black bg-[#F3F3F1] p-8">
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Active Verifications</CardTitle>
          <CardDescription className="text-xs font-black uppercase text-foreground/50 tracking-widest">Resources awaiting authentication for global broadcast.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] p-8">
            {loading ? (
              <p className="text-[10px] font-black uppercase tracking-widest text-center py-20 animate-pulse">Scanning frequencies...</p>
            ) : pending.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-6">
                <div className="h-16 w-16 bg-emerald-100 border-2 border-emerald-500 rounded-none flex items-center justify-center text-emerald-600 shadow-neo">
                   <Check className="h-8 w-8" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-foreground/50 italic">System clear. No pending transmissions.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pending.map((resource) => (
                  <div key={resource.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-white border-2 border-black shadow-neo gap-6">
                    <div className="flex-grow space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-xl uppercase tracking-tight">{resource.title}</h4>
                        <Badge variant="secondary" className="text-[8px] font-black uppercase border border-black">{resource.category}</Badge>
                      </div>
                      <p className="text-xs font-medium text-foreground/60 line-clamp-1 italic uppercase">{resource.description}</p>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                        <span>SOURCE: {resource.postedByName}</span>
                        <a href={resource.url} target="_blank" rel="noreferrer" className="flex items-center text-indigo-600 gap-1 hover:underline">
                          EXTERNAL LINK <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-grow md:flex-grow-0 h-10 px-6 font-black uppercase tracking-tighter bg-emerald-600 hover:bg-emerald-700 shadow-neo"
                        onClick={() => handleStatusUpdate(resource.id, 'APPROVED')}
                      >
                        APPROVE
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-grow md:flex-grow-0 h-10 px-6 font-black uppercase tracking-tighter shadow-neo"
                        onClick={() => handleStatusUpdate(resource.id, 'REJECTED')}
                      >
                        REJECT
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
