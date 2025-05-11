import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Bell } from "lucide-react";

interface AppHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    organization: string;
  } | null;
}

const AppHeader: React.FC<AppHeaderProps> = ({ user }) => {
  const { logout } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const originalQuery = searchValue.trim();
      const query = originalQuery.toLowerCase(); // Normalize query to lowercase for matching

      // Introduce a random delay between 1 and 3 seconds
      const delay = Math.random() * 2000 + 1000; // Random delay in milliseconds

      setTimeout(() => {
        // Regex to find "łóżko" or "łóżek", optionally preceded by a number,
        // and optionally followed by "zasięg" and a distance in km.
        // Examples:
        // "300 łóżek" -> quantity: "300", keyword: "łóżek", distance: undefined
        // "łóżko" -> quantity: undefined, keyword: "łóżko", distance: undefined
        // "łóżko zasięg 50km" -> quantity: undefined, keyword: "łóżko", distance: "50"
        // "10 łóżek zasięg 100 km" -> quantity: "10", keyword: "łóżek", distance: "100"
        // "10 łóżek, zasięg 100 km" -> quantity: "10", keyword: "łóżek", distance: "100"
        const lozkoPattern = /^(?:(\d+)\s+)?(łóżko|łóżek)(?:,?\s+zasięg\s+(\d+)\s*km)?$/i;
        const match = query.match(lozkoPattern);

        if (match) {
          // const quantity = match[1]; // Captured if needed, e.g., for a quantity filter
          // const keyword = match[2]; // "łóżko" or "łóżek"
          const distance = match[3]; // Captured distance, or undefined

          const searchTerm = "Łóżka polowe";
          
          if (distance) {
            navigate(`/map?search=${encodeURIComponent(searchTerm)}&distanceKm=${distance}`);
          } else {
            navigate(`/map?search=${encodeURIComponent(searchTerm)}`);
          }
        } else {
          // If the specific "łóżko" pattern doesn't match, treat as a generic search.
          // Use the original query to preserve casing for general search terms.
          if (originalQuery) {
            navigate(`/map?search=${encodeURIComponent(originalQuery)}`);
          }
        }
      }, delay);
    }
  };

  return (
    <header className="h-16 border-b bg-background flex items-center px-4">
      <SidebarTrigger className="mr-4" />
      <div className="flex-1 flex items-center">
        <div className="flex-1 pl-4 flex items-center">
          <div className="relative w-full max-w-md hidden md:flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Szukaj zasobów, lokalizacji..."
              className="pl-10 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emergency rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-muted text-navy">
                    {user ? getInitials(user.name) : ""}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs bg-navy text-white px-2 py-0.5 rounded-full">
                      {user?.role === 'admin' && 'Administrator'}
                      {user?.role === 'reporter' && 'Reporter'}
                      {user?.role === 'coordinator' && 'Koordynator'}
                      {user?.role === 'viewer' && 'Obserwator'}
                    </span>
                    <span className="text-xs ml-1 text-muted-foreground">
                      ({user?.organization})
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Ustawienia</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Wyloguj się</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
