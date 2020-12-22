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

export function formatDate(strDate: string | null | undefined) {
  if (strDate) {
    const tempDate = new Date(strDate);
    return `${tempDate.getDate()} ${
      shortMonthNames[tempDate.getMonth()]
    } ${tempDate.getFullYear()}`;
  }
  return "";
}
