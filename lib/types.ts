export type WeightMeasurement = {
  id: string;
  user_id: string;
  weight: number;
  measured_at: string;
  measurement_date: string;
  created_at: string;
};

export type DailyWeight = {
  date: string;
  average: number;
  measurementCount: number;
};
