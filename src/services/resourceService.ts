import { Resource, ResourceCategory, ResourceStatus } from "@/types/resources";

// Mock data
const mockResources: Resource[] = [
  {
    id: "r1",
    name: "Agregat prądotwórczy 15kVA",
    description: "Agregat prądotwórczy 15kVA diesel, mobilny na przyczepie",
    quantity: 2,
    unit: "szt",
    category: "power",
    status: "available",
    location: {
      name: "Magazyn Główny PSP",
      address: "ul. Strażacka 1, 00-001 Warszawa",
      coordinates: {
        lat: 52.2297,
        lng: 21.0122
      }
    },
    organization: "Straż Pożarna",
    lastUpdated: "2023-05-10T10:30:00Z",
    telemetry: {
      battery: 100,
      fuel: 98,
      temperature: 21,
      lastSignal: "2023-05-10T10:25:00Z"
    }
  },
  {
    id: "r2",
    name: "Wóz strażacki GCBA 5/32",
    description: "Ciężki samochód gaśniczy na podwoziu MAN",
    quantity: 1,
    unit: "szt",
    category: "vehicle",
    status: "unavailable",
    location: {
      name: "Jednostka Ratowniczo-Gaśnicza nr 3",
      address: "ul. Polna 14, 00-625 Warszawa",
      coordinates: {
        lat: 52.2180,
        lng: 21.0220
      }
    },
    organization: "Straż Pożarna",
    lastUpdated: "2023-05-09T16:45:00Z",
    telemetry: {
      fuel: 45,
      lastSignal: "2023-05-09T16:40:00Z"
    }
  },
  {
    id: "r3",
    name: "Materace składane",
    description: "Materace składane pojedyncze 190x90 cm",
    quantity: 50,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Magazyn Miejski",
      address: "ul. Magazynowa 8, 00-811 Warszawa",
      coordinates: {
        lat: 52.2310,
        lng: 20.9800
      }
    },
    organization: "Urząd Miasta",
    lastUpdated: "2023-04-28T09:15:00Z"
  },
  {
    id: "r4",
    name: "Stacja uzdatniania wody mobilna",
    description: "Mobilna stacja uzdatniająca wodę, wydajność 2000l/h",
    quantity: 1,
    unit: "szt",
    category: "water",
    status: "maintenance",
    location: {
      name: "Magazyn Miejski",
      address: "ul. Magazynowa 8, 00-811 Warszawa",
      coordinates: {
        lat: 52.2310,
        lng: 20.9800
      }
    },
    organization: "Urząd Miasta",
    lastUpdated: "2023-05-02T13:40:00Z",
    telemetry: {
      battery: 78,
      lastSignal: "2023-05-01T18:20:00Z"
    }
  },
  {
    id: "r5",
    name: "Namiot pneumatyczny 6x10m",
    description: "Namiot pneumatyczny 6x10m, ogrzewany, 50 miejsc",
    quantity: 4,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Magazyn PCK",
      address: "ul. Czerwonego Krzyża 5, 00-355 Warszawa",
      coordinates: {
        lat: 52.2400,
        lng: 21.0000
      }
    },
    organization: "Czerwony Krzyż",
    lastUpdated: "2023-05-08T11:20:00Z"
  },
  {
    id: "r6",
    name: "Zespół ratownictwa medycznego",
    description: "ZRM podstawowy: 2 ratowników medycznych + kierowca",
    quantity: 8,
    unit: "zespół",
    category: "personnel",
    status: "reserved",
    location: {
      name: "Stacja Pogotowia Ratunkowego",
      address: "ul. Hoża 56, 00-682 Warszawa",
      coordinates: {
        lat: 52.2220,
        lng: 21.0150
      }
    },
    organization: "Pogotowie Ratunkowe",
    lastUpdated: "2023-05-10T08:00:00Z"
  },
  {
    id: "r7",
    name: "Racje żywnościowe długoterminowe",
    description: "Racje żywnościowe 2000kcal/dzień, termin ważności 5 lat",
    quantity: 1000,
    unit: "szt",
    category: "food",
    status: "available",
    location: {
      name: "Magazyn Wojewódzki",
      address: "ul. Reymonta 28, 01-842 Warszawa",
      coordinates: {
        lat: 52.2500,
        lng: 20.9500
      }
    },
    organization: "Urząd Wojewódzki",
    lastUpdated: "2023-03-15T13:30:00Z"
  },
  {
    id: "r8",
    name: "Woda pitna butelkowana 1,5L",
    description: "Woda pitna niegazowana w butelkach 1,5L",
    quantity: 5000,
    unit: "szt",
    category: "water",
    status: "available",
    location: {
      name: "Magazyn Miejski",
      address: "ul. Magazynowa 8, 00-811 Warszawa",
      coordinates: {
        lat: 52.2310,
        lng: 20.9800
      }
    },
    organization: "Urząd Miasta",
    lastUpdated: "2023-04-20T09:45:00Z"
  },
  {
    id: "r9",
    name: "Defibrylator AED",
    description: "Automatyczny defibrylator zewnętrzny z instrukcjami głosowymi",
    quantity: 10,
    unit: "szt",
    category: "medical",
    status: "available",
    location: {
      name: "Magazyn PCK",
      address: "ul. Czerwonego Krzyża 5, 00-355 Warszawa",
      coordinates: {
        lat: 52.2400,
        lng: 21.0000
      }
    },
    organization: "Czerwony Krzyż",
    lastUpdated: "2023-04-28T14:15:00Z",
    telemetry: {
      battery: 95,
      lastSignal: "2023-04-28T14:10:00Z"
    }
  },
  {
    id: "r10",
    name: "Łódka ratunkowa",
    description: "Łódź ratunkowa z silnikiem zaburtowym 15KM",
    quantity: 3,
    unit: "szt",
    category: "equipment",
    status: "available",
    location: {
      name: "Jednostka Ratownictwa Wodnego",
      address: "ul. Wybrzeże Kościuszkowskie 2, 00-390 Warszawa",
      coordinates: {
        lat: 52.2370,
        lng: 21.0380
      }
    },
    organization: "WOPR",
    lastUpdated: "2023-05-01T09:30:00Z",
    telemetry: {
      fuel: 100,
      lastSignal: "2023-05-01T09:25:00Z"
    }
  },
  {
    id: "r11",
    name: "Koce termiczne",
    description: "Koce termiczne ratunkowe, folia NRC",
    quantity: 500,
    unit: "szt",
    category: "medical",
    status: "available",
    location: {
      name: "Magazyn PCK",
      address: "ul. Czerwonego Krzyża 5, 00-355 Warszawa",
      coordinates: {
        lat: 52.2400,
        lng: 21.0000
      }
    },
    organization: "Czerwony Krzyż",
    lastUpdated: "2023-04-15T10:00:00Z"
  },
  {
    id: "r12",
    name: "Zestaw pomp wysokowydajnych",
    description: "Pompy wysokowydajne 4000l/min, elektryczne",
    quantity: 5,
    unit: "zestaw",
    category: "equipment",
    status: "available",
    location: {
      name: "Magazyn Główny PSP",
      address: "ul. Strażacka 1, 00-001 Warszawa",
      coordinates: {
        lat: 52.2297,
        lng: 21.0122
      }
    },
    organization: "Straż Pożarna",
    lastUpdated: "2023-05-05T11:30:00Z",
    telemetry: {
      battery: 100,
      lastSignal: "2023-05-05T11:25:00Z"
    }
  }
];

