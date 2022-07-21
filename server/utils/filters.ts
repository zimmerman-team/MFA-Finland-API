import get from "lodash/get";
import { globalSearchFields } from "../static/globalSearchFields";
import {
  AF_BUDGET_VALUE,
  AF_COUNTRY,
  AF_POLICY_MARKER_CODE,
  AF_POLICY_MARKER_COMBINED,
  AF_REGION,
  AF_REPORTING_ORG_REF,
  AF_SECTOR,
  AF_TAG_CODE,
  AF_TAG_NARRATIVE,
  AF_TRANSACTION_VALUE_DATE
} from "../static/apiFilterFields";

const stickyPeriodFilter = `${AF_TRANSACTION_VALUE_DATE}:[2015-01-01T00:00:00Z TO *]`;

export function getFormattedSearchParam(q: string) {
  const qstring = globalSearchFields
    .map((field: string) => `${field}:"${q}"`)
    .join(" OR ");
  return `${AF_REPORTING_ORG_REF}:${process.env.MFA_PUBLISHER_REF} AND (${qstring}) AND (${stickyPeriodFilter})`;
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
    localStickyPeriodFilter += ` OR ${AF_TRANSACTION_VALUE_DATE}:[2015-01-01T00:00:00Z TO *]`;
  }

  const filterKeys = Object.keys(filters);
  if (filterKeys.length === 0) {
    return `${AF_REPORTING_ORG_REF}:${process.env.MFA_PUBLISHER_REF} AND (${localStickyPeriodFilter})`;
  }

  let result = "";
  const locations = {
    countries: [],
    regions: []
  };
  filterKeys.forEach((filterKey: string, index: number) => {
    const addTrailingAND =
      filterKeys.length - 1 !== index &&
      get(filterKeys, `[${index + 1}]`, "") !== AF_COUNTRY &&
      get(filterKeys, `[${index + 1}]`, "") !== AF_REGION;
    if (filterKey === AF_COUNTRY) {
      locations.countries = filters[filterKey];
    } else if (filterKey === AF_REGION) {
      locations.regions = filters[filterKey];
    } else if (filterKey === AF_BUDGET_VALUE) {
      result += `${filterKey}:[${filters[filterKey].join(" TO ")}]${
        addTrailingAND ? " AND " : ""
      }`;
    } else if (filterKey === "years") {
      result += `${AF_TRANSACTION_VALUE_DATE}:[${
        filters[filterKey][0]
      }-01-01T00:00:00Z TO ${filters[filterKey][1]}-12-31T23:59:59Z]${
        addTrailingAND ? " AND " : ""
      }`;
    } else if (filterKey === AF_TAG_CODE || filterKey === AF_TAG_NARRATIVE) {
      result += `(${AF_TAG_CODE}:(${filters[filterKey]
        .map((value: string) => `"${value.replace("|", ",")}"`)
        .join(" ")}) OR ${AF_TAG_NARRATIVE}:(${filters[filterKey]
        .map((value: string) => `"${value.replace("|", ",")}"`)
        .join(" ")}))${addTrailingAND ? " AND " : ""}`;
    } else if (filterKey === AF_SECTOR) {
      result += `${AF_SECTOR}:(${filters[filterKey]
        .map((value: string) => `${value}${value.length < 5 ? "*" : ""}`)
        .join(" ")})${addTrailingAND ? " AND " : ""}`;
    } else if (filterKey === "budget_line") {
      result += `${AF_TAG_CODE}:(${filters[filterKey]
        .map((value: string) => `"${value}"`)
        .join(" ")})${addTrailingAND ? " AND " : ""}`;
    } else if (filterKey === "human_rights_approach") {
      result += `${AF_TAG_NARRATIVE}:(${filters[filterKey]
        .map((value: string) => `"${value}"`)
        .join(" ")})${addTrailingAND ? " AND " : ""}`;
    }
    // else if (filterKey === "participating_org_type" && isTransaction) {
    //   result += `participating_org_ref:(${filters[filterKey]
    //     .map((value: string) => `${value}*`)
    //     .join(" ")})${addTrailingAND ? " AND " : ""}`;
    // }
    else if (filterKey === AF_POLICY_MARKER_CODE) {
      result += `${AF_POLICY_MARKER_COMBINED}:(${filters[filterKey]
        .map((code: string) => `${code}__1 ${code}__2 ${code}__3 ${code}__4`)
        .join(" ")})${addTrailingAND ? " AND " : ""}`;
    } else if (filterKey !== "year_period") {
      result += `${filterKey}:(${filters[filterKey].join(" ")})${
        addTrailingAND ? " AND " : ""
      }`;
    }
  });

  if (filterKeys.indexOf("years") === -1) {
    result += `${result.length > 0 ? " AND " : ""}(${localStickyPeriodFilter})`;
  }

  if (locations.countries.length > 0 || locations.regions.length > 0) {
    result += `${result.length > 0 ? " AND " : ""}(${
      locations.countries.length > 0
        ? `${AF_COUNTRY}:(${locations.countries.join(" ")})`
        : ""
    }${
      locations.regions.length > 0
        ? `${
            locations.countries.length > 0 ? "OR " : ""
          }${AF_REGION}:(${locations.regions.join(" ")})`
        : ""
    })`;
  }

  return `${AF_REPORTING_ORG_REF}:${process.env.MFA_PUBLISHER_REF} AND (${result})`;
}

export function getQuery(filters: any, search: string, searchFields: string[]) {
  if (typeof filters === "string") {
    return getFormattedSearchParam(filters);
  }
  const filterKeys = Object.keys(filters);
  if (filterKeys.length === 0 && search.length === 0) {
    return `${AF_REPORTING_ORG_REF}:${process.env.MFA_PUBLISHER_REF} AND (${stickyPeriodFilter})`;
  }

  let query = "";
  const locations = {
    countries: [],
    regions: []
  };
  if (filterKeys.length > 0) {
    filterKeys.forEach((filterKey: string, index: number) => {
      const addTrailingAND =
        filterKeys.length - 1 !== index &&
        get(filterKeys, `[${index + 1}]`, "") !== AF_COUNTRY &&
        get(filterKeys, `[${index + 1}]`, "") !== AF_REGION;
      if (filterKey === AF_COUNTRY) {
        locations.countries = filters[filterKey];
      } else if (filterKey === AF_REGION) {
        locations.regions = filters[filterKey];
      } else if (filterKey === AF_BUDGET_VALUE) {
        query += `${filterKey}:[${filters[filterKey].join(" TO ")}]${
          addTrailingAND ? " AND " : ""
        }`;
      } else if (filterKey === "years") {
        query += `${AF_TRANSACTION_VALUE_DATE}:[${
          filters[filterKey][0]
        }-01-01T00:00:00Z TO ${filters[filterKey][1]}-12-31T23:59:59Z]${
          addTrailingAND ? " AND " : ""
        }`;
      } else if (filterKey === AF_TAG_CODE || filterKey === AF_TAG_NARRATIVE) {
        query += `(${AF_TAG_CODE}:(${filters[filterKey]
          .map((value: string) => `"${value.replace("|", ",")}"`)
          .join(" ")}) OR ${AF_TAG_NARRATIVE}:(${filters[filterKey]
          .map((value: string) => `"${value.replace("|", ",")}"`)
          .join(" ")}))${addTrailingAND ? " AND " : ""}`;
      } else if (filterKey === AF_SECTOR) {
        query += `${AF_SECTOR}:(${filters[filterKey]
          .map((value: string) => `${value}${value.length < 5 ? "*" : ""}`)
          .join(" ")})${addTrailingAND ? " AND " : ""}`;
      } else if (filterKey === "budget_line") {
        query += `(${AF_TAG_CODE}:(${filters[filterKey]
          .map((value: string) => `"${value}"`)
          .join(" ")}))${addTrailingAND ? " AND " : ""}`;
      } else if (filterKey === "human_rights_approach") {
        query += `${AF_TAG_NARRATIVE}:(${filters[filterKey]
          .map((value: string) => `"${value}"`)
          .join(" ")}))${addTrailingAND ? " AND " : ""}`;
      } else if (filterKey === "period") {
        query += `${AF_TRANSACTION_VALUE_DATE}:[${
          filters[filterKey][0].startDate
        } TO *] AND ${AF_TRANSACTION_VALUE_DATE}:[* TO ${
          filters[filterKey][0].endDate
        }]${addTrailingAND ? " AND " : ""}`;
      } else if (filterKey === AF_POLICY_MARKER_CODE) {
        query += `${AF_POLICY_MARKER_COMBINED}:(${filters[filterKey]
          .map((code: string) => `${code}__1 ${code}__2 ${code}__3 ${code}__4`)
          .join(" ")})${addTrailingAND ? " AND " : ""}`;
      } else if (filterKey === "year_period") {
        query += `${AF_TRANSACTION_VALUE_DATE}:[${
          filters[filterKey]
        }-01-01T00:00:00Z TO ${filters[filterKey]}-12-31T23:59:59Z]${
          addTrailingAND ? " AND " : ""
        }`;
      } else {
        query += `${filterKey}:(${filters[filterKey].join(" ")})${
          addTrailingAND ? " AND " : ""
        }`;
      }
    });
  }

  if (search.length > 0 && filterKeys.length > 0) {
    if (query.length > 0) {
      query += " AND (";
    } else {
      query += "(";
    }
    query += searchFields
      .map((field: string) => `${field}:(${search})`)
      .join(" OR ");
    query += ")";
  }

  if (search.length > 0 && filterKeys.length === 0) {
    query += "(";
    query += searchFields
      .map((field: string) => `${field}:(${search})`)
      .join(" OR ");
    query += ")";
  }

  if (filterKeys.indexOf("years") === -1) {
    query += `${query.length > 0 ? " AND " : ""}(${stickyPeriodFilter})`;
  }

  if (locations.countries.length > 0 || locations.regions.length > 0) {
    query += `${query.length > 0 ? " AND " : ""}(${
      locations.countries.length > 0
        ? `${AF_COUNTRY}:(${locations.countries.join(" ")})`
        : ""
    }${
      locations.regions.length > 0
        ? `${
            locations.countries.length > 0 ? "OR " : ""
          }${AF_REGION}:(${locations.regions.join(" ")})`
        : ""
    })`;
  }

  return `${AF_REPORTING_ORG_REF}:${process.env.MFA_PUBLISHER_REF} AND (${query})`;
}

// TODO: Test and remove, casting no longer necessary as field names are identical across activity/transaction
export function normalizeActivity2TransactionFilters(filterstring: string) {
  return filterstring;
}
