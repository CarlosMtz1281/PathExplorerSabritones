export interface Country {
  country_id: number;
  country_name: string;
  region: string;
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
  Country: Country;
  Permits: Permits;
  level: number;
  position_name: string;
  gender: boolean
}