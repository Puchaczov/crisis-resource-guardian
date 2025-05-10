import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, List, Clock, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

enum InstitutionType {
  FireDepartment = "fire_department",
  Hospital = "hospital",
  PoliceStation = "police_station",
  NGO = "ngo",
  GovernmentAgency = "government_agency",
}

enum IntegrationStatus {
  OK = 0,
  Warning = 1,
  Error = 2,
}

const integrations = [
  {
    name: "Jednostka Straży Pożarnej",
    address: "ul. Strażacka 1, 00-001 Warszawa",
    type: InstitutionType.FireDepartment,
    status: IntegrationStatus.OK,
    lastUpdate: "2025-05-09T14:30:00Z",
  },
  {
    name: "Szpital Miejski",
    address: "ul. Zdrowia 10, 00-355 Warszawa",
    type: InstitutionType.Hospital,
    status: IntegrationStatus.Warning,
    lastUpdate: "2025-05-08T10:15:00Z",
  },
  {
    name: "Komenda Policji",
    address: "ul. Policji 5, 00-390 Warszawa",
    type: InstitutionType.PoliceStation,
    status: IntegrationStatus.Error,
    lastUpdate: "2025-05-07T08:45:00Z",
  },
  {
    name: "Fundacja Pomocy",
    address: "ul. Pomocna 12, 00-500 Warszawa",
    type: InstitutionType.NGO,
    status: IntegrationStatus.OK,
    lastUpdate: "2025-05-06T09:00:00Z",
  },
  {
    name: "Agencja Rządowa",
    address: "ul. Rządowa 3, 00-600 Warszawa",
    type: InstitutionType.GovernmentAgency,
    status: IntegrationStatus.Warning,
    lastUpdate: "2025-05-05T11:30:00Z",
  },
  {
    name: "Jednostka Straży Pożarnej - Kraków",
    address: "ul. Pożarna 15, 30-001 Kraków",
    type: InstitutionType.FireDepartment,
    status: IntegrationStatus.Warning,
    lastUpdate: "2025-05-04T14:00:00Z",
  },
  {
    name: "Szpital Wojewódzki",
    address: "ul. Wojewódzka 20, 40-001 Katowice",
    type: InstitutionType.Hospital,
    status: IntegrationStatus.OK,
    lastUpdate: "2025-05-03T12:00:00Z",
  },
  {
    name: "Komenda Policji - Gdańsk",
    address: "ul. Policyjna 8, 80-001 Gdańsk",
    type: InstitutionType.PoliceStation,
    status: IntegrationStatus.Warning,
    lastUpdate: "2025-05-02T16:30:00Z",
  },
  {
    name: "Fundacja Zdrowie",
    address: "ul. Zdrowotna 5, 50-001 Wrocław",
    type: InstitutionType.NGO,
    status: IntegrationStatus.Error,
    lastUpdate: "2025-05-01T10:00:00Z",
  },
  {
    name: "Ministerstwo Zdrowia",
    address: "ul. Ministerialna 1, 00-950 Warszawa",
    type: InstitutionType.GovernmentAgency,
    status: IntegrationStatus.OK,
    lastUpdate: "2025-04-30T09:00:00Z",
  },
  {
    name: "Jednostka Straży Pożarnej - Poznań",
    address: "ul. Strażacka 22, 60-001 Poznań",
    type: InstitutionType.FireDepartment,
    status: IntegrationStatus.Error,
    lastUpdate: "2025-04-29T08:00:00Z",
  },
  {
    name: "Szpital Specjalistyczny",
    address: "ul. Specjalistyczna 3, 70-001 Szczecin",
    type: InstitutionType.Hospital,
    status: IntegrationStatus.Warning,
    lastUpdate: "2025-04-28T14:45:00Z",
  },
  {
    name: "Komenda Policji - Łódź",
    address: "ul. Policyjna 10, 90-001 Łódź",
    type: InstitutionType.PoliceStation,
    status: IntegrationStatus.OK,
    lastUpdate: "2025-04-27T11:30:00Z",
  },
  {
    name: "Fundacja Edukacja",
    address: "ul. Edukacyjna 7, 20-001 Lublin",
    type: InstitutionType.NGO,
    status: IntegrationStatus.Warning,
    lastUpdate: "2025-04-26T13:15:00Z",
  },
  {
    name: "Urząd Wojewódzki",
    address: "ul. Wojewódzka 2, 00-950 Warszawa",
    type: InstitutionType.GovernmentAgency,
    status: IntegrationStatus.Error,
    lastUpdate: "2025-04-25T15:00:00Z",
  },
];

