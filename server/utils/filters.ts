import { globalSearchFields } from "../static/globalSearchFields";

export function getFormattedSearchParam(q: string) {
  return globalSearchFields
    .map((field: string) => `${field}:"${q}"`)
    .join(" OR ");
}

export function getFormattedFilters(filters: any): string {
  if (typeof filters === "string") {
    return getFormattedSearchParam(filters);
  }

  const filterKeys = Object.keys(filters);
  if (filterKeys.length === 0) {
    return "*:*";
  }

  let result = "";
  filterKeys.forEach((filterKey: string, index: number) => {
    if (filterKey === "budget_value") {
      result += `${filterKey}:[${filters[filterKey].join(" TO ")}]${
        index === filterKeys.length - 1 ? "" : " AND "
      }`;
    } else if (filterKey === "period") {
      result += `activity_date_start_actual_f: [${
        filters[filterKey][0].startDate
      } TO ${
        filters[filterKey][0].endDate
      }] OR activity_date_start_planned_f: [${
        filters[filterKey][0].startDate
      } TO ${filters[filterKey][0].endDate}]${
        index === filterKeys.length - 1 ? "" : " AND "
      }\`;`;
    } else if (filterKey !== "year_period") {
      result += `${filterKey}:(${filters[filterKey].join(" ")})${
        index === filterKeys.length - 1 ? "" : " AND "
      }`;
    }
  });

  return result;
}

export function getQuery(filters: any, search: string, searchFields: string[]) {
  if (typeof filters === "string") {
    return getFormattedSearchParam(filters);
  }
  const filterKeys = Object.keys(filters);
  if (filterKeys.length === 0 && search.length === 0) {
    return "*:*";
  }

  let query = "";
  if (filterKeys.length > 0) {
    filterKeys.forEach((filterKey: string, index: number) => {
      if (filterKey === "budget_value") {
        query += `${filterKey}:[${filters[filterKey].join(" TO ")}]${
          index === filterKeys.length - 1 ? "" : " AND "
        }`;
      } else if (filterKey === "period") {
        query += `(activity_date_start_actual_f: [${
          filters[filterKey][0].startDate
        } TO *] OR activity_date_start_planned_f: [${
          filters[filterKey][0].startDate
        } TO *]) AND (activity_date_end_actual_f: [* TO ${
          filters[filterKey][0].endDate
        }] OR activity_date_end_planned_f: [* TO ${
          filters[filterKey][0].endDate
        }])${index === filterKeys.length - 1 ? "" : " AND "}\`;`;
      } else if (filterKey === "year_period") {
        query += `(activity_date_start_actual_f:[${
          filters[filterKey]
        }-01-01T00:00:00Z TO ${
          filters[filterKey]
        }-12-31T23:59:59Z] OR activity_date_start_planned_f:[${
          filters[filterKey]
        }-01-01T00:00:00Z TO ${filters[filterKey]}-12-31T23:59:59Z])${
          index === filterKeys.length - 1 ? "" : " AND "
        }`;
      } else {
        query += `${filterKey}:(${filters[filterKey].join(" ")})${
          index === filterKeys.length - 1 ? "" : " AND "
        }`;
      }
    });
  }

  if (search.length > 0 && filterKeys.length > 0) {
    query += " AND (";
    query += searchFields
      .map((field: string) => `${field}:(${search})`)
      .join(" OR ");
    query += ")";
  }

  if (search.length > 0 && filterKeys.length <= 0) {
    query += searchFields
      .map((field: string) => `${field}:(${search})`)
      .join(" OR ");
  }

  return query;
}
