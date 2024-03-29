import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import uniq from "lodash/uniq";
import filter from "lodash/filter";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { getQuery } from "../../utils/filters";
import { sortKeys } from "../../static/sortKeys";
import { countries, translatedCountries } from "../../static/countries";
import { genericError } from "../../utils/general";
import { formatDate } from "../../utils/formatDate";
import { dac3sectors } from "../../static/dac3sectors";
import { dac5sectors } from "../../static/dac5sectors";
import { getFieldValueLang } from "../../utils/getFieldValueLang";
import {
  getDefaultAidTypes,
  getParticipatingOrgs
} from "../detail-api/utils/activity";
import {
  globalSearchFields,
  activitySearchFields
} from "../../static/globalSearchFields";
import { sectorTranslations } from "../../static/sectorTranslations";
import {
  AF_ACTIVITY_DATE_END_PLANNED,
  AF_ACTIVITY_DATE_START_PLANNED,
  AF_ACTIVITY_STATUS_CODE,
  AF_COUNTRY,
  AF_IATI_IDENTIFIER,
  AF_TITLE_NARRATIVE,
  AF_TRANSACTION_COUNTRY,
  AF_DEFAULT_AID_TYPE_CODE,
  AF_DEFAULT_AID_TYPE_NAME,
  AF_DEFAULT_AID_TYPE_VOCABULARY,
  AF_PARTICIPATING_ORG_NARRATIVE,
  AF_PARTICIPATING_ORG_NARRATIVE_LANG,
  AF_PARTICIPATING_ORG_REF,
  AF_PARTICIPATING_ORG_ROLE,
  AF_PARTICIPATING_ORG_TYPE,
  AF_PARTICIPATING_ORG_NARRATIVE_INDEX,
  AF_PARTICIPATING_ORG_NARRATIVE_LANG_INDEX,
  AF_PARTICIPATING_ORG_REF_INDEX,
  AF_PARTICIPATING_ORG_ROLE_INDEX,
  AF_PARTICIPATING_ORG_TYPE_INDEX
} from "../../static/apiFilterFields";