// Generate resources for Kraków
const krakowResources: Resource[] = [
  {
    id: "kr1",
    name: "Agregat prądotwórczy 20kVA",
    description: "Agregat prądotwórczy 20kVA diesel, stacjonarny",
    quantity: 1,
    unit: "szt",
    category: "power",
    status: "available",
    location: {
      name: "Magazyn Miejski Kraków",
      address: "ul. Centralna 53, 31-586 Kraków",
      coordinates: {
        lat: 50.0647,
        lng: 19.9450
      }
    },
    organization: "Urząd Miasta Kraków",
    lastUpdated: "2023-05-08T14:30:00Z",
    telemetry: {
      battery: 100,
      fuel: 87,
      temperature: 22,
      lastSignal: "2023-05-08T14:25:00Z"
    }
  },
  {
    id: "kr2",
    name: "Samochód terenowy 4x4",
    description: "Land Rover Defender, wyposażenie ratunkowe",
    quantity: 2,
    unit: "szt",
    category: "vehicle",
    status: "available",
    location: {
      name: "Komenda Miejska PSP Kraków",
      address: "ul. Westerplatte 19, 31-033 Kraków",
      coordinates: {
        lat: 50.0591,
        lng: 19.9400
      }
    },
    organization: "Straż Pożarna",
    lastUpdated: "2023-05-09T09:15:00Z",
    telemetry: {
      fuel: 95,
      lastSignal: "2023-05-09T09:10:00Z"
    }
  },
  {
    id: "kr3",
    name: "Łóżka polowe",
    description: "Łóżka polowe składane z materacami",
    quantity: 75,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Magazyn PCK Kraków",
      address: "ul. Studencka 19, 31-116 Kraków",
      coordinates: {
        lat: 50.0637,
        lng: 19.9318
      }
    },
    organization: "Czerwony Krzyż",
    lastUpdated: "2023-05-01T10:45:00Z"
  }
];

// Add Kraków resources to the mock data
mockResources.push(...krakowResources);

// Generate resources for Gdańsk
const gdanskResources: Resource[] = [
  {
    id: "gd1",
    name: "Kontener mieszkalny",
    description: "Kontenery mieszkalne ocieplone 6x2,4m z wyposażeniem",
    quantity: 8,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Baza Logistyczna Gdańsk",
      address: "ul. Oliwska 35, 80-563 Gdańsk",
      coordinates: {
        lat: 54.3520,
        lng: 18.6466
      }
    },
    organization: "Urząd Wojewódzki Pomorski",
    lastUpdated: "2023-05-07T12:10:00Z"
  },
  {
    id: "gd2",
    name: "Łódź ratownicza motorowa",
    description: "Łódź motorowa ratunkowa 15 osób",
    quantity: 4,
    unit: "szt",
    category: "vehicle",
    status: "available",
    location: {
      name: "Baza WOPR Gdańsk",
      address: "ul. Stogi 20, 80-642 Gdańsk",
      coordinates: {
        lat: 54.3700,
        lng: 18.6700
      }
    },
    organization: "WOPR",
    lastUpdated: "2023-05-06T09:30:00Z",
    telemetry: {
      fuel: 100,
      lastSignal: "2023-05-06T09:25:00Z"
    }
  },
  {
    id: "gd3",
    name: "Zespół nurków ratownictwa",
    description: "Zespół nurków ratownictwa wodnego z wyposażeniem",
    quantity: 2,
    unit: "zespół",
    category: "personnel",
    status: "available",
    location: {
      name: "Baza WOPR Gdańsk",
      address: "ul. Stogi 20, 80-642 Gdańsk",
      coordinates: {
        lat: 54.3700,
        lng: 18.6700
      }
    },
    organization: "WOPR",
    lastUpdated: "2023-05-09T08:15:00Z"
  }
];

