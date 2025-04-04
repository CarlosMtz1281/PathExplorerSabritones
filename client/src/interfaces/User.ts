export interface Region {
  region_id: number;
  region_name: string;
  country: string;
  timezone: string;
}

export interface Permits {
  role_id: number;
  is_employee: boolean;
  is_people_lead: boolean;
  is_capability_lead: boolean;
  is_delivery_lead: boolean;
  is_admin: boolean;
}

export interface User {
  user_id: number;
  mail: string;
  password: string;
  name: string;
  birthday: string; // ISO date string
  hire_date: string; // ISO date string
  role_id: number;
  in_project: boolean;
  region_id: number;
  Region: Region;
  Permits: Permits;
}