/** Basic functionality has been mapped, needs future steps to fully convert to direct-indexing */
export function activitiesTable(req: any, res: any) {
  const lang = req.body.lang || "en";
  const rows = get(req.body, "rows", 10);
  const start = get(req.body, "page", 0) * rows;
  // const sort: string = get(
  //   sortKeys,
  //   `[${get(req.body, "sort", "Start date desc")}]`,
  //   ""
  // );
  const filters: any = get(req.body, "filters", {});
  const search: string = get(req.body, "search", "");

  const values = {
    q: getQuery(filters, search, globalSearchFields),
    fl: `iati_identifier,${AF_DEFAULT_AID_TYPE_CODE},${AF_DEFAULT_AID_TYPE_NAME},${AF_DEFAULT_AID_TYPE_VOCABULARY},${AF_PARTICIPATING_ORG_NARRATIVE},${AF_PARTICIPATING_ORG_NARRATIVE_LANG},${AF_PARTICIPATING_ORG_REF},${AF_PARTICIPATING_ORG_TYPE},${AF_PARTICIPATING_ORG_ROLE},${AF_PARTICIPATING_ORG_ROLE_INDEX},${AF_PARTICIPATING_ORG_REF_INDEX},${AF_PARTICIPATING_ORG_TYPE_INDEX},${AF_PARTICIPATING_ORG_NARRATIVE_INDEX},${AF_PARTICIPATING_ORG_NARRATIVE_LANG_INDEX},title_narrative_text,title_narrative_lang,description_narrative_text,description_lang,recipient_country_code,transaction_recipient_country_code,recipient_region_code,transaction_recipient_region_code,sector_code,transaction_sector_code,budget_value,budget_type,transaction_type,transaction_value,activity_date_start_planned,activity_date_end_planned`,
    start,
    rows,
    sort: "iati_identifier desc"
  };

  axios
    .get(
      `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
        values,
        "&",
        "=",
        {
          encodeURIComponent: (str: string) => str
        }
      )}`
    )
    .then(response => {
      const count = get(response, "data.response.numFound", 0);
      const actualData = get(response, "data.response.docs", []);

      const result = actualData.map((activity: any) => {
        const startDate = activity.activity_date_start_planned || "";
        const endDate = activity.activity_date_end_planned || "";
        const aidTypes = getDefaultAidTypes(activity, lang)
          .map((type: any) => type.name)
          .join(", ");
        const code = get(activity, "iati_identifier", "");
        const title = getFieldValueLang(
          lang,
          get(activity, "title_narrative_text", [""]),
          get(activity, "title_narrative_lang", [""])
        );
        const description = getFieldValueLang(
          lang,
          get(activity, "description_narrative_text", [""]),
          get(activity, "description_lang", [""])
        );
        const countriesData = uniq([
          ...get(activity, "recipient_country_code", []),
          ...get(activity, "transaction_recipient_country_code", []),
          ...get(activity, "recipient_region_code", []),
          ...get(activity, "transaction_recipient_region_code", [])
        ]);
        const countryNames =
          countriesData.length > 0
            ? countriesData.map(countryCode => {
                const country = find(translatedCountries, {
                  code: countryCode
                });
                if (country) {
                  return get(
                    country.info,
                    `name${lang === "en" ? "" : `_${lang}`}`,
                    ""
                  );
                }
                return "";
              })
            : [];
        const orgs = filter(getParticipatingOrgs(activity, lang, true), {
          role: "Extending"
        })
          .map((org: any) => org.name)
          .join(", ");
        let disbursed = 0;
        let committed = 0;
        if (activity.transaction_type && activity.transaction_value) {
          activity.transaction_type.forEach((type: string, index: number) => {
            if (type === "3") {
              disbursed += get(activity, `transaction_value[${index}]`, 0);
            } else if (type === "2") {
              committed += get(activity, `transaction_value[${index}]`, 0);
            }
          });
        }

        let budget = get(activity, "budget_value[0]", 0);
        if (activity.budget_value && activity.budget_value.length > 1) {
          const revisedBudgedIndex = findIndex(
            activity.budget_type,
            t => t === "2"
          );
          if (revisedBudgedIndex > -1) {
            budget = get(
              activity,
              `budget_value[${revisedBudgedIndex}]`,
              budget
            );
          }
        }
        return {
          code,
          title,
          description,
          country_region: countryNames,
          startDate: formatDate(startDate, undefined, lang),
          endDate: formatDate(endDate, undefined, lang),
          status: aidTypes ? aidTypes : "-",
          committed,
          disbursed,
          budget,
          sectors: [
            ...get(activity, "sector_code", []).map((code: string) => {
              let fCode = find(dac3sectors, { code: code });
              const fTranslatedItem = find(sectorTranslations, {
                code: parseInt(code, 10)
              });
              if (fTranslatedItem) {
                return get(
                  fTranslatedItem.info,
                  `name${lang === "en" ? "" : `_${lang}`}`,
                  ""
                );
              } else if (fCode) {
                return fCode.name;
              } else {
                fCode = find(dac5sectors, { code: code });
                if (fCode) {
                  return fCode.name;
                }
              }
              return code;
            }),
            ...get(activity, "transaction_sector_code", []).map(
              (code: string) => {
                let fCode = find(dac3sectors, { code: code });
                const fTranslatedItem = find(sectorTranslations, {
                  code: parseInt(code, 10)
                });
                if (fTranslatedItem) {
                  return get(
                    fTranslatedItem.info,
                    `name${lang === "en" ? "" : `_${lang}`}`,
                    ""
                  );
                } else if (fCode) {
                  return fCode.name;
                } else {
                  fCode = find(dac5sectors, { code: code });
                  if (fCode) {
                    return fCode.name;
                  }
                }
                return code;
              }
            )
          ],
          orgs: orgs ? orgs : "-"
        };
      });
      res.json({
        count,
        data: result
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}

export function simpleActivitiesTable(req: any, res: any) {
  const rows = get(req.body, "rows", 10);
  const start = get(req.body, "page", 0) * rows;
  const sort: string = get(
    sortKeys,
    `[${get(req.body, "sort", "Start date desc")}]`,
    ""
  );
  const filters: any = get(req.body, "filters", {});
  const search: string = get(req.body, "search", "");

  const values = {
    q: getQuery(filters, search, activitySearchFields),
    fl: `iati_identifier,title_narrative_text,transaction_type,transaction_value,activity_date_start_planned,activity_date_start_actual`,
    start,
    rows,
    sort
  };

  axios
    .get(
      `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
        values,
        "&",
        "=",
        {
          encodeURIComponent: (str: string) => str
        }
      )}`
    )
    .then(response => {
      const count = get(response, "data.response.numFound", 0);
      const actualData = get(response, "data.response.docs", []);

      const result = actualData.map((activity: any) => {
        const startDate =
          activity.activity_date_start_planned ||
          activity.activity_date_start_actual ||
          "";
        const code = get(activity, "iati_identifier", "");
        const title = get(activity, "title_narrative_text[0]", "-");
        let disbursed = 0;
        let committed = 0;
        if (activity.transaction_type && activity.transaction_value) {
          activity.transaction_type.forEach((type: string, index: number) => {
            if (type === "3") {
              disbursed += get(activity, `transaction_value[${index}]`, 0);
            } else if (type === "2") {
              committed += get(activity, `transaction_value[${index}]`, 0);
            }
          });
        }
        return {
          title: {
            code,
            value: title
          },
          disbursed,
          committed,
          year: formatDate(startDate, "year")
        };
      });
      res.json({
        count,
        data: result
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