// Add Gdańsk resources to the mock data
mockResources.push(...gdanskResources);

// Generate resources for Poznań
const poznanResources: Resource[] = [
  {
    id: "pz1",
    name: "Pompa do wody brudnej",
    description: "Pompa zanurzeniowa do wody brudnej, wydajność 1000l/min",
    quantity: 10,
    unit: "szt",
    category: "equipment",
    status: "available",
    location: {
      name: "Magazyn OSP Poznań-Głuszyna",
      address: "ul. Głuszyna 188, 61-329 Poznań",
      coordinates: { lat: 52.3369, lng: 16.9772 }
    },
    organization: "Straż Pożarna",
    lastUpdated: "2024-11-10T09:00:00Z"
  },
  {
    id: "pz2",
    name: "Śpiwory zimowe",
    description: "Śpiwory syntetyczne, komfort -10°C",
    quantity: 200,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Magazyn Obrony Cywilnej Poznań",
      address: "ul. Libelta 16/20, 61-706 Poznań",
      coordinates: { lat: 52.4122, lng: 16.9311 }
    },
    organization: "Urząd Miasta Poznań",
    lastUpdated: "2025-01-15T14:30:00Z"
  },
  {
    id: "pz3",
    name: "Ambulans transportowy",
    description: "Ambulans typu A, do transportu chorych",
    quantity: 3,
    unit: "szt",
    category: "vehicle",
    status: "maintenance",
    location: {
      name: "Stacja Pogotowia Poznań",
      address: "ul. Rycerska 10, 60-346 Poznań",
      coordinates: { lat: 52.3988, lng: 16.8700 }
    },
    organization: "Pogotowie Ratunkowe",
    lastUpdated: "2025-04-20T10:00:00Z",
    telemetry: { battery: 60, lastSignal: "2025-04-20T09:55:00Z"}
  },
  {
    id: "poznan-camp-beds-1",
    name: "Łóżka polowe",
    description: "Składane łóżka polowe z materacem.",
    quantity: 150,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "PCK Poznań",
      address: "ul. Stare Miasto, 61-706 Poznań",
      coordinates: { lat: 52.4095, lng: 16.9319 }
    },
    organization: "PCK Poznań",
    lastUpdated: "2024-05-11T08:00:00Z"
  }
];
mockResources.push(...poznanResources);

// Generate resources for Wrocław
const wroclawResources: Resource[] = [
  {
    id: "wr1",
    name: "Most pontonowy",
    description: "Zestaw do budowy mostu pontonowego, nośność 20T",
    quantity: 1,
    unit: "zestaw",
    category: "equipment",
    status: "reserved",
    location: {
      name: "Jednostka Inżynieryjna Wrocław",
      address: "ul. Obornicka 100, 51-114 Wrocław",
      coordinates: { lat: 51.1400, lng: 17.0300 }
    },
    organization: "Wojsko Polskie",
    lastUpdated: "2025-02-01T11:00:00Z"
  },
  {
    id: "wr2",
    name: "Kuchnia polowa KP-340",
    description: "Kuchnia polowa na przyczepie, wydajność 340 porcji",
    quantity: 2,
    unit: "szt",
    category: "food",
    status: "available",
    location: {
      name: "Magazyn Rezerw Strategicznych Wrocław",
      address: "ul. Tęczowa 8, 53-601 Wrocław",
      coordinates: { lat: 51.1079, lng: 17.0385 }
    },
    organization: "Rządowa Agencja Rezerw Strategicznych",
    lastUpdated: "2024-12-05T16:20:00Z"
  },
  {
    id: "wr3",
    name: "Leki przeciwbólowe i opatrunki",
    description: "Zestaw podstawowych leków i materiałów opatrunkowych",
    quantity: 50,
    unit: "zestaw",
    category: "medical",
    status: "available",
    location: {
      name: "Punkt Medyczny PCK Wrocław",
      address: "ul. Bujwida 34, 50-368 Wrocław",
      coordinates: { lat: 51.1165, lng: 17.0630 }
    },
    organization: "Czerwony Krzyż",
    lastUpdated: "2025-03-10T08:45:00Z"
  },
  {
    id: "wroclaw-camp-beds-1",
    name: "Łóżka polowe",
    description: "Standardowe łóżka polowe, metalowa rama.",
    quantity: 200,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Magazyn Rezerw Strategicznych Wrocław",
      address: "ul. Rynek, 50-001 Wrocław",
      coordinates: { lat: 51.1100, lng: 17.0320 }
    },
    organization: "Magazyn Rezerw Strategicznych Wrocław",
    lastUpdated: "2024-05-11T09:30:00Z"
  }
];
mockResources.push(...wroclawResources);

