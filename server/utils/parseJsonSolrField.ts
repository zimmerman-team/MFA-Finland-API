import get from "lodash/get";

export function parseJsonSolrField(obj: any, field: string) {
  if (!obj) {
    return "";
  }
  const value = JSON.parse(obj);
  return get(value, field, "");
}
