const shortMonthNames = [
  "Jan",
  "Feb",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export function formatDate(
  strDate: string | null | undefined,
  returnType?: string
) {
  if (strDate) {
    const tempDate = new Date(strDate);
    if (returnType === "year") {
      return tempDate.getFullYear();
    }
    return `${tempDate.getDate()} ${
      shortMonthNames[tempDate.getMonth()]
    } ${tempDate.getFullYear()}`;
  }
  return "";
}
