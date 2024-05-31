export interface Stat {
  current: number;
  previous: number;
  growth: number;
}

export interface CategoryStat {
  name: string;
  count: number;
  percentage: number;
}

export interface OrderStat {
  date: string;
  totalOrders: number;
}
