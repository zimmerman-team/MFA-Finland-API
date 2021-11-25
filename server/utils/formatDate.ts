const shortMonthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const shortMonthNamesFI = [
  "tammikuu",
  "helmikuu",
  "maaliskuu",
  "huhtikuu",
  "toukokuu",
  "kesäkuu",
  "heinäkuu",
  "elokuu",
  "syyskuu",
  "lokakuu",
  "marraskuu",
  "joulukuu"
];
const shortMonthNamesSE = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december"
];

export function formatDate(
  strDate: string | null | undefined,
  returnType?: string,
  lang?: string
) {
  let monthNames = shortMonthNames;
  if (lang === "fi") {
    monthNames = shortMonthNamesFI;
  }
  if (lang === "se") {
    monthNames = shortMonthNamesSE;
  }
  if (strDate) {
    const tempDate = new Date(strDate);
    if (returnType === "year") {
      return tempDate.getFullYear();
    }
    return `${tempDate.getDate()}${lang === "fi" ? "." : ""} ${
      monthNames[tempDate.getMonth()]
    } ${tempDate.getFullYear()}`;
  }
  return "";
}