// Generate resources for Łódź
const lodzResources: Resource[] = [
  {
    id: "ld1",
    name: "Agregat prądotwórczy 50kVA",
    description: "Agregat stacjonarny dużej mocy",
    quantity: 1,
    unit: "szt",
    category: "power",
    status: "available",
    location: {
      name: "Elektrociepłownia EC4 Łódź",
      address: "ul. Rokicińska 140, 92-412 Łódź",
      coordinates: { lat: 51.7500, lng: 19.5600 }
    },
    organization: "PGE Energia Ciepła",
    lastUpdated: "2025-01-20T13:00:00Z",
    telemetry: { fuel: 100, temperature: 18, lastSignal: "2025-01-20T12:55:00Z" }
  },
  {
    id: "ld2",
    name: "Płachty brezentowe",
    description: "Płachty brezentowe wodoodporne 10x15m",
    quantity: 150,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Magazyn Budowlany Łódź",
      address: "ul. Brukowa 25, 91-341 Łódź",
      coordinates: { lat: 51.8000, lng: 19.4100 }
    },
    organization: "Urząd Miasta Łódź",
    lastUpdated: "2024-10-10T10:10:00Z"
  },
  {
    id: "lodz-camp-beds-1",
    name: "Łóżka polowe",
    description: "Łóżka polowe dla ewakuowanych.",
    quantity: 120,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Urząd Miasta Łodzi - Wydział Zarządzania Kryzysowego",
      address: "ul. Bałuty, 91-341 Łódź",
      coordinates: { lat: 51.7767, lng: 19.4547 }
    },
    organization: "Urząd Miasta Łodzi - Wydział Zarządzania Kryzysowego",
    lastUpdated: "2024-05-11T10:15:00Z"
  }
];
mockResources.push(...lodzResources);

// Generate resources for Szczecin
const szczecinResources: Resource[] = [
  {
    id: "sz1",
    name: "Bariery przeciwpowodziowe mobilne",
    description: "System mobilnych barier przeciwpowodziowych, 100m",
    quantity: 5,
    unit: "zestaw",
    category: "equipment",
    status: "available",
    location: {
      name: "Port Szczecin - Magazyn Zarządu Portu",
      address: "ul. Bytomska 7, 70-603 Szczecin",
      coordinates: { lat: 53.4289, lng: 14.5530 }
    },
    organization: "Zarząd Morskich Portów Szczecin i Świnoujście",
    lastUpdated: "2025-03-03T15:00:00Z"
  },
  {
    id: "sz2",
    name: "Psychologowie kryzysowi",
    description: "Zespół psychologów specjalizujących się w interwencji kryzysowej",
    quantity: 3,
    unit: "zespół",
    category: "personnel",
    status: "available",
    location: {
      name: "Centrum Interwencji Kryzysowej Szczecin",
      address: "ul. Sikorskiego 10, 70-313 Szczecin",
      coordinates: { lat: 53.4250, lng: 14.5400 }
    },
    organization: "MOPS Szczecin",
    lastUpdated: "2025-04-01T12:00:00Z"
  },
  {
    id: "szczecin-camp-beds-1",
    name: "Łóżka polowe",
    description: "Łóżka polowe z kocami.",
    quantity: 80,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "PCK Szczecin",
      address: "ul. Centrum, 70-313 Szczecin",
      coordinates: { lat: 53.4300, lng: 14.5550 }
    },
    organization: "PCK Szczecin",
    lastUpdated: "2024-05-11T11:00:00Z"
  }
];
mockResources.push(...szczecinResources);

// Generate resources for Lublin
const lublinResources: Resource[] = [
  {
    id: "lb1",
    name: "Cysterna na wodę pitną 10000L",
    description: "Cysterna samochodowa do transportu wody pitnej",
    quantity: 2,
    unit: "szt",
    category: "water",
    status: "available",
    location: {
      name: "MPWiK Lublin Baza",
      address: "Al. Jana Pawła II 15, 20-535 Lublin",
      coordinates: { lat: 51.2300, lng: 22.5000 }
    },
    organization: "MPWiK Lublin",
    lastUpdated: "2024-11-25T14:50:00Z",
    telemetry: { lastSignal: "2024-11-25T14:45:00Z" }
  },
  {
    id: "lb2",
    name: "Żywność dla niemowląt i dzieci",
    description: "Mleko modyfikowane, kaszki, słoiczki",
    quantity: 500,
    unit: "kg",
    category: "food",
    status: "available",
    location: {
      name: "Magazyn Caritas Lublin",
      address: "ul. Unii Lubelskiej 15, 20-108 Lublin",
      coordinates: { lat: 51.2500, lng: 22.5700 }
    },
    organization: "Caritas Archidiecezji Lubelskiej",
    lastUpdated: "2025-02-18T10:30:00Z"
  },
  {
    id: "lublin-camp-beds-1",
    name: "Łóżka polowe",
    description: "Łóżka polowe, stan dobry.",
    quantity: 100,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Magazyn Obrony Cywilnej Lublin",
      address: "ul. Śródmieście, 20-108 Lublin",
      coordinates: { lat: 51.2480, lng: 22.5700 }
    },
    organization: "Magazyn Obrony Cywilnej Lublin",
    lastUpdated: "2024-05-11T12:30:00Z"
  }
];
mockResources.push(...lublinResources);

// Generate resources for Katowice
const katowiceResources: Resource[] = [
  {
    id: "kt1",
    name: "Sprzęt do ratownictwa górniczego",
    description: "Aparaty ucieczkowe, detektory gazu, sprzęt hydrauliczny",
    quantity: 3,
    unit: "zestaw",
    category: "equipment",
    status: "available",
    location: {
      name: "Centralna Stacja Ratownictwa Górniczego S.A.",
      address: "ul. Chorzowska 109, 40-101 Katowice",
      coordinates: { lat: 50.2650, lng: 19.0000 }
    },
    organization: "CSRG S.A.",
    lastUpdated: "2025-03-22T11:15:00Z"
  },
  {
    id: "kt2",
    name: "Szpital polowy (modułowy)",
    description: "Modułowy szpital polowy, 50 łóżek, sala operacyjna",
    quantity: 1,
    unit: "szt",
    category: "medical",
    status: "reserved",
    location: {
      name: "Rezerwa Medyczna Katowice",
      address: "ul. Medyków 16, 40-752 Katowice",
      coordinates: { lat: 50.2200, lng: 18.9700 }
    },
    organization: "Ministerstwo Zdrowia",
    lastUpdated: "2025-04-10T16:00:00Z"
  }
];
mockResources.push(...katowiceResources);

// Generate resources for Białystok
const bialystokResources: Resource[] = [
  {
    id: "bi1",
    name: "Pojazd terenowy typu quad z przyczepką",
    description: "Quad 4x4 z małą przyczepką transportową",
    quantity: 4,
    unit: "szt",
    category: "vehicle",
    status: "available",
    location: {
      name: "Straż Graniczna Białystok",
      address: "ul. Bema 100, 15-370 Białystok",
      coordinates: { lat: 53.1200, lng: 23.1800 }
    },
    organization: "Straż Graniczna",
    lastUpdated: "2024-12-15T09:30:00Z",
    telemetry: { fuel: 80, lastSignal: "2024-12-15T09:25:00Z" }
  },
  {
    id: "bi2",
    name: "Worki z piaskiem",
    description: "Gotowe do użycia worki z piaskiem",
    quantity: 2000,
    unit: "szt",
    category: "equipment",
    status: "available",
    location: {
      name: "Magazyn Przeciwpowodziowy Białystok",
      address: "ul. Produkcyjna 110, 15-680 Białystok",
      coordinates: { lat: 53.1500, lng: 23.0800 }
    },
    organization: "Urząd Miasta Białystok",
    lastUpdated: "2025-01-05T12:00:00Z"
  }
];
mockResources.push(...bialystokResources);

// Generate resources for Gdynia
const gdyniaResources: Resource[] = [
  {
    id: "gy1",
    name: "Sprzęt do ratownictwa morskiego",
    description: "Pławy ratunkowe, tratwy, kombinezony ratunkowe",
    quantity: 10,
    unit: "zestaw",
    category: "equipment",
    status: "available",
    location: {
      name: "SAR Gdynia",
      address: "ul. Polska 1, 81-339 Gdynia",
      coordinates: { lat: 54.5200, lng: 18.5300 }
    },
    organization: "Morska Służba Poszukiwania i Ratownictwa",
    lastUpdated: "2025-03-18T14:00:00Z"
  },
  {
    id: "gy2",
    name: "Radiotelefony cyfrowe DMR",
    description: "Zestaw radiotelefonów cyfrowych z ładowarkami",
    quantity: 50,
    unit: "szt",
    category: "equipment",
    status: "available",
    location: {
      name: "Zarządzanie Kryzysowe Gdynia",
      address: "Al. Marszałka Piłsudskiego 52/54, 81-382 Gdynia",
      coordinates: { lat: 54.5150, lng: 18.5400 }
    },
    organization: "Urząd Miasta Gdynia",
    lastUpdated: "2024-11-30T10:45:00Z",
    telemetry: { battery: 98, lastSignal: "2024-11-30T10:40:00Z" }
  }
];
mockResources.push(...gdyniaResources);

// Generate resources for Częstochowa
const czestochowaResources: Resource[] = [
  {
    id: "cz1",
    name: "Oświetlenie awaryjne masztowe",
    description: "Przenośne maszty oświetleniowe z agregatem",
    quantity: 6,
    unit: "szt",
    category: "power",
    status: "available",
    location: {
      name: "PSP Częstochowa JRG 1",
      address: "ul. Legionów 56, 42-200 Częstochowa",
      coordinates: { lat: 50.8000, lng: 19.1200 }
    },
    organization: "Straż Pożarna",
    lastUpdated: "2025-02-28T13:30:00Z",
    telemetry: { fuel: 90, lastSignal: "2025-02-28T13:25:00Z" }
  }
];
mockResources.push(...czestochowaResources);

// Generate resources for Radom
const radomResources: Resource[] = [
  {
    id: "ra1",
    name: "Paliwo (diesel) w zbiornikach mobilnych",
    description: "Zbiorniki mobilne z olejem napędowym, 1000L każdy",
    quantity: 5,
    unit: "zbiornik",
    category: "equipment",
    status: "available",
    location: {
      name: "Baza Paliw Radom",
      address: "ul. Warszawska 220, 26-600 Radom",
      coordinates: { lat: 51.4300, lng: 21.1800 }
    },
    organization: "PKN Orlen",
    lastUpdated: "2025-04-05T09:00:00Z"
  }
];
mockResources.push(...radomResources);

// Generate resources for Toruń
const torunResources: Resource[] = [
  {
    id: "to1",
    name: "Zestawy pierwszej pomocy (rozszerzone)",
    description: "Apteczki R1 z dodatkowym wyposażeniem",
    quantity: 30,
    unit: "szt",
    category: "medical",
    status: "available",
    location: {
      name: "Szpital Miejski Toruń",
      address: "ul. Batorego 17/19, 87-100 Toruń",
      coordinates: { lat: 53.0100, lng: 18.6000 }
    },
    organization: "Urząd Miasta Toruń",
    lastUpdated: "2025-01-10T11:20:00Z"
  }
];
mockResources.push(...torunResources);

