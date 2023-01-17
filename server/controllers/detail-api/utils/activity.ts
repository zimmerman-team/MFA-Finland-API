import get from "lodash/get";
import find from "lodash/find";
import sumBy from "lodash/sumBy";
import filter from "lodash/filter";
import groupBy from "lodash/groupBy";
import {
  countries as countriesCodelist,
  translatedCountries
} from "../../../static/countries";
import {
  activityStatusCodelist,
  activityScopeCodelist,
  collaborationTypeCodelist,
  defaultFlowTypeCodelist,
  defaultFinanceTypeCodelist,
  defaultTiedStatusCodelist,
  tranlatedAidTypes
} from "../../../static/codelists";
import {
  policyMarkerSignificanceCodelist,
  policyMarkerVocabularyCodelist
} from "../../filter-api/utils/codelists";
import { orgTypesCodelist } from "../../../static/orgTypesCodelist";
import { sectorTranslations } from "../../../static/sectorTranslations";
import { orgMapping } from "../../../static/orgMapping";
import {
  AF_ACTIVITY_DATE_END_ACTUAL,
  AF_ACTIVITY_DATE_END_COMMON,
  AF_ACTIVITY_DATE_END_PLANNED,
  AF_ACTIVITY_DATE_START_ACTUAL,
  AF_ACTIVITY_DATE_START_COMMON,
  AF_ACTIVITY_DATE_START_PLANNED,
  AF_ACTIVITY_SCOPE_CODE,
  AF_ACTIVITY_STATUS_CODE,
  AF_BUDGET_PERIOD_END_ISO_DATE,
  AF_BUDGET_PERIOD_START_ISO_DATE,
  AF_BUDGET_STATUS_NAME,
  AF_BUDGET_TYPE_NAME,
  AF_BUDGET_VALUE,
  AF_BUDGET_VALUE_CURRENCY,
  AF_COLLABORATION_TYPE_CODE,
  AF_COUNTRY,
  AF_COUNTRY_NAME,
  AF_COUNTRY_PERCENTAGE,
  AF_DEFAULT_AID_TYPE_CODE,
  AF_DEFAULT_AID_TYPE_NAME,
  AF_DEFAULT_AID_TYPE_VOCABULARY,
  AF_DEFAULT_FINANCE_CODE,
  AF_DEFAULT_FLOW_TYPE_CODE,
  AF_DEFAULT_TIED_STATUS_CODE,
  AF_PARTICIPATING_ORG_NARRATIVE,
  AF_PARTICIPATING_ORG_NARRATIVE_LANG,
  AF_PARTICIPATING_ORG_REF,
  AF_PARTICIPATING_ORG_ROLE,
  AF_PARTICIPATING_ORG_TYPE,
  AF_PARTICIPATING_ORG_NARRATIVE_INDEX,
  AF_PARTICIPATING_ORG_NARRATIVE_LANG_INDEX,
  AF_PARTICIPATING_ORG_REF_INDEX,
  AF_PARTICIPATING_ORG_ROLE_INDEX,
  AF_PARTICIPATING_ORG_TYPE_INDEX,
  AF_POLICY_MARKER_CODE,
  AF_POLICY_MARKER_NARRATIVE,
  AF_POLICY_MARKER_SIGNIFICANCE,
  AF_POLICY_MARKER_VOCABULARY_NAME,
  AF_POLICY_MARKER_VOCABULARY_URI,
  AF_REGION,
  AF_REGION_NAME,
  AF_REGION_PERCENTAGE,
  AF_SECTOR,
  AF_SECTOR_NAME,
  AF_SECTOR_PERCENTAGE,
  AF_TRANSACTION_TYPE_CODE,
  AF_TRANSACTION_DATE_ISO_DATE,
  AF_TRANSACTION
} from "../../../static/apiFilterFields";

function formatDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  let dateVal = get(dateStr.split("T"), "[0]", dateStr);
  return new Date(dateVal).toLocaleDateString("en-GB");
}

export function getDates(data: any) {
  // Data contains all activity metadata, we need to extract the start and end dates.
  const start = get(data, `["${AF_ACTIVITY_DATE_START_COMMON}"]`, null);
  const end = get(data, `["${AF_ACTIVITY_DATE_END_COMMON}"]`, null);
  const dates = [start ? formatDate(start) : "", end ? formatDate(end) : ""];

  return dates;
}

