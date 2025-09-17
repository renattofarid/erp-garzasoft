import * as LucideReact from "lucide-react";

export interface ModelInterface {
  name: string;
  plural?: string;
  gender: boolean; // true for F and false for M
  message?: string;
}

export interface ModelComplete<T = undefined> {
  MODEL: ModelInterface;
  ICON: keyof typeof LucideReact;
  ENDPOINT: string;
  QUERY_KEY: string;
  ROUTE: string;
  ROUTE_ADD?: string;
  ROUTE_UPDATE?: string;
  EMPTY?: T;
}

export interface Option {
  label: string | (() => React.ReactNode);
  value: string;
  description?: string;
}

export interface MonthOption {
  value: string;
  label: string;
}

export type Action = "create" | "update" | "delete";
