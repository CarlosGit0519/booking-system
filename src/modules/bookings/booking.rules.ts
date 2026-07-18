export interface WorkingHours {
  startTime: string;
  endTime: string;
}

function getMinutesSinceMidnight(date: Date): number {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function getMinutesFromTime(value: string): number {
  const hours = Number(value.slice(0, 2));
  const minutes = Number(value.slice(3, 5));
  return hours * 60 + minutes;
}

export function isWithinWorkingHours(
  startAt: Date,
  endAt: Date,
  schedule: WorkingHours | null,
): boolean {
  if (!schedule || endAt.getUTCDate() !== startAt.getUTCDate()) {
    return false;
  }

  const startMinutes = getMinutesSinceMidnight(startAt);
  const endMinutes = getMinutesSinceMidnight(endAt);

  return (
    startMinutes >= getMinutesFromTime(schedule.startTime) &&
    endMinutes <= getMinutesFromTime(schedule.endTime)
  );
}