/** unused */
export function getBudget(data: any) {
  // data contains all the activityMetadata. We need to extract relevant
  // fields from the expanded fields.
  // The resulting value field should look like `value: "€400,000.00"`
  const budget_type_name = get(data, `["${AF_BUDGET_TYPE_NAME}"]`, []);
  const budget_status_name = get(data, `["${AF_BUDGET_STATUS_NAME}"]`, []);
  const budget_start = get(data, `["${AF_BUDGET_PERIOD_START_ISO_DATE}"]`, []);
  const budget_end = get(data, `["${AF_BUDGET_PERIOD_END_ISO_DATE}"]`, []);
  const budget_value = get(data, `["${AF_BUDGET_VALUE}"]`, []);
  const budget_value_currency = get(
    data,
    `["${AF_BUDGET_VALUE_CURRENCY}"]`,
    []
  );
  let result: any[] = [];
  budget_value.forEach((value: any, index: number) => {
    const currency = get(budget_value_currency, `[${index}]`, "");
    result.push({
      type: get(budget_type_name, `[${index}]`, ""),
      status: get(budget_status_name, `[${index}]`, ""),
      start: get(budget_start, `[${index}]`, ""),
      end: get(budget_end, `[${index}]`, ""),
      value: value.toLocaleString("en-US", {
        style: "currency",
        currency: currency
      })
    });
  });
  return result;
}

export function getParticipatingOrgs(
  data: any,
  lang: string,
  withRole?: boolean
) {
  // data contains all the activityMetadata. We need to extract relevant
  // fields from the expanded fields.
  const participating_org_name = get(
    data,
    `["${AF_PARTICIPATING_ORG_NARRATIVE}"]`,
    []
  );
  const participating_org_name_lang = get(
    data,
    `["${AF_PARTICIPATING_ORG_NARRATIVE_LANG}"]`,
    []
  );
  const participating_org_ref = get(
    data,
    `["${AF_PARTICIPATING_ORG_REF}"]`,
    []
  );
  const participating_org_type = get(
    data,
    `["${AF_PARTICIPATING_ORG_TYPE}"]`,
    []
  );
  const participating_org_role = get(
    data,
    `["${AF_PARTICIPATING_ORG_ROLE}"]`,
    []
  );
  let result: any[] = [];
  // participating_org_role is a required field for p-orgs.
  participating_org_role.forEach((role: any, index: number) => {
    const po_index: number = data[AF_PARTICIPATING_ORG_ROLE_INDEX][index];
    const po_ref_index: number = data[AF_PARTICIPATING_ORG_REF_INDEX][po_index];
    const po_type_index: number =
      data[AF_PARTICIPATING_ORG_TYPE_INDEX][po_index];
    const po_narrative_index: number =
      data[AF_PARTICIPATING_ORG_NARRATIVE_INDEX][po_index];
    const po_narrative_lang_index: number =
      data[AF_PARTICIPATING_ORG_NARRATIVE_LANG_INDEX][po_index];

    const ref = get(participating_org_ref, `[${po_ref_index}]`, "");
    const type_code = get(participating_org_type, `[${po_type_index}]`, "");
    const type = get(
      find(orgTypesCodelist, { code: type_code }),
      "name",
      "no data"
    );
    const url = ref !== "" ? `/organisations/${encodeURIComponent(ref)}` : "";

    let name = "";
    // check if there is any narrative
    if (po_narrative_index !== -1) {
      // if there is a narrative, check the lang
      let breakNarrative = false;
      let count = 0;
      do {
        let searchIndex = po_narrative_index + po_narrative_lang_index + count;
        // TODO: This is a hack due to the PO_NARRATIVE_LANG_INDEX not resolving correctly
        if (po_narrative_lang_index === -1) {
          searchIndex += 1;
        }
        let langVal =
          po_narrative_lang_index === -1 // if there is no langIndex the default is taken
            ? "en"
            : participating_org_name_lang[searchIndex];
        if (langVal === lang) {
          name = participating_org_name[searchIndex];
          breakNarrative = true;
        }
        // Check if the next lang index is 0, or the end of the list is found.
        // if the lang index is 0, it means we have reached a narrative related to a different participating_org
        let nextVal = get(
          participating_org_name_lang,
          `[${searchIndex + 1}]`,
          -2
        );
        if ([0, -2].includes(nextVal)) {
          breakNarrative = true;
        }
        count += 1;
      } while (!breakNarrative);
    }

    // if the name was not found, check the ref in the org mapping.
    if (name === "") {
      const fOrg = find(orgMapping, (org: any) => org.code === ref);
      if (fOrg) {
        name = get(fOrg.info, `name${lang === "en" ? "" : `_${lang}`}`, "");
      }
    }

    if (!name) {
      name = get(participating_org_name, index, "no data");
    }
    let resultOrg: {
      name: string;
      reference: string;
      type: string;
      url: string;
      role?: string;
    } = {
      name,
      reference: ref,
      type,
      url
    };
    if (withRole) {
      const roles = ["", "Funding", "Accountable", "Extending", "Implementing"];
      resultOrg = {
        ...resultOrg,
        role: roles[role]
      };
    }

    result.push(resultOrg);
  });
  return result;
}

