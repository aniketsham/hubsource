"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, AuthUser } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }
      login(data.token, { ...data.user, likes: [], saves: [] } as AuthUser);
      toast.success(`Welcome to RESRC.HUB, ${data.user.name}!`);
      router.push("/");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="text-2xl font-black tracking-tighter uppercase"
          >
            RESRC.HUB
          </Link>
          <h1 className="mt-6 text-4xl font-black uppercase tracking-tight">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-black underline underline-offset-4 decoration-2 text-foreground"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 border-2 border-black p-8 shadow-neo bg-white"
        >
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="font-black uppercase text-xs tracking-widest"
            >
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Aarav Singh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-2 border-black h-12 font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="font-black uppercase text-xs tracking-widest"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-2 border-black h-12 font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="font-black uppercase text-xs tracking-widest"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-2 border-black h-12 font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirm"
              className="font-black uppercase text-xs tracking-widest"
            >
              Confirm Password
            </Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="border-2 border-black h-12 font-medium"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 font-black uppercase tracking-widest text-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center font-medium">
            By creating an account you agree to our terms of service.
          </p>
        </form>
      </div>
    </div>
  );
}
