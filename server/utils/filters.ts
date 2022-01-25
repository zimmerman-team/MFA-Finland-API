import get from "lodash/get";
import { globalSearchFields } from "../static/globalSearchFields";

const stickyPeriodFilter = `transaction_value_date:[2015-01-01T00:00:00Z TO *]`;

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
      " OR transaction_value_date:[2015-01-01T00:00:00Z TO *]";
  }

  const filterKeys = Object.keys(filters);
  if (filterKeys.length === 0) {
    return `reporting_org_ref:${process.env.MFA_PUBLISHER_REF} AND (${localStickyPeriodFilter})`;
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
      result += `transaction_value_date:[${
        filters[filterKey][0]
      }-01-01T00:00:00Z TO ${filters[filterKey][1]}-12-31T23:59:59Z]${
        addTrailingAND ? " AND " : ""
      }`;
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
    }
    // else if (filterKey === "participating_org_type" && isTransaction) {
    //   result += `participating_org_ref:(${filters[filterKey]
    //     .map((value: string) => `${value}*`)
    //     .join(" ")})${addTrailingAND ? " AND " : ""}`;
    // }
    else if (filterKey === "policy_marker_code") {
      result += `policy_marker_combined:(${filters[filterKey]
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
  const locations = {
    countries: [],
    regions: []
  };
  if (filterKeys.length > 0) {
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
        query += `${filterKey}:[${filters[filterKey].join(" TO ")}]${
          addTrailingAND ? " AND " : ""
        }`;
      } else if (filterKey === "years") {
        query += `transaction_value_date:[${
          filters[filterKey][0]
        }-01-01T00:00:00Z TO ${filters[filterKey][1]}-12-31T23:59:59Z]${
          addTrailingAND ? " AND " : ""
        }`;
      } else if (filterKey === "tag_code" || filterKey === "tag_narrative") {
        query += `(tag_code:(${filters[filterKey]
          .map((value: string) => `"${value.replace("|", ",")}"`)
          .join(" ")}) OR tag_narrative:(${filters[filterKey]
          .map((value: string) => `"${value.replace("|", ",")}"`)
          .join(" ")}))${addTrailingAND ? " AND " : ""}`;
      } else if (filterKey === "sector_code") {
        query += `sector_code:(${filters[filterKey]
          .map((value: string) => `${value}${value.length < 5 ? "*" : ""}`)
          .join(" ")})${addTrailingAND ? " AND " : ""}`;
      } else if (filterKey === "budget_line") {
        query += `(tag_code:(${filters[filterKey]
          .map((value: string) => `"${value}"`)
          .join(" ")}))${addTrailingAND ? " AND " : ""}`;
      } else if (filterKey === "human_rights_approach") {
        query += `tag_narrative:(${filters[filterKey]
          .map((value: string) => `"${value}"`)
          .join(" ")}))${addTrailingAND ? " AND " : ""}`;
      } else if (filterKey === "period") {
        query += `transaction_value_date:[${
          filters[filterKey][0].startDate
        } TO *] AND transaction_value_date:[* TO ${
          filters[filterKey][0].endDate
        }]${addTrailingAND ? " AND " : ""}`;
      } else if (filterKey === "policy_marker_code") {
        query += `policy_marker_combined:(${filters[filterKey]
          .map((code: string) => `${code}__1 ${code}__2 ${code}__3 ${code}__4`)
          .join(" ")})${addTrailingAND ? " AND " : ""}`;
      } else if (filterKey === "year_period") {
        query += `transaction_value_date:[${
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

  return `reporting_org_ref:${process.env.MFA_PUBLISHER_REF} AND (${query})`;
}

export function normalizeActivity2TransactionFilters(filterstring: string) {
  return filterstring
    .replace(/tag_narrative/g, "tag_code")
    .replace(/sector_code/g, "activity_sector_code")
    .replace(/recipient_region_code/g, "activity_recipient_region_code")
    .replace(/recipient_country_code/g, "activity_recipient_country_code");
}