export function getSummary(data: any) {
  const status = get(
    find(activityStatusCodelist, {
      code: data[AF_ACTIVITY_STATUS_CODE]
    }),
    "name",
    "no data"
  );
  const scope = get(
    find(activityScopeCodelist, {
      code: data[AF_ACTIVITY_SCOPE_CODE]
    }),
    "name",
    "no data"
  );
  const collaboration_type = get(
    find(collaborationTypeCodelist, {
      code: data[AF_COLLABORATION_TYPE_CODE]
    }),
    "name",
    "no data"
  );
  const default_flow_type = get(
    find(defaultFlowTypeCodelist, {
      code: data[AF_DEFAULT_FLOW_TYPE_CODE]
    }),
    "name",
    "no data"
  );
  const default_finance_type = get(
    find(defaultFinanceTypeCodelist, {
      code: data[AF_DEFAULT_FINANCE_CODE]
    }),
    "name",
    "no data"
  );
  const default_tied_status = get(
    find(defaultTiedStatusCodelist, {
      code: data[AF_DEFAULT_TIED_STATUS_CODE]
    }),
    "name",
    "no data"
  );
  const planned_start = get(
    data,
    `["${AF_ACTIVITY_DATE_START_PLANNED}"]`,
    "no data"
  );
  const actual_start = get(
    data,
    `["${AF_ACTIVITY_DATE_START_ACTUAL}"]`,
    "no data"
  );
  const planned_end = get(
    data,
    `["${AF_ACTIVITY_DATE_END_PLANNED}"]`,
    "no data"
  );
  const actual_end = get(data, `["${AF_ACTIVITY_DATE_END_ACTUAL}"]`, "no data");
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
  transaction_recipient_country_codes: any,
  lang: string
) {
  // countries contains all the activityMetadata. We need to extract relevant
  // fields from the expanded fields.
  const country_code = get(countries, `["${AF_COUNTRY}"]`, []);
  const country_name = get(countries, `["${AF_COUNTRY_NAME}"]`, []);
  const country_percentage = get(countries, `["${AF_COUNTRY_PERCENTAGE}"]`, []);
  transaction_recipient_country_codes.forEach((item: any) => {
    const fCountry = find(countriesCodelist, { code: item });
    if (fCountry) {
      country_code.push(fCountry.code);
      country_name.push(fCountry.name);
      country_percentage.push("");
    }
  });
  let result: any[] = [];
  country_code.forEach((code: any, index: number) => {
    const fTranslatedItem = find(translatedCountries, {
      code: code
    });

    const name = fTranslatedItem
      ? get(
          fTranslatedItem.info,
          `name${lang === "en" ? "" : `_${lang}`}`,
          get(country_name, `[${index}]`, "")
        )
      : get(country_name, `[${index}]`, "");

    result.push({
      name,
      code,
      percentage: get(country_percentage, `[${index}]`, ""),
      url: `/countries/${encodeURIComponent(name)}`
    });
  });
  return result;
}

export function getRegions(
  regions: any,
  transaction_recipient_region_codes: any,
  lang: string
) {
  // regions contains all the activityMetadata. We need to extract relevant
  // fields from the expanded fields.
  const region_code = get(regions, `["${AF_REGION}"]`, []);
  const region_name = get(regions, `["${AF_REGION_NAME}"]`, []);
  const region_percentage = get(regions, `["${AF_REGION_PERCENTAGE}"]`, []);
  transaction_recipient_region_codes.forEach((item: any) => {
    const fRegion = find(translatedCountries, { code: item });
    if (fRegion) {
      region_code.push(fRegion.code);
      region_name.push(fRegion.info.name);
      region_percentage.push("no data");
    }
  });

  // Review: was formerly using name_ which is the country,
  // and was using the item.country.name which does not exist on
  // the field that was being queried.
  let result: any[] = [];
  region_code.forEach((code: any, index: number) => {
    const fTranslatedItem = find(translatedCountries, {
      code: code
    });
    const name = fTranslatedItem
      ? get(
          fTranslatedItem.info,
          `region_1${lang === "en" ? "" : `_${lang}`}`,
          get(region_name, `[${index}]`, "")
        )
      : get(region_name, `[${index}]`, "");
    result.push({
      name,
      code,
      percentage: get(region_percentage, `[${index}]`, "no data")
    });
  });
  return result;
}

/** unused */
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

