import get from "lodash/get";
import findIndex from "lodash/findIndex";

export function getFieldValueLang(
  lang: string,
  field: string[],
  fieldLangs: string[]
): string {
  const itemLangIndex = findIndex(fieldLangs, (fl: string) => fl === lang);
  if (itemLangIndex > -1) {
    return get(field, itemLangIndex, "");
  }
  return get(field, "[0]", "");
}
