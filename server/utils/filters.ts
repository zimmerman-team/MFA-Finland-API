import { globalSearchFields } from "../static/globalSearchFields";

export function getFormattedSearchParam(q: string) {
  const qstring = globalSearchFields
    .map((field: string) => `${field}:"${q}"`)
    .join(" OR ");
  return `reporting_org_ref:${process.env.MFA_PUBLISHER_REF} AND (${qstring})`;
}

export function getFormattedFilters(
  filters: any,
  isTransaction?: boolean
): string {
  if (typeof filters === "string") {
    return getFormattedSearchParam(filters);
  }

  const filterKeys = Object.keys(filters);
  if (filterKeys.length === 0) {
    return `reporting_org_ref:${process.env.MFA_PUBLISHER_REF}`;
  }

  let result = "";
  const locations = {
    countries: [],
    regions: []
  };
  filterKeys.forEach((filterKey: string, index: number) => {
    if (filterKey === "recipient_country_code") {
      locations.countries = filters[filterKey];
    } else if (filterKey === "recipient_region_code") {
      locations.regions = filters[filterKey];
    } else if (filterKey === "budget_value") {
      result += `${filterKey}:[${filters[filterKey].join(" TO ")}]${
        index === filterKeys.length - 1 ? "" : " AND "
      }`;
    } else if (filterKey === "years") {
      result += `activity_date_start_actual_f:[${
        filters[filterKey][0]
      }-01-01T00:00:00Z TO ${
        filters[filterKey][1]
      }-12-31T23:59:59Z] OR activity_date_start_planned_f:[${
        filters[filterKey][0]
      }-01-01T00:00:00Z TO ${filters[filterKey][1]}-12-31T23:59:59Z]${
        index === filterKeys.length - 1 ? "" : " AND "
      }`;
    } else if (filterKey === "tag_code" || filterKey === "tag_narrative") {
      result += `${filterKey}:(${filters[filterKey]
        .map((value: string) => `"${value.replace("|", ",")}"`)
        .join(" ")})${index === filterKeys.length - 1 ? "" : " AND "}`;
    } else if (filterKey === "budget_line") {
      result += `tag_code:(${filters[filterKey]
        .map((value: string) => `"${value}"`)
        .join(" ")})${index === filterKeys.length - 1 ? "" : " AND "}`;
    } else if (filterKey === "human_rights_approach") {
      result += `tag_narrative:(${filters[filterKey]
        .map((value: string) => `"${value}"`)
        .join(" ")})${index === filterKeys.length - 1 ? "" : " AND "}`;
    } else if (filterKey === "participating_org_type" && isTransaction) {
      result += `participating_org_ref:(${filters[filterKey]
        .map((value: string) => `${value}*`)
        .join(" ")})`;
    } else if (filterKey !== "year_period") {
      result += `${filterKey}:(${filters[filterKey].join(" ")})${
        index === filterKeys.length - 1 ? "" : " AND "
      }`;
    }
  });

  if (locations.countries.length > 0 || locations.regions.length > 0) {
    result += `(${
      locations.countries.length > 0
        ? `recipient_country_code:(${locations.countries.join(" ")})`
        : ""
    }${
      locations.regions.length > 0
        ? `OR recipient_region_code:(${locations.regions.join(" ")})`
        : ""
    })`;
  }

  return `reporting_org_ref:${process.env.MFA_PUBLISHER_REF} AND (${result})`;
}

export function getQuery(filters: any, search: string, searchFields: string[]) {
  if (typeof filters === "string") {
    return getFormattedSearchParam(filters);
  }
  const filterKeys = Object.keys(filters);
  if (filterKeys.length === 0 && search.length === 0) {
    return `reporting_org_ref:${process.env.MFA_PUBLISHER_REF}`;
  }

  let query = "";
  if (filterKeys.length > 0) {
    filterKeys.forEach((filterKey: string, index: number) => {
      if (filterKey === "budget_value") {
        query += `${filterKey}:[${filters[filterKey].join(" TO ")}]${
          index === filterKeys.length - 1 ? "" : " AND "
        }`;
      } else if (filterKey === "years") {
        query += `activity_date_start_actual_f:[${
          filters[filterKey][0]
        }-01-01T00:00:00Z TO ${
          filters[filterKey][1]
        }-12-31T23:59:59Z] OR activity_date_start_planned_f:[${
          filters[filterKey][0]
        }-01-01T00:00:00Z TO ${filters[filterKey][1]}-12-31T23:59:59Z]${
          index === filterKeys.length - 1 ? "" : " AND "
        }`;
      } else if (filterKey === "tag_code") {
        query += `${filterKey}:(${filters[filterKey]
          .map((value: string) => `"${value}"`)
          .join(" ")})`;
      } else if (filterKey === "budget_line") {
        query += `tag_code:(${filters[filterKey]
          .map((value: string) => `"${value}"`)
          .join(" ")})`;
      } else if (filterKey === "human_rights_approach") {
        query += `tag_narrative:(${filters[filterKey]
          .map((value: string) => `"${value}"`)
          .join(" ")})`;
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

  return `reporting_org_ref:${process.env.MFA_PUBLISHER_REF} AND (${query})`;
}

export function normalizeActivity2TransactionFilters(filterstring: string) {
  return filterstring
    .replace(/recipient_country_code/g, "activity_recipient_country_code")
    .replace(/recipient_region_code/g, "activity_recipient_region_code")
    .replace(/sector_code/g, "activity_sector_code")
    .replace(/tag_narrative/g, "tag_code");
}
