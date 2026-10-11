export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  patients: "/patients",
  users: "/users",
  doctors: "/doctors",
  schedules: "/schedules",
  appointments: "/appointments",
  queues: "/queues",
  encounters: "/encounters",
  prescriptions: "/prescriptions",
  medicines: "/medicines",
  laboratory: "/laboratory/orders",
  radiology: "/radiology/orders",
  inpatient: {
    rooms: "/inpatient/rooms",
    admissions: "/inpatient/admissions",
  },
  billing: {
    invoices: "/billing/invoices",
    payments: "/billing/payments",
  },
  inventory: "/inventory/items",
  system: {
    notifications: "/system/notifications",
    auditLogs: "/system/audit-logs",
  },
};

