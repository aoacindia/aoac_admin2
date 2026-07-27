export type AdminAccountRole = "OWNER" | "ADMIN" | "USER";
export type AdminAccountStatus = "Active" | "Inactive";

export type DemoAdminAccount = {
  id: string;
  name: string;
  email: string;
  role: AdminAccountRole;
  status: AdminAccountStatus;
};

export const DEMO_ADMIN_ACCOUNTS: DemoAdminAccount[] = [
  {
    id: "admin-1",
    name: "Manjeet Chandra",
    email: "majormchandra@gmail.com",
    role: "ADMIN",
    status: "Active",
  },
  {
    id: "admin-2",
    name: "Teruo Miura",
    email: "teruomiura@ashaasia.org",
    role: "OWNER",
    status: "Active",
  },
  {
    id: "admin-3",
    name: "Nida",
    email: "nida@ashaasia.org",
    role: "USER",
    status: "Inactive",
  },
  {
    id: "admin-4",
    name: "Manjeet Chandra",
    email: "mchandra@ashaasia.org",
    role: "USER",
    status: "Inactive",
  },
];
