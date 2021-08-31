// @ts-nocheck
import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import findIndex from "lodash/findIndex";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { dac3sectors } from "../../static/dac3sectors";
import { dac5sectors } from "../../static/dac5sectors";
import { formatLocale } from "../../utils/formatLocale";
import { getFormattedFilters } from "../../utils/filters";
import { getCountryISO3 } from "../../utils/countryISOMapping";
import { orgTypesCodelist } from "../../static/orgTypesCodelist";
import { locationsMapping } from "../../static/locationsMapping";
import { partnerCountries } from "../../static/partnerCountries";
import { thematicAreaNames } from "../../static/thematicAreaConsts";
import { sectorMapping } from "../../static/sectorMapping";

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
        const fsector = find(
          [
            ...dac3sectors,
            ...dac5sectors,
            ...sectorMapping.children.map((item: any) => ({
              ...item,
              name: item.title
            }))
          ],
          {
            code: req.body.filters.sector_code[0]
          }
        );
        if (fsector) {
          res.json({
            data: [
              get(fsector, "name", req.body.filters.sector_code[0]),
              get(fsector, "description", "")
            ]
          });
        } else {
          res.json({
            data: ["", ""]
          });
        }
      }
      if (req.body.detail_type && data) {
        if (req.body.detail_type === "recipient_country_code") {
          const iso3 = getCountryISO3(
            req.body.filters.recipient_country_code[0]
          );
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
            axios
              .get(
                `${process.env.HDRO_API}/country_code=${iso3}/indicator_id=69206,69706,103006,195706,146206/structure=ciy`
              )
              .then((hdroresp: any) => {
                const indicatorsData = hdroresp.data.indicator_value[iso3];
                const indicators = Object.keys(indicatorsData).map(
                  (indicator: string) => {
                    let value = 0;
                    const length = Object.keys(indicatorsData[indicator])
                      .length;
                    Object.keys(indicatorsData[indicator]).forEach(
                      (year: string, index: number) => {
                        if (index === length - 1) {
                          value = indicatorsData[indicator][year];
                        }
                      }
                    );
                    switch (indicator) {
                      case "69206":
                        return `Life expectancy at birth: ${value}`;
                      case "69706":
                        return `Expected years of schooling: ${value}`;
                      case "103006":
                        return `Mean years of schooling: ${value}`;
                      case "195706":
                        return `Gross national income (GNI) per capita: ${formatLocale(
                          value
                        ).replace("€", "$")}`;
                      case "146206":
                        return `HDI rank: ${value}`;
                      default:
                        return "";
                    }
                  }
                );
                res.json({
                  data: {
                    region,
                    isPartner,
                    indicators
                  }
                });
              })
              .catch((error: any) => {
                genericError(error, res);
              });
          }
        }
        if (req.body.detail_type === "participating_org_ref") {
          const refIndex = findIndex(
            data.participating_org_ref,
            (ref: string) => ref === req.body.filters.participating_org_ref[0]
          );
          result = get(data, `participating_org_narrative[${refIndex}]`, "");
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
