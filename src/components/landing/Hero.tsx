"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";

export const Hero = () => {
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="relative pt-16 pb-12 overflow-hidden bg-background">
      <div className="container mx-auto px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between border-b-4 border-black pb-8 gap-8"
        >
          <div className="flex-1">
            <h1 className="text-6xl md:text-[112px] font-black leading-[0.85] tracking-tighter uppercase">
              Collective
              <br />
              Intelligence.
            </h1>
          </div>
          <div className="max-w-xs lg:text-right space-y-4">
            <LocalBadge className="bg-black text-white px-3 py-1 font-black uppercase text-[10px] tracking-widest leading-tight">
              Community-Driven Hub
            </LocalBadge>
            <p className="text-sm italic font-medium text-foreground/70 leading-relaxed uppercase">
              A living library of the internet’s best technical resources,
              curated by builders for builders.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const LocalBadge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span className={`inline-flex items-center ${className}`}>{children}</span>
);
