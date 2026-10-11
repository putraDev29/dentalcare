export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "E-Health Sentosa",
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  dataSource: (process.env.NEXT_PUBLIC_DATA_SOURCE || "api") as "mock" | "api",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
  defaultFacilityId: "FAC-001",
  facilities: [
    {
      id: "FAC-001",
      name: "RS Sehat Sentosa Pusat",
      city: "Jakarta Pusat",
      type: "hospital" as const,
      address: "Jl. Diponegoro No. 45, Menteng",
      phone: "(021) 314-5000",
    },
    {
      id: "FAC-002",
      name: "Klinik Sehat Sentosa Bekasi",
      city: "Bekasi Barat",
      type: "clinic" as const,
      address: "Jl. Ahmad Yani No. 12, Bekasi",
      phone: "(021) 889-2000",
    },
    {
      id: "FAC-003",
      name: "Laboratorium & Diagnostik Sentosa",
      city: "Jakarta Selatan",
      type: "laboratory" as const,
      address: "Jl. TB Simatupang No. 88, Cilandak",
      phone: "(021) 750-1000",
    },
  ],
};

