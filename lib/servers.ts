export type ServerStatus = "Running" | "Stopped";

export type DemoServer = {
  id: string;
  name: string;
  ipAddress: string;
  status: ServerStatus;
  validUntil: string;
};

export const DEMO_SERVERS: DemoServer[] = [
  {
    id: "server-1",
    name: "srv.756446.io",
    ipAddress: "145.345.654.6",
    status: "Running",
    validUntil: "19 September 2026",
  },
];
