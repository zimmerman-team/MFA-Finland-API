// @ts-nocheck
import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import findIndex from "lodash/findIndex";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { orgMapping } from "../../static/orgMapping";
import { formatLocale } from "../../utils/formatLocale";
import { translatedCountries } from "../../static/countries";
import { getCountryISO3 } from "../../utils/countryISOMapping";
import { orgTypesCodelist } from "../../static/orgTypesCodelist";
import { locationsMapping } from "../../static/locationsMapping";
import { partnerCountries } from "../../static/partnerCountries";
import { sectorTranslations } from "../../static/sectorTranslations";

export function detailPageName(req: any, res: any) {
  const values = {
    q: `reporting_org_ref:${process.env.MFA_PUBLISHER_REF} AND ${[
      req.body.detail_type
    ]}:(${get(req.body.filters, `${req.body.detail_type}[0]`, "")})`,
    fl:
      "participating_org_ref,participating_org_narrative,recipient_region_code,recipient_region_name,sector_code",
    rows: 1
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
      const data = get(response.data, "response.docs[0]", null);
      let result = "";
      if (req.body.detail_type === "sector_code") {
        const fsector = find(sectorTranslations, {
          code: parseInt(req.body.filters.sector_code[0], 10)
        });
        if (fsector) {
          res.json({
            data: {
              names: {
                name: fsector.info.name,
                name_fi: fsector.info.name_fi,
                name_se: fsector.info.name_se
              },
              description: fsector.info.description
            }
          });
        } else {
          res.json({
            data: {
              names: {
                name: req.body.filters.sector_code[0],
                name_fi: req.body.filters.sector_code[0],
                name_se: req.body.filters.sector_code[0]
              },
              description: ""
            }
          });
        }
      }
      if (
        (!data ||
          (req.body.filters.participating_org_ref &&
            req.body.filters.participating_org_ref.length > 1)) &&
        req.body.detail_type === "participating_org_ref"
      ) {
        const fOrgMapping = find(orgMapping, {
          code: parseInt(
            req.body.filters.participating_org_ref[
              req.body.filters.participating_org_ref.length - 1
            ],
            10
          )
        });
        if (fOrgMapping) {
          result = fOrgMapping.info.name;
        }
      }
      if (req.body.detail_type && data) {
        if (req.body.detail_type === "recipient_country_code") {
          const iso3 = getCountryISO3(
            req.body.filters.recipient_country_code[0]
          );
          const fCountry = find(translatedCountries, {
            code: req.body.filters.recipient_country_code[0]
          });
          let isPartner = false;
          let region = "";
          isPartner =
            find(
              partnerCountries,
              (p: string) => p === req.body.filters.recipient_country_code[0]
            ) !== undefined;
          Object.keys(locationsMapping).forEach((key: string) => {
            const fRegion = find(
              locationsMapping[key],
              (c: string) =>
                c === get(req.body, "filters.recipient_country_code[0]", "")
            );
            if (fRegion) {
              region = key;
            }
          });
          if (iso3) {
            const calls = [
              axios.get(
                `${process.env.HDRO_API}/country_code=${iso3}/indicator_id=69206,69706,103006,195706,146206/structure=ciy`
              ),
              axios.get(
                `${
                  process.env.UM_FI_API
                }/articles/current-affairs/${iso3.toLowerCase()}?category=386596&lang=${req
                  .body.lang || "en"}`
              ),
              axios.get(
                `${
                  process.env.UM_FI_API
                }/contact-info/${iso3.toLowerCase()}/um?lang=${req.body.lang ||
                  "en"}&page=1`
              ),
              axios.get(
                `${
                  process.env.UM_FI_API
                }/contact-info/${iso3.toLowerCase()}/ue?lang=${req.body.lang ||
                  "en"}&page=1`
              )
            ];
            axios
              .all(calls)
              .then(
                axios.spread((...responses) => {
                  const indicatorsData =
                    responses[0].data.indicator_value[iso3];
                  const indicators = Object.keys(indicatorsData).map(
                    (indicator: string) => {
                      let value = 0;
                      const length = Object.keys(indicatorsData[indicator])
                        .length;
                      let yearvalue = "";
                      Object.keys(indicatorsData[indicator]).forEach(
                        (year: string, index: number) => {
                          if (index === length - 1) {
                            yearvalue = year;
                            value = indicatorsData[indicator][year];
                          }
                        }
                      );
                      switch (indicator) {
                        case "69206":
                          return `Life expectancy at birth (${yearvalue}): ${value}`;
                        case "69706":
                          return `Expected years of schooling (${yearvalue}): ${value}`;
                        case "103006":
                          return `Mean years of schooling (${yearvalue}): ${value}`;
                        case "195706":
                          return `Gross national income (GNI) per capita (${yearvalue}): ${formatLocale(
                            value
                          ).replace("€", "$")}`;
                        case "146206":
                          return `HDI rank (${yearvalue}): ${value}`;
                        default:
                          return "";
                      }
                    }
                  );
                  const newsData = responses[1].data;
                  const contactData = get(
                    responses[2],
                    "data.contactInfos[0]",
                    null
                  );
                  const embassyData = get(
                    responses[3],
                    "data.contactInfos[0]",
                    null
                  );
                  res.json({
                    data: {
                      region,
                      isPartner,
                      indicators,
                      name: get(
                        fCountry,
                        "info.name",
                        req.body.filters.recipient_country_code[0]
                      ),
                      name_fi: get(
                        fCountry,
                        "info.name_fi",
                        req.body.filters.recipient_country_code[0]
                      ),
                      name_se: get(
                        fCountry,
                        "info.name_se",
                        req.body.filters.recipient_country_code[0]
                      ),
                      news: newsData.map((n: any) => ({
                        title: n.title,
                        link: n.link
                      })),
                      contact: {
                        title: contactData
                          ? contactData.reportName || contactData.title
                          : "",
                        link: contactData ? contactData.link : "",
                        embassy: {
                          title: embassyData
                            ? embassyData.reportName || embassyData.title
                            : "",
                          link: embassyData ? embassyData.link : ""
                        }
                      }
                    }
                  });
                })
              )
              .catch((error: any) => {
                genericError(error, res);
              });
          }
        }
        if (
          req.body.detail_type === "participating_org_ref" &&
          result.length === 0
        ) {
          const refIndex = findIndex(
            data.participating_org_ref,
            (ref: string) => ref === req.body.filters.participating_org_ref[0]
          );
          result = get(data, `participating_org_narrative[${refIndex}]`, "");
          const fOrgMapping = find(orgMapping, {
            code: parseInt(
              req.body.filters.participating_org_ref[
                req.body.filters.participating_org_ref.length - 1
              ],
              10
            )
          });
          if (fOrgMapping && result.length === 0) {
            result = fOrgMapping.info.name;
          }
        }
        if (req.body.detail_type === "recipient_region_code") {
          const refIndex = findIndex(
            data.recipient_region_code,
            (ref: string) => ref === req.body.filters.recipient_region_code[0]
          );
          result = get(data, `recipient_region_name[${refIndex}]`, "");
        }
        if (req.body.detail_type === "tag_narrative") {
          result = req.body.filters.tag_narrative[0];
          // get(
          //   thematicAreaNames,
          //   req.body.filters.tag_narrative[0].replace("|", ","),
          //   ""
          // ).replace(" is the main priority area in this activity", "");
        }
        if (req.body.detail_type === "participating_org_type") {
          result = get(
            find(orgTypesCodelist, {
              code: req.body.filters.participating_org_type[0]
            }),
            "name",
            ""
          );
        }
      }
      if (
        req.body.detail_type !== "recipient_country_code" &&
        req.body.detail_type !== "sector_code"
      ) {
        res.json({
          data: [result]
        });
      }
    })
    .catch(errors => {
      console.log(errors);
      genericError(errors, res);
    });
}
