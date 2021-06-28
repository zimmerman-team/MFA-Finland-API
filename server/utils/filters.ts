import get from "lodash/get";
import { globalSearchFields } from "../static/globalSearchFields";

const stickyPeriodFilter = `activity_date_start_actual_f:[2015-01-01T00:00:00Z TO *] OR activity_date_start_planned_f:[2015-01-01T00:00:00Z TO *]`;
const ODAstickyPeriodFilter = `transaction_value_date:[2015-01-01T00:00:00Z TO *]`;

export function getFormattedSearchParam(q: string) {
  const qstring = globalSearchFields
    .map((field: string) => `${field}:"${q}"`)
    .join(" OR ");
  return `reporting_org_ref:${process.env.MFA_PUBLISHER_REF} AND (${qstring}) AND (${stickyPeriodFilter})`;
}

export function getFormattedFilters(
  filters: any,
  isTransaction?: boolean,
  isODA?: boolean,
  isFilterOption?: boolean
): string {
  if (typeof filters === "string") {
    return getFormattedSearchParam(filters);
  }

  let localStickyPeriodFilter = stickyPeriodFilter;

  if (isFilterOption) {
    localStickyPeriodFilter +=
      " OR activity_date_iso_date:[2015-01-01T00:00:00Z TO *] OR transaction_date_iso_date:[2015-01-01T00:00:00Z TO *]";
  }

  const filterKeys = Object.keys(filters);
  if (filterKeys.length === 0) {
    return `reporting_org_ref:${process.env.MFA_PUBLISHER_REF} AND (${
      isODA ? ODAstickyPeriodFilter : localStickyPeriodFilter
    })`;
  }

  let result = "";
  const locations = {
    countries: [],
    regions: []
  };
  filterKeys.forEach((filterKey: string, index: number) => {
    const addTrailingAND =
      filterKeys.length - 1 !== index &&
      get(filterKeys, `[${index + 1}]`, "") !== "recipient_country_code" &&
      get(filterKeys, `[${index + 1}]`, "") !== "recipient_region_code";
    if (filterKey === "recipient_country_code") {
      locations.countries = filters[filterKey];
    } else if (filterKey === "recipient_region_code") {
      locations.regions = filters[filterKey];
    } else if (filterKey === "budget_value") {
      result += `${filterKey}:[${filters[filterKey].join(" TO ")}]${
        addTrailingAND ? " AND " : ""
      }`;
    } else if (filterKey === "years") {
      if (isODA) {
        result += `transaction_value_date:[${
          filters[filterKey][0]
        }-01-01T00:00:00Z TO ${filters[filterKey][1]}-12-31T23:59:59Z]${
          addTrailingAND ? " AND " : ""
        }`;
      } else {
        result += `(activity_date_start_actual_f:[${
          filters[filterKey][0]
        }-01-01T00:00:00Z TO ${
          filters[filterKey][1]
        }-12-31T23:59:59Z] OR activity_date_start_planned_f:[${
          filters[filterKey][0]
        }-01-01T00:00:00Z TO ${filters[filterKey][1]}-12-31T23:59:59Z])${
          addTrailingAND ? " AND " : ""
        }`;
      }
    } else if (filterKey === "tag_code" || filterKey === "tag_narrative") {
      result += `(tag_code:(${filters[filterKey]
        .map((value: string) => `"${value.replace("|", ",")}"`)
        .join(" ")}) OR tag_narrative:(${filters[filterKey]
        .map((value: string) => `"${value.replace("|", ",")}"`)
        .join(" ")}))${addTrailingAND ? " AND " : ""}`;
    } else if (filterKey === "sector_code") {
      result += `sector_code:(${filters[filterKey]
        .map((value: string) => `${value}${value.length < 5 ? "*" : ""}`)
        .join(" ")})${addTrailingAND ? " AND " : ""}`;
    } else if (filterKey === "budget_line") {
      result += `tag_code:(${filters[filterKey]
        .map((value: string) => `"${value}"`)
        .join(" ")})${addTrailingAND ? " AND " : ""}`;
    } else if (filterKey === "human_rights_approach") {
      result += `tag_narrative:(${filters[filterKey]
        .map((value: string) => `"${value}"`)
        .join(" ")})${addTrailingAND ? " AND " : ""}`;
    } else if (filterKey === "participating_org_type" && isTransaction) {
      result += `participating_org_ref:(${filters[filterKey]
        .map((value: string) => `${value}*`)
        .join(" ")})`;
    } else if (filterKey === "policy_marker_code") {
      result += `${filterKey}:(${filters[filterKey].join(
        " "
      )}) AND policy_marker_significance:(1 2 3 4)${
        addTrailingAND ? " AND " : ""
      }`;
    } else if (filterKey !== "year_period") {
      result += `${filterKey}:(${filters[filterKey].join(" ")})${
        addTrailingAND ? " AND " : ""
      }`;
    }
  });

  if (filterKeys.indexOf("years") === -1) {
    result += `${result.length > 0 ? " AND " : ""}(${
      isODA ? ODAstickyPeriodFilter : localStickyPeriodFilter
    })`;
  }

  if (locations.countries.length > 0 || locations.regions.length > 0) {
    result += `${result.length > 0 ? " AND " : ""}(${
      locations.countries.length > 0
        ? `recipient_country_code:(${locations.countries.join(" ")})`
        : ""
    }${
      locations.regions.length > 0
        ? `${
            locations.countries.length > 0 ? "OR " : ""
          }recipient_region_code:(${locations.regions.join(" ")})`
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
    return `reporting_org_ref:${process.env.MFA_PUBLISHER_REF} AND (${stickyPeriodFilter})`;
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
      } else if (filterKey === "tag_code" || filterKey === "tag_narrative") {
        query += `(tag_code:(${filters[filterKey]
          .map((value: string) => `"${value.replace("|", ",")}"`)
          .join(" ")}) OR tag_narrative:(${filters[filterKey]
          .map((value: string) => `"${value.replace("|", ",")}"`)
          .join(" ")}))${index === filterKeys.length - 1 ? "" : " AND "}`;
      } else if (filterKey === "sector_code") {
        query += `sector_code:(${filters[filterKey]
          .map((value: string) => `${value}${value.length < 5 ? "*" : ""}`)
          .join(" ")})${index === filterKeys.length - 1 ? "" : " AND "}`;
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
      } else if (filterKey === "policy_marker_code") {
        query += `${filterKey}:(${filters[filterKey].join(
          " "
        )}) AND policy_marker_significance:(1 2 3 4)${
          index === filterKeys.length - 1 ? "" : " AND "
        }`;
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
    query += "(";
    query += searchFields
      .map((field: string) => `${field}:(${search})`)
      .join(" OR ");
    query += ")";
  }

  if (filterKeys.indexOf("years") === -1) {
    query += `${query.length > 0 ? " AND " : ""}(${stickyPeriodFilter})`;
  }

  return `reporting_org_ref:${process.env.MFA_PUBLISHER_REF} AND (${query})`;
}

export function normalizeActivity2TransactionFilters(filterstring: string) {
  return filterstring
    .replace(/tag_narrative/g, "tag_code")
    .replace(/sector_code/g, "activity_sector_code")
    .replace(/recipient_region_code/g, "activity_recipient_region_code")
    .replace(/recipient_country_code/g, "activity_recipient_country_code")
    .replace(/activity_date_start_planned_f/g, "activity_date_iso_date_f")
    .replace(/activity_date_start_actual_f/g, "transaction_date_iso_date_f");
}