// Generate resources for Rzeszów
const rzeszowResources: Resource[] = [
  {
    id: "rz1",
    name: "Drony z kamerą termowizyjną",
    description: "Drony obserwacyjne z kamerami termowizyjnymi i standardowymi",
    quantity: 2,
    unit: "szt",
    category: "equipment",
    status: "maintenance",
    location: {
      name: "Podkarpackie Centrum Ratownictwa Medycznego",
      address: "ul. Poniatowskiego 4, 35-026 Rzeszów",
      coordinates: { lat: 50.0300, lng: 22.0000 }
    },
    organization: "Urząd Marszałkowski Województwa Podkarpackiego",
    lastUpdated: "2025-04-15T10:00:00Z",
    telemetry: { battery: 40, lastSignal: "2025-04-15T09:50:00Z" }
  }
];
mockResources.push(...rzeszowResources);

// Generate resources for Olsztyn
const olsztynResources: Resource[] = [
  {
    id: "ol1",
    name: "Sanitariaty przenośne",
    description: "Kontenery sanitarne z prysznicami i toaletami",
    quantity: 4,
    unit: "kontener",
    category: "shelter",
    status: "available",
    location: {
      name: "Zakład Gospodarki Komunalnej Olsztyn",
      address: "ul. Lubelska 46, 10-409 Olsztyn",
      coordinates: { lat: 53.7700, lng: 20.4900 }
    },
    organization: "Urząd Miasta Olsztyn",
    lastUpdated: "2024-10-20T15:00:00Z"
  }
];
mockResources.push(...olsztynResources);

// Generate resources for Bydgoszcz
const bydgoszczResources: Resource[] = [
  {
    id: "by1",
    name: "Pojazdy ciężarowe z HDS",
    description: "Samochody ciężarowe z hydraulicznym dźwigiem samochodowym",
    quantity: 3,
    unit: "szt",
    category: "vehicle",
    status: "available",
    location: {
      name: "Baza Transportowa Bydgoszcz",
      address: "ul. Przemysłowa 34, 85-758 Bydgoszcz",
      coordinates: { lat: 53.1300, lng: 18.0000 }
    },
    organization: "Poczta Polska",
    lastUpdated: "2025-03-01T08:00:00Z",
    telemetry: { fuel: 75, lastSignal: "2025-03-01T07:55:00Z" }
  },
  {
    id: "by2-personnel",
    name: "Kierowcy pojazdów ciężarowych kat. C+E",
    description: "Doświadczeni kierowcy do transportu zaopatrzenia",
    quantity: 10,
    unit: "osób",
    category: "personnel",
    status: "available",
    location: {
      name: "Baza Transportowa Bydgoszcz",
      address: "ul. Przemysłowa 34, 85-758 Bydgoszcz",
      coordinates: { lat: 53.1320, lng: 18.0050 }
    },
    organization: "Poczta Polska",
    lastUpdated: "2025-05-10T10:00:00Z"
  },
  {
    id: "bydgoszcz-camp-beds-1",
    name: "Łóżka polowe",
    description: "Łóżka polowe dla potrzebujących.",
    quantity: 70,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "PCK Bydgoszcz",
      address: "ul. Fordon, 85-758 Bydgoszcz",
      coordinates: { lat: 53.1250, lng: 18.0100 }
    },
    organization: "PCK Bydgoszcz",
    lastUpdated: "2024-05-11T13:00:00Z"
  }
];
mockResources.push(...bydgoszczResources);

