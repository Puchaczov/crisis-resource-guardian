
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Map,
  Database,
  Upload,
  Users,
  FileText,
  Settings,
  AlertTriangle,
  LayoutDashboard,
  MapPin,
  Info
} from "lucide-react";

const AppSidebar = () => {
  const { user } = useAuth();
  
  // Determine available menu items based on user role
  const isAdmin = user?.role === "admin";
  const isReporter = user?.role === "reporter";
  const isCoordinator = user?.role === "coordinator";

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <AlertTriangle className="h-6 w-6 text-warning" />
          <div>
            <h1 className="text-base font-semibold tracking-tight">
              Kryzysowe Monitorowanie
            </h1>
            <p className="text-xs text-sidebar-foreground/70">
              System zarządzania zasobami
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Nawigacja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/"
                    className={({ isActive }) => 
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                    }
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/map"
                    className={({ isActive }) => 
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                    }
                  >
                    <Map className="h-4 w-4" />
                    <span>Mapa zasobów</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/resources"
                    className={({ isActive }) => 
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                    }
                  >
                    <Database className="h-4 w-4" />
                    <span>Zasoby</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {(isAdmin || isReporter || isCoordinator) && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/add-resource"
                      className={({ isActive }) => 
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                      }
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Dodaj zasób</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {(isAdmin || isCoordinator) && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/reports"
                      className={({ isActive }) => 
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                      }
                    >
                      <FileText className="h-4 w-4" />
                      <span>Raporty</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/import"
                      className={({ isActive }) => 
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                      }
                    >
                      <Upload className="h-4 w-4" />
                      <span>Import danych</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administracja</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/users"
                      className={({ isActive }) => 
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                      }
                    >
                      <Users className="h-4 w-4" />
                      <span>Użytkownicy</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/settings"
                      className={({ isActive }) => 
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                      }
                    >
                      <Settings className="h-4 w-4" />
                      <span>Ustawienia</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 p-4 text-xs">
          <Info className="h-4 w-4" />
          <span>Wersja: 1.0.0 (Demo)</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