const getStatusBadge = (status: IntegrationStatus) => {
  switch (status) {
    case IntegrationStatus.OK:
      return <Badge className="bg-green-500 text-white">Aktywny</Badge>;
    case IntegrationStatus.Warning:
      return <Badge className="bg-yellow-500 text-white">Ostrzeżenie</Badge>;
    case IntegrationStatus.Error:
      return <Badge className="bg-red-500 text-white">Błąd</Badge>;
    default:
      return <Badge className="bg-gray-500 text-white">Nieznany</Badge>;
  }
};

const getInstitutionTypeLabel = (type: InstitutionType) => {
  switch (type) {
    case InstitutionType.FireDepartment:
      return "Jednostka Straży Pożarnej";
    case InstitutionType.Hospital:
      return "Szpital";
    case InstitutionType.PoliceStation:
      return "Komenda Policji";
    case InstitutionType.NGO:
      return "Organizacja Pozarządowa";
    case InstitutionType.GovernmentAgency:
      return "Agencja Rządowa";
    default:
      return "Nieznany typ";
  }
};

const SortingComponent = ({ sortBy, setSortBy, sortOrder, setSortOrder }: any) => {
  const getSortLabel = () => {
    switch (sortBy) {
      case "name":
        return { label: "Nazwa", icon: <List className="h-4 w-4" /> };
      case "lastUpdate":
        return { label: "Ostatnia aktualizacja", icon: <Clock className="h-4 w-4" /> };
      case "status":
        return { label: "Status", icon: <AlertCircle className="h-4 w-4" /> };
      default:
        return { label: "Sortuj", icon: <List className="h-4 w-4" /> };
    }
  };

  const { label, icon } = getSortLabel();

  return (
    <div className="ml-auto flex items-center gap-2">
      {/* Sorting Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="border rounded p-2 flex items-center gap-2">
            {icon}
            {label}
            <ChevronDown className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setSortBy("name")}>
            <span className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Nazwa
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("lastUpdate")}>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Ostatnia aktualizacja
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("status")}>
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Status
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ascending/Descending Toggle */}
      <button
        className="border rounded p-2 flex items-center"
        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
      >
        {sortOrder === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

const IntegrationsPage = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredIntegrations = integrations
    .filter((integration) => {
      return (
        (!selectedType || integration.type === selectedType) &&
        (!selectedStatus || integration.status === parseInt(selectedStatus))
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "lastUpdate") {
        comparison = new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime();
      } else if (sortBy === "status") {
        comparison = a.status - b.status;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Integracje zewnętrzne</h1>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          className="border rounded p-2"
          value={selectedType || ""}
          onChange={(e) => setSelectedType(e.target.value || null)}
        >
          <option value="">Wszystkie typy</option>
          {Object.values(InstitutionType).map((type) => (
            <option key={type} value={type}>
              {getInstitutionTypeLabel(type as InstitutionType)}
            </option>
          ))}
        </select>

        <select
          className="border rounded p-2"
          value={selectedStatus || ""}
          onChange={(e) => setSelectedStatus(e.target.value || null)}
        >
          <option value="">Wszystkie statusy</option>
          {Object.values(IntegrationStatus)
            .filter((status) => typeof status === "number") // Only include numeric values
            .map((status) => (
              <option key={status} value={status}>
                {status === IntegrationStatus.OK
                  ? "Aktywny"
                  : status === IntegrationStatus.Warning
                  ? "Ostrzeżenie"
                  : "Błąd"}
              </option>
            ))}
        </select>

        <SortingComponent
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{integration.name}</CardTitle>
              <CardDescription>{getInstitutionTypeLabel(integration.type)}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                <strong>Adres:</strong> {integration.address}
              </p>
              <p className="text-sm">
                <strong>Status:</strong> {getStatusBadge(integration.status)}
              </p>
              <p className="text-sm">
                <strong>Ostatnia aktualizacja:</strong>{" "}
                {new Date(integration.lastUpdate).toLocaleString("pl-PL")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsPage;