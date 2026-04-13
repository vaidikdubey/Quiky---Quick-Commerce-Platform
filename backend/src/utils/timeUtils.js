export const formatDuration = (ms) => {
  if (!ms || ms < 0) return "N/A";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(seconds / 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? "s" : ""}`);
  if (seconds > 0 && hours === 0)
    parts.push(`${seconds} sec${seconds > 1 ? "s" : ""}`);

  return parts.join(" ") || "0 sec";
};

export const formatTimeDifference = (diffMs) => {
  if (diffMs === null || diffMs === undefined) return null;

  const absMs = Math.abs(diffMs);
  const minutes = Math.round(absMs / 60000); // round to nearest minute

  if (minutes === 0) return "Delivered on time";

  const direction = diffMs > 0 ? "late" : "early";
  return `Delivered ${minutes} min${minutes > 1 ? "s" : ""} ${direction}`;
};