// Add more varied personnel
const additionalPersonnelResources: Resource[] = [
  {
    id: "pers1",
    name: "Strażacy OSP (Jednostka Mobilna)",
    description: "Drużyna strażaków ochotników gotowa do szybkiego reagowania.",
    quantity: 2,
    unit: "drużyn",
    category: "personnel",
    status: "available",
    location: {
      name: "Remiza OSP Warszawa-Wesoła",
      address: "ul. Leśna 5, 05-077 Warszawa",
      coordinates: { lat: 52.2550, lng: 21.2350 }
    },
    organization: "OSP Warszawa-Wesoła",
    lastUpdated: "2025-05-01T08:00:00Z"
  },
  {
    id: "pers2",
    name: "Technicy logistyki kryzysowej",
    description: "Specjaliści ds. zarządzania łańcuchem dostaw w sytuacjach kryzysowych.",
    quantity: 5,
    unit: "osób",
    category: "personnel",
    status: "available",
    location: {
      name: "Centrum Logistyczne RARS",
      address: "ul. Logistyczna 10, 02-495 Warszawa",
      coordinates: { lat: 52.1800, lng: 20.9000 }
    },
    organization: "Rządowa Agencja Rezerw Strategicznych",
    lastUpdated: "2025-04-25T14:30:00Z"
  },
  {
    id: "pers3",
    name: "Operatorzy dronów z uprawnieniami",
    description: "Certyfikowani operatorzy dronów do zadań rozpoznawczych i mapowania.",
    quantity: 3,
    unit: "zespołów",
    category: "personnel",
    status: "maintenance",
    location: {
      name: "Baza Lotnicza Straży Granicznej",
      address: "Nowy Dwór Mazowiecki, Lotnisko Modlin",
      coordinates: { lat: 52.4511, lng: 20.6518 }
    },
    organization: "Straż Graniczna",
    lastUpdated: "2025-05-05T11:00:00Z"
  },
  {
    id: "pers4",
    name: "Specjaliści ds. komunikacji kryzysowej",
    description: "Eksperci ds. PR i komunikacji z mediami oraz ludnością w kryzysie.",
    quantity: 4,
    unit: "osób",
    category: "personnel",
    status: "available",
    location: {
      name: "Rządowe Centrum Bezpieczeństwa",
      address: "Al. Ujazdowskie 5, 00-583 Warszawa",
      coordinates: { lat: 52.2167, lng: 21.0222 }
    },
    organization: "Rządowe Centrum Bezpieczeństwa",
    lastUpdated: "2025-04-15T09:00:00Z"
  },
  {
    id: "pers5",
    name: "Wolontariusze - wsparcie logistyczne",
    description: "Zarejestrowani wolontariusze do pomocy w sortowaniu, pakowaniu i dystrybucji.",
    quantity: 50,
    unit: "osób",
    category: "personnel",
    status: "available",
    location: {
      name: "Miejski Ośrodek Pomocy Wolontariuszom Kraków",
      address: "ul. Wolontariacka 1, 30-001 Kraków",
      coordinates: { lat: 50.0600, lng: 19.9420 }
    },
    organization: "Wolontariat Miejski Kraków",
    lastUpdated: "2025-05-08T16:00:00Z"
  },
  {
    id: "pers6",
    name: "Ratownicy GOPR",
    description: "Górskie Ochotnicze Pogotowie Ratunkowe - grupa interwencyjna.",
    quantity: 2,
    unit: "zespołów",
    category: "personnel",
    status: "available",
    location: {
      name: "Stacja Centralna GOPR Zakopane",
      address: "ul. Piłsudskiego 63a, 34-500 Zakopane",
      coordinates: { lat: 49.2920, lng: 19.9600 }
    },
    organization: "GOPR",
    lastUpdated: "2025-05-02T10:15:00Z"
  }
];
mockResources.push(...additionalPersonnelResources);

export const getAllResources = (): Promise<Resource[]> => {
  return Promise.resolve([...mockResources]);
};

export const getResourceById = (id: string): Promise<Resource | undefined> => {
  const resource = mockResources.find(resource => resource.id === id);
  return Promise.resolve(resource);
};

export const getResourcesByCategory = (category: ResourceCategory): Promise<Resource[]> => {
  const resources = mockResources.filter(resource => resource.category === category);
  return Promise.resolve(resources);
};

export const getResourcesByStatus = (status: ResourceStatus): Promise<Resource[]> => {
  const resources = mockResources.filter(resource => resource.status === status);
  return Promise.resolve(resources);
};

export const getResourcesByOrganization = (organization: string): Promise<Resource[]> => {
  const resources = mockResources.filter(resource => resource.organization === organization);
  return Promise.resolve(resources);
};

export const filterResources = (
  search: string = '',
  category: string = '',
  status: string = '',
  organization: string = ''
): Promise<Resource[]> => {
  let filtered = [...mockResources];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(resource => 
      resource.name.toLowerCase().includes(searchLower) || 
      resource.description.toLowerCase().includes(searchLower) ||
      resource.location.name.toLowerCase().includes(searchLower) ||
      resource.location.address.toLowerCase().includes(searchLower)
    );
  }
  
  if (category) {
    filtered = filtered.filter(resource => resource.category === category);
  }
  
  if (status) {
    filtered = filtered.filter(resource => resource.status === status);
  }
  
  if (organization) {
    filtered = filtered.filter(resource => resource.organization === organization);
  }
  
  return Promise.resolve(filtered);
};

export const addResource = (resource: Omit<Resource, 'id'>): Promise<Resource> => {
  const newResource: Resource = {
    ...resource,
    id: `r${mockResources.length + 1}`,
    lastUpdated: new Date().toISOString()
  };
  
  mockResources.push(newResource);
  return Promise.resolve(newResource);
};

export const updateResource = (resource: Resource): Promise<Resource> => {
  const index = mockResources.findIndex(r => r.id === resource.id);
  
  if (index === -1) {
    return Promise.reject(new Error("Resource not found"));
  }
  
  const updatedResource = {
    ...resource,
    lastUpdated: new Date().toISOString()
  };
  
  mockResources[index] = updatedResource;
  return Promise.resolve(updatedResource);
};

export const deleteResource = (id: string): Promise<boolean> => {
  const index = mockResources.findIndex(resource => resource.id === id);
  
  if (index === -1) {
    return Promise.reject(new Error("Resource not found"));
  }
  
  mockResources.splice(index, 1);
  return Promise.resolve(true);
};

export const getCategoryLabel = (category: ResourceCategory): string => {
  const labels: Record<ResourceCategory, string> = {
    equipment: 'Sprzęt',
    medical: 'Zasoby medyczne',
    vehicle: 'Pojazdy',
    shelter: 'Schronienie',
    personnel: 'Personel',
    food: 'Żywność',
    water: 'Woda',
    power: 'Zasilanie',
    other: 'Inne'
  };
  
  return labels[category] || category;
};

export const getStatusLabel = (status: ResourceStatus): string => {
  const labels: Record<ResourceStatus, string> = {
    available: 'Dostępny',
    reserved: 'Zarezerwowany',
    unavailable: 'Niedostępny',
    maintenance: 'W serwisie'
  };
  
  return labels[status] || status;
};

export const getStatusClass = (status: ResourceStatus): string => {
  const classes: Record<ResourceStatus, string> = {
    available: 'status-indicator-available',
    reserved: 'status-indicator-reserved',
    unavailable: 'status-indicator-unavailable',
    maintenance: 'status-indicator-maintenance'
  };
  
  return classes[status] || '';
};

// Categories for selection
export const resourceCategories: { value: ResourceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie kategorie' },
  { value: 'equipment', label: 'Sprzęt' },
  { value: 'medical', label: 'Zasoby medyczne' },
  { value: 'vehicle', label: 'Pojazdy' },
  { value: 'shelter', label: 'Schronienie' },
  { value: 'personnel', label: 'Personel' },
  { value: 'food', label: 'Żywność' },
  { value: 'water', label: 'Woda' },
  { value: 'power', label: 'Zasilanie' },
  { value: 'other', label: 'Inne' }
];

// Statuses for selection
export const resourceStatuses: { value: ResourceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie statusy' },
  { value: 'available', label: 'Dostępny' },
  { value: 'reserved', label: 'Zarezerwowany' },
  { value: 'unavailable', label: 'Niedostępny' },
  { value: 'maintenance', label: 'W serwisie' }
];

// Organizations for selection
export const resourceOrganizations: { value: string; label: string }[] = [
  { value: 'all', label: 'Wszystkie organizacje' },
  { value: 'Straż Pożarna', label: 'Straż Pożarna' },
  { value: 'Urząd Miasta', label: 'Urząd Miasta' },
  { value: 'Czerwony Krzyż', label: 'Czerwony Krzyż' },
  { value: 'Pogotowie Ratunkowe', label: 'Pogotowie Ratunkowe' },
  { value: 'Urząd Wojewódzki', label: 'Urząd Wojewódzki' },
  { value: 'WOPR', label: 'WOPR' },
  { value: 'Urząd Miasta Kraków', label: 'Urząd Miasta Kraków' },
  { value: 'Urząd Wojewódzki Pomorski', label: 'Urząd Wojewódzki Pomorski' },
  { value: 'Wojsko Polskie', label: 'Wojsko Polskie' },
  { value: 'Rządowa Agencja Rezerw Strategicznych', label: 'Rządowa Agencja Rezerw Strategicznych' },
  { value: 'PGE Energia Ciepła', label: 'PGE Energia Ciepła' },
  { value: 'Zarząd Morskich Portów Szczecin i Świnoujście', label: 'Zarząd Morskich Portów Szczecin i Świnoujście' },
  { value: 'MOPS Szczecin', label: 'MOPS Szczecin' },
  { value: 'MPWiK Lublin', label: 'MPWiK Lublin' },
  { value: 'Caritas Archidiecezji Lubelskiej', label: 'Caritas Archidiecezji Lubelskiej' },
  { value: 'CSRG S.A.', label: 'CSRG S.A.' },
  { value: 'Ministerstwo Zdrowia', label: 'Ministerstwo Zdrowia' },
  { value: 'Straż Graniczna', label: 'Straż Graniczna' },
  { value: 'Morska Służba Poszukiwania i Ratownictwa', label: 'Morska Służba Poszukiwania i Ratownictwa' },
  { value: 'PKN Orlen', label: 'PKN Orlen' },
  { value: 'Urząd Marszałkowski Województwa Podkarpackiego', label: 'Urząd Marszałkowski Województwa Podkarpackiego' },
  { value: 'Poczta Polska', label: 'Poczta Polska' },
  { value: 'Urząd Miasta Poznań', label: 'Urząd Miasta Poznań' },
  { value: 'Urząd Miasta Łódź', label: 'Urząd Miasta Łódź' },
  { value: 'Urząd Miasta Białystok', label: 'Urząd Miasta Białystok' },
  { value: 'Urząd Miasta Gdynia', label: 'Urząd Miasta Gdynia' },
  { value: 'Urząd Miasta Toruń', label: 'Urząd Miasta Toruń' },
  { value: 'Urząd Miasta Olsztyn', label: 'Urząd Miasta Olsztyn' },
  { value: 'OSP Warszawa-Wesoła', label: 'OSP Warszawa-Wesoła' },
  { value: 'Rządowe Centrum Bezpieczeństwa', label: 'Rządowe Centrum Bezpieczeństwa' },
  { value: 'Wolontariat Miejski Kraków', label: 'Wolontariat Miejski Kraków' },
  { value: 'GOPR', label: 'GOPR' },
  { value: 'PCK Poznań', label: 'PCK Poznań' },
  { value: 'Magazyn Rezerw Strategicznych Wrocław', label: 'Magazyn Rezerw Strategicznych Wrocław' },
  { value: 'Urząd Miasta Łodzi - Wydział Zarządzania Kryzysowego', label: 'Urząd Miasta Łodzi - Wydział Zarządzania Kryzysowego' },
  { value: 'PCK Szczecin', label: 'PCK Szczecin' },
  { value: 'Magazyn Obrony Cywilnej Lublin', label: 'Magazyn Obrony Cywilnej Lublin' },
  { value: 'PCK Bydgoszcz', label: 'PCK Bydgoszcz' }
];

export const getResourceStats = async () => {
  return Promise.resolve({
    foodSupply: {
      ownResources: 5,
      privateResources: 12,
      requiredDays: 7
    },
    hospitalBeds: {
      total: 2500,
      available: 750,
      bedsPerTenThousand: 7.5,
      availabilityPercentage: 30
    }
  });
};

export const commune: {
  name: string;
} = {
  name: 'Warszawa'
};