import get from "lodash/get";
import find from "lodash/find";
import sumBy from "lodash/sumBy";
import filter from "lodash/filter";
import groupBy from "lodash/groupBy";
import { countries as countriesCodelist } from "../../../static/countries";
import {
  activityStatusCodelist,
  activityScopeCodelist,
  collaborationTypeCodelist,
  defaultFlowTypeCodelist,
  defaultFinanceTypeCodelist,
  defaultTiedStatusCodelist
} from "../../../static/codelists";

export function getDates(data: any) {
  const parsedData = data.map((item: any) => JSON.parse(item));
  const start = find(
    parsedData,
    (item: any) => item.type.code === "2" || item.type.code === "1"
  );
  const end = find(
    parsedData,
    (item: any) => item.type.code === "4" || item.type.code === "3"
  );

  const dates = [
    start ? new Date(start.iso_date).toLocaleDateString("fi-FI") : "",
    end ? new Date(end.iso_date).toLocaleDateString("fi-FI") : ""
  ];

  return dates;
}

export function getBudget(data: any) {
  const parsedData = data.map((item: any) => JSON.parse(item));
  return parsedData.map((item: any) => ({
    type: item.type.name,
    status: item.status.name,
    start: item.period_start,
    end: item.period_end,
    value: item.value.value.toLocaleString("en-US", {
      style: "currency",
      currency: item.value.currency.code
    })
  }));
}

export function getParticipatingOrgs(data: any) {
  const parsedData = data.map((item: any) => JSON.parse(item));
  return parsedData.map((item: any) => ({
    name: get(item, "narrative[0].text", ""),
    reference: item.ref,
    type: get(item, "type.name", "no data"),
    role: get(item, "role.name", "no data"),
    url: `/organisations/${encodeURIComponent(item.ref)}`
  }));
}

export function getSummary(data: any) {
  const status = get(
    find(activityStatusCodelist, { code: data.activity_status_code }),
    "name",
    "no data"
  );
  const scope = get(
    find(activityScopeCodelist, { code: data.activity_scope_code }),
    "name",
    "no data"
  );
  const collaboration_type = get(
    find(collaborationTypeCodelist, { code: data.collaboration_type_code }),
    "name",
    "no data"
  );
  const default_flow_type = get(
    find(defaultFlowTypeCodelist, { code: data.default_flow_type_code }),
    "name",
    "no data"
  );
  const default_finance_type = get(
    find(defaultFinanceTypeCodelist, { code: data.default_finance_type_code }),
    "name",
    "no data"
  );
  const default_tied_status = get(
    find(defaultTiedStatusCodelist, { code: data.default_tied_status_code }),
    "name",
    "no data"
  );
  const dates = data.activity_date.map((item: any) => JSON.parse(item));
  const planned_start = get(
    find(dates, (item: any) => item.type.code === "1"),
    "iso_date",
    "no data"
  );
  const actual_start = get(
    find(dates, (item: any) => item.type.code === "2"),
    "iso_date",
    "no data"
  );
  const planned_end = get(
    find(dates, (item: any) => item.type.code === "3"),
    "iso_date",
    "no data"
  );
  const actual_end = get(
    find(dates, (item: any) => item.type.code === "4"),
    "iso_date",
    "no data"
  );
  return {
    status,
    scope,
    collaboration_type,
    default_flow_type,
    default_finance_type,
    default_tied_status,
    planned_start,
    actual_start,
    planned_end,
    actual_end
  };
}

export function getCountries(
  countries: any,
  transaction_recipient_country_codes: any
) {
  const parsedData = countries.map((item: any) => JSON.parse(item));
  transaction_recipient_country_codes.forEach((item: any) => {
    const fCountry = find(countriesCodelist, { code: item });
    if (fCountry) {
      parsedData.push({
        country: fCountry
      });
    }
  });
  return parsedData.map((item: any) => ({
    name: item.country.name,
    code: item.country.code,
    percentage: item.country.percentage || "no data",
    url: `/countries/${encodeURIComponent(item.country.code)}`
  }));
}

export function getRegions(
  regions: any,
  transaction_recipient_region_codes: any
) {
  const parsedData = regions.map((item: any) => JSON.parse(item));
  transaction_recipient_region_codes.map((item: any) => ({
    region: {
      name: item,
      code: item
    }
  }));
  return parsedData.map((item: any) => ({
    name: item.region.name,
    code: item.region.code,
    percentage: item.region.percentage || "no data"
  }));
}

export function getLocations(coordinates: any, texts: any) {
  let max = coordinates;
  if (texts.length > max.length) {
    max = texts;
  }

  const result: any[] = [];
  max.forEach((item: any, index: number) => {
    result.push({
      text: get(texts, `[${index}]`, "no data"),
      coordinates: get(coordinates, `[${index}]`, "no data")
    });
  });
  return result;
}

export function getHumanitarianScopes(
  types: any,
  vocabs: any,
  codes: any,
  texts: any
) {
  let max = types;
  if (vocabs.length > max.length) {
    max = vocabs;
  }
  if (codes.length > max.length) {
    max = codes;
  }
  if (texts.length > max.length) {
    max = texts;
  }
  const result: any[] = [];
  max.forEach((item: any, index: number) => {
    result.push({
      type: get(types, `[${index}]`, "no data"),
      vocabulary: get(vocabs, `[${index}]`, "no data"),
      code: get(codes, `[${index}]`, "no data"),
      text: get(texts, `[${index}]`, "no data")
    });
  });
  return result;
}

export function getSectors(
  sectors: any,
  transaction_sector_codes: any,
  reporting_org: any
) {
  const parsedData = sectors.map((item: any) => JSON.parse(item));
  transaction_sector_codes.map((item: any) => ({
    sector: {
      name: item,
      code: item
    }
  }));
  return parsedData.map((item: any) => ({
    name: item.sector.name,
    code: item.sector.code,
    url: `/sectors/${item.sector.code}`,
    percentage: item.sector.percentage || "no data"
  }));
}

export function getDefaultAidTypes(data: any) {
  const parsedData = data.map((item: any) => JSON.parse(item));
  return parsedData.map((item: any) => ({
    name: get(item, "aid_type.name", "no data"),
    code: get(item, "aid_type.code", "no data"),
    vocabulary: item.aid_type.vocabulary.name
  }));
}

export function getPolicyMarkers(data: any) {
  const parsedData = data.map((item: any) => JSON.parse(item));
  return filter(
    parsedData,
    (item: any) =>
      item.significance &&
      item.significance.name.toLowerCase() !== "not targeted"
  ).map((item: any) => ({
    name: item.policy_marker.name,
    code: item.policy_marker.code,
    significance: item.significance.name,
    vocabulary_uri: item.vocabulary_uri || "no data",
    vocabulary: item.vocabulary.name
  }));
}

export function getTags(tag_codes: any, tag_narrative_texts: any) {
  return tag_codes.map((code: any, index: number) => ({
    code,
    text: get(tag_narrative_texts, "index", "no data")
  }));
}

export function getContactInfo(contact_data: any, reporting_org: any) {
  if (contact_data.length === 0) {
    return {
      type: "no data",
      telephone: "no data",
      email: "no data",
      website: "no data",
      organisation: "no data",
      department: "no data",
      person: "no data",
      position: "no data",
      mailing_address: "no data"
    };
  }
  const parsedData = JSON.parse(contact_data[0]);
  return {
    type: get(parsedData, "type.name", "no data"),
    telephone: get(parsedData, "telephone", "no data"),
    email: get(parsedData, "email", "no data"),
    website: get(parsedData, "website", "no data"),
    organisation: {
      name: get(parsedData, "organisation.narrative[0].text", "no data"),
      ref: reporting_org
    },
    department: get(parsedData, "department.narrative[0].text", "no data"),
    person: get(parsedData, "person_name.narrative[0].text", "no data"),
    position: get(parsedData, "job_title.narrative[0].text", "no data"),
    mailing_address: get(
      parsedData,
      "mailing_address.narrative[0].text",
      "no data"
    )
  };
}

export function getOtherIdentifiers(
  other_indentifier_refs: any,
  other_identifier_owner_org_narrative_texts: any
) {
  return other_indentifier_refs.map((code: any, index: number) => ({
    code,
    text: get(other_identifier_owner_org_narrative_texts, "index", "no data")
  }));
}

export function getCountryBudgetItems(
  vocabs: any,
  codes: any,
  percentages: any,
  texts: any
) {
  let max = codes;
  if (percentages.length > max.length) {
    max = percentages;
  }
  if (texts.length > max.length) {
    max = texts;
  }
  const result: any[] = [];
  max.forEach((item: any, index: number) => {
    result.push({
      vocab_code: vocabs,
      code: get(codes, `[${index}]`, "no data"),
      percentage: get(percentages, `[${index}]`, "no data"),
      text: get(texts, `[${index}]`, "no data")
    });
  });
  return result;
}

export function getPlannedDisbursements(
  values: any,
  types: any,
  start_dates: any,
  end_dates: any,
  currencies: any,
  providers: any
) {
  let max = values;
  if (types.length > max.length) {
    max = types;
  }
  if (start_dates.length > max.length) {
    max = start_dates;
  }
  if (end_dates.length > max.length) {
    max = end_dates;
  }
  if (currencies.length > max.length) {
    max = currencies;
  }
  if (providers.length > max.length) {
    max = providers;
  }
  const result: any[] = [];
  max.forEach((item: any, index: number) => {
    let value = get(values, `[${index}]`, "no data");
    if (value !== "no data") {
      const currency = get(currencies, `[${index}]`, null);
      if (currency) {
        value = value.toLocaleString("en-US", {
          style: "currency",
          currency
        });
      }
    }
    result.push({
      value,
      type: get(types, `[${index}]`, "no data"),
      start: get(start_dates, `[${index}]`, "no data"),
      end: get(end_dates, `[${index}]`, "no data"),
      provider: get(providers, `[${index}]`, "no data")
    });
  });
  return result;
}

export function getDocumentLinks(texts: any, urls: any, categories: any) {
  let max = texts;
  if (urls.length > max.length) {
    max = urls;
  }
  if (categories.length > max.length) {
    max = categories;
  }
  const result: any[] = [];
  max.forEach((item: any, index: number) => {
    result.push({
      text: get(texts, `[${index}]`, "no data"),
      url: get(urls, `[${index}]`, "no data"),
      category: get(categories, `[${index}]`, "no data")
    });
  });
  return result;
}

export function getRelatedActivities(refs: any, types: any) {
  let max = refs;
  if (types.length > max.length) {
    max = types;
  }
  const result: any[] = [];
  max.forEach((item: any, index: number) => {
    result.push({
      ref: get(refs, `[${index}]`, "no data"),
      type: get(types, `[${index}]`, "no data"),
      url: get(refs, `[${index}]`, null)
        ? `/projects/${encodeURIComponent(refs[index])}`
        : null
    });
  });
  return result;
}

export function getLegacyData(names: any, values: any, iati_equivalents: any) {
  let max = names;
  if (values.length > max.length) {
    max = values;
  }
  if (iati_equivalents.length > max.length) {
    max = iati_equivalents;
  }
  const result: any[] = [];
  max.forEach((item: any, index: number) => {
    result.push({
      name: get(names, `[${index}]`, "no data"),
      value: get(values, `[${index}]`, "no data"),
      iati_equivalent: get(iati_equivalents, `[${index}]`, "no data")
    });
  });
  return result;
}

export function getConditions(types: any, texts: any) {
  let max = types;
  if (texts.length > max.length) {
    max = texts;
  }
  const result: any[] = [];
  max.forEach((item: any, index: number) => {
    result.push({
      text: get(texts, `[${index}]`, "no data"),
      type: get(types, `[${index}]`, "no data")
    });
  });
  return result;
}

export function getTransactions(data: any) {
  const transactions = data.map((item: any) => ({
    date: item.transaction_date_iso_date.slice(0, 4),
    type: item.transaction_type,
    value: item.transaction_value
  }));

  const groupedYears = groupBy(transactions, "date");

  const result: any[] = [];

  Object.keys(groupedYears).forEach((year: string) => {
    const disbursed = sumBy(filter(groupedYears[year], { type: "3" }), "value");
    const commitment = sumBy(
      filter(groupedYears[year], { type: "2" }),
      "value"
    );
    result.push({
      year,
      disbursed,
      commitment
    });
  });

  return result;
}
