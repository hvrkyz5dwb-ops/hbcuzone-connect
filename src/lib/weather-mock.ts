export const mockWeather = {
  tempF: 72,
  condition: "Clear",
  emoji: "☀️",
  high: 78,
  low: 61,
  campus: "Talladega",
  blurb: "Perfect day for the Yard",
};

export function greetingFor(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}