import type { DailyWeight, WeightMeasurement } from "@/lib/types";

export function calculateDailyWeights(
  measurements: WeightMeasurement[],
): DailyWeight[] {
  const days = new Map<string, { total: number; count: number }>();

  for (const measurement of measurements) {
    const day = days.get(measurement.measurement_date) ?? {
      total: 0,
      count: 0,
    };
    day.total += Number(measurement.weight);
    day.count += 1;
    days.set(measurement.measurement_date, day);
  }

  return Array.from(days, ([date, value]) => ({
    date,
    average: value.total / value.count,
    measurementCount: value.count,
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export function groupMeasurementsByDay(measurements: WeightMeasurement[]) {
  const groups = new Map<string, WeightMeasurement[]>();

  for (const measurement of measurements) {
    const group = groups.get(measurement.measurement_date) ?? [];
    group.push(measurement);
    groups.set(measurement.measurement_date, group);
  }

  return Array.from(groups, ([date, entries]) => ({
    date,
    entries: entries.sort((a, b) =>
      b.measured_at.localeCompare(a.measured_at),
    ),
    average:
      entries.reduce((sum, entry) => sum + Number(entry.weight), 0) /
      entries.length,
  })).sort((a, b) => b.date.localeCompare(a.date));
}