/** unused */
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
  lang: string
) {
  // sectors contains all the activityMetadata. We need to extract
  // the sector information from the expanded fields.
  const sector_name = get(sectors, `["${AF_SECTOR_NAME}"]`, []);
  const sector_code = get(sectors, `["${AF_SECTOR}"]`, []);
  const sector_percentage = get(sectors, `["${AF_SECTOR_PERCENTAGE}"]`, []);

  // Review: this part was not refactored to new IATI.cloud
  // because the output of the map is not used.
  // transaction_sector_codes.map((item: any) => ({
  //   sector: {
  //     name: item,
  //     code: item
  //   }
  // }));

  let result: any[] = [];
  sector_code.forEach((code: any, index: number) => {
    const fTranslatedItem = find(sectorTranslations, {
      code: parseInt(code, 10)
    });

    const name = fTranslatedItem
      ? get(
          fTranslatedItem.info,
          `name${lang === "en" ? "" : `_${lang}`}`,
          get(sector_name, `[${index}]`, "")
        )
      : get(sector_name, `[${index}]`, "");

    result.push({
      name,
      code,
      url: `/sectors/${code}`,
      percentage: get(sector_percentage, `[${index}]`, "no data")
    });
  });
  return result;
}

export function getDefaultAidTypes(data: any, lang: string) {
  // data contains all the activityMetadata, we need to
  // retrieve a list of default-aid-type values
  const default_aid_type_code = get(
    data,
    `["${AF_DEFAULT_AID_TYPE_CODE}"]`,
    []
  );
  const default_aid_type_name = get(
    data,
    `["${AF_DEFAULT_AID_TYPE_NAME}"]`,
    []
  );
  const default_aid_type_vocabulary = get(
    data,
    `["${AF_DEFAULT_AID_TYPE_VOCABULARY}"]`,
    []
  );

  let result: any[] = [];
  default_aid_type_code.forEach((code: any, index: number) => {
    const fTranslatedItem = find(tranlatedAidTypes, {
      code: code
    });
    const name = fTranslatedItem
      ? get(fTranslatedItem.info, `name${lang === "en" ? "" : `_${lang}`}`)
      : get(default_aid_type_name, `[${index}]`, "no data");
    result.push({
      code,
      name,
      vocabulary: get(default_aid_type_vocabulary, `[${index}]`, "no data")
    });
  });
  return result;
}

export function getPolicyMarkers(data: any) {
  // data contains all the activity metadata. We need to extract the
  // expanded fields from it.
  const policy_marker_code = get(data, `["${AF_POLICY_MARKER_CODE}"]`, []);
  const policy_marker_name = get(data, `["${AF_POLICY_MARKER_NARRATIVE}"]`, []);
  const policy_marker_significance = get(
    data,
    `["${AF_POLICY_MARKER_SIGNIFICANCE}"]`,
    []
  );
  const policy_marker_vocabulary_uri = get(
    data,
    `["${AF_POLICY_MARKER_VOCABULARY_URI}"]`,
    []
  );
  const policy_marker_vocabulary = get(
    data,
    `["${AF_POLICY_MARKER_VOCABULARY_NAME}"]`,
    []
  );
  const result: any[] = [];
  policy_marker_code.forEach((code: any, index: number) => {
    const name = get(policy_marker_name, `[${index}]`, "");
    const significance =
      find(policyMarkerSignificanceCodelist, {
        code: get(policy_marker_significance, `[${index}]`, "")
      })?.name ?? "no data";
    const vocabulary =
      find(policyMarkerVocabularyCodelist, {
        code: get(policy_marker_vocabulary, `[${index}]`, "")
      })?.name ?? "no data";
    if (significance.toLowerCase() !== "not targeted") {
      result.push({
        name,
        code,
        significance,
        vocabulary_uri: get(policy_marker_vocabulary_uri, `[${index}]`, ""),
        vocabulary
      });
    }
  });
  return result;
}

/** unused */
export function getTags(tag_codes: any, tag_narrative_texts: any) {
  return tag_codes.map((code: any, index: number) => ({
    code,
    text: get(tag_narrative_texts, "index", "no data")
  }));
}

/** unused */
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

/** unused */
export function getOtherIdentifiers(
  other_indentifier_refs: any,
  other_identifier_owner_org_narrative_texts: any
) {
  return other_indentifier_refs.map((code: any, index: number) => ({
    code,
    text: get(other_identifier_owner_org_narrative_texts, "index", "no data")
  }));
}

/** unused */
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

/** unused */
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

/** unused */
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

/** unused */
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

/** unused */
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

/** unused */
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
  let transactions: any[] = [];
  data.forEach((item: any) => {
    const dates = item[AF_TRANSACTION_DATE_ISO_DATE];
    const types = item[AF_TRANSACTION_TYPE_CODE];
    const values = item[AF_TRANSACTION];
    values.forEach((value: number, index: number) => {
      transactions.push({
        date: dates[index],
        type: types[index],
        value: value
      });
    });
  });
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
