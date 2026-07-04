"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, LogOut, Shield, Bookmark, Trophy } from "lucide-react";
import { useAuth } from "../AuthProvider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-black bg-white">
      <div className="container mx-auto flex h-20 items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tighter uppercase"
          >
            RESRC.HUB
          </Link>

          <div className="hidden lg:flex items-center gap-6 font-bold text-sm uppercase tracking-wider">
            <Link
              href="/resources"
              className="hover:underline underline-offset-4 decoration-2"
            >
              Browse
            </Link>
            <Link
              href="/submit"
              className="hover:underline underline-offset-4 decoration-2"
            >
              Submit
            </Link>
            <Link
              href="/leaderboard"
              className="hover:underline underline-offset-4 decoration-2 flex items-center gap-1"
            >
              <Trophy className="h-3.5 w-3.5" /> Leaderboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="hover:underline underline-offset-4 decoration-2 text-primary"
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form
            onSubmit={handleSearch}
            className="hidden md:flex relative w-64"
          >
            <Input
              type="search"
              placeholder="SEARCH..."
              className="h-10 bg-[#F3F3F1] border-2 border-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {user ? (
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                onClick={() => router.push("/submit")}
                className="hidden sm:flex"
              >
                Submit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-10 w-10 border-2 border-black p-0 overflow-hidden rounded-md focus:outline-none">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/saved")}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Saved Resources</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/login")}
                className="border-2 border-black font-black uppercase tracking-wider text-xs"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/register")}
                className="font-black uppercase tracking-wider text-xs"
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
