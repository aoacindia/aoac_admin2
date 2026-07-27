export type DomainStatus = "Active" | "Inactive";

export type DemoDomain = {
  id: string;
  name: string;
  status: DomainStatus;
  validUntil: string;
};

export const DEMO_DOMAINS: DemoDomain[] = [
  {
    id: "domain-1",
    name: "aoac.in",
    status: "Active",
    validUntil: "19 September 2026",
  },
];
