import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import some from "lodash/some";
import uniq from "lodash/uniq";
import sumBy from "lodash/sumBy";
import filter from "lodash/filter";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { orgMapping } from "../../static/orgMapping";
import { translatedCountries } from "../../static/countries";
import { orgTypesCodelist } from "../../static/orgTypesCodelist";
import { calculateRegions, getColorsBasedOnValues } from "../../utils/treemap";
import {
  getFormattedFilters,
  normalizeActivity2TransactionFilters
} from "../../utils/filters";

export function projectsTreemapChart(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
    {
      q: normalizeActivity2TransactionFilters(
        getFormattedFilters(get(req.body, "filters", {}), true)
      ),
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: "iati_identifier",
          limit: -1,
          facet: {
            name: {
              type: "terms",
              field: "title_narrative"
            },
            disbursed: {
              type: "query",
              q: "transaction_type:3",
              facet: { value: "sum(transaction_value)" }
            }
          }
        }
      }),
      rows: 0
    },
    "&",
    "=",
    {
      encodeURIComponent: (str: string) => str
    }
  )}`;

  axios
    .get(url)
    .then(call1Response => {
      const actualData = get(call1Response, "data.facets.items.buckets", []);
      let result = getColorsBasedOnValues(
        actualData.map((item: any) => {
          return {
            name: `${get(item, "name.buckets[0].val", "")}`,
            value: item.disbursed.value || 0,
            ref: item.val.toUpperCase(),
            orgs: []
          };
        }),
        false
      );
      res.json({
        count: get(call1Response, "data.facets.count"),
        vizData: result
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}

export function locationsTreemapChart(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
    {
      q: normalizeActivity2TransactionFilters(
        getFormattedFilters(get(req.body, "filters", {}), true)
      ),
      "json.facet": JSON.stringify({
        countries: {
          type: "terms",
          field: "activity_recipient_country_code",
          limit: -1,
          facet: {
            disbursed: {
              type: "query",
              q: "transaction_type:3",
              facet: { value: "sum(transaction_value)" }
            },
            committed: {
              type: "query",
              q: "transaction_type:2",
              facet: { value: "sum(transaction_value)" }
            }
          }
        },
        regions: {
          type: "terms",
          field: "activity_recipient_region_code",
          limit: -1,
          facet: {
            disbursed: {
              type: "query",
              q: "transaction_type:3",
              facet: { value: "sum(transaction_value)" }
            },
            committed: {
              type: "query",
              q: "transaction_type:2",
              facet: { value: "sum(transaction_value)" }
            }
          }
        },
        regionNames: {
          type: "terms",
          field: "activity_recipient_region_name",
          limit: -1
        }
      }),
      rows: 0
    },
    "&",
    "=",
    {
      encodeURIComponent: (str: string) => str
    }
  )}`;

  axios
    .get(url)
    .then(call1Response => {
      const countriesData = get(
        call1Response,
        "data.facets.countries.buckets",
        []
      );
      const regionsData = get(call1Response, "data.facets.regions.buckets", []);
      const regionNameData = get(
        call1Response,
        "data.facets.regionNames.buckets",
        []
      );
      const countries = countriesData.map((item: any) => {
        const fCountry = find(translatedCountries, { code: item.val });
        return {
          name: get(fCountry, "info.name", item.val),
          name_fi: get(fCountry, "info.name_fi", item.val),
          name_se: get(fCountry, "info.name_se", item.val),
          value: item.disbursed.value || 0,
          committed: item.committed.value || 0,
          percentage: (item.disbursed.value / item.committed.value) * 100,
          ref: item.val.toUpperCase(),
          orgs: []
        };
      });
      const regions = regionsData.map((item: any, index: number) => {
        return {
          name: `${get(regionNameData, `[${index}].val`, "")}`,
          value: item.disbursed.value || 0,
          committed: item.committed.value || 0,
          percentage: (item.disbursed.value / item.committed.value) * 100,
          ref: item.val.toUpperCase(),
          orgs: []
        };
      });
      let result = calculateRegions([...countries, ...regions]);
      res.json({
        count: get(call1Response, "data.facets.count"),
        vizData: {
          name: "",
          color: "",
          children: result
        }
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}

export function organisationsTreemapChart2(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
    {
      q: `${getFormattedFilters(
        get(req.body, "filters", {})
      )} AND participating_org_ref:* AND (transaction_type:3 OR transaction_type:2)`,
      fl:
        "transaction_value,transaction_type,participating_org_ref,participating_org_type,participating_org_narrative,participating_org_role",
      rows: 20000
    },
    "&",
    "=",
    {
      encodeURIComponent: (str: string) => str
    }
  )}`;

  axios
    .get(url)
    .then(call1Response => {
      const actualData = get(call1Response, "data.response.docs", []);
      let orgTypes: string[] = [];
      actualData.forEach((doc: any) => {
        if (doc.transaction_value && doc.transaction_type) {
          doc.disbursed = 0;
          doc.committed = 0;
          doc.transaction_type.forEach((type: string, index: number) => {
            if (type === "3") {
              doc.disbursed += get(doc, `transaction_value[${index}]`, 0);
            } else if (type === "2") {
              doc.committed += get(doc, `transaction_value[${index}]`, 0);
            }
          });
        }
        orgTypes = [...orgTypes, ...doc.participating_org_type];
      });
      orgTypes = uniq(orgTypes);
      const orgTypesData = orgTypes.map((type: string) => {
        const data = filter(
          actualData,
          (doc: any) => doc.participating_org_type.indexOf(type) > -1
        );
        let orgs: any[] = [];
        data.forEach((doc: any) => {
          doc.participating_org_ref.forEach((orgRef: string, index: number) => {
            const orgRole = get(doc.participating_org_role, `[${index}]`, "");
            if (orgRole !== "1") {
              const fOrg = find(orgs, { ref: orgRef });
              if (fOrg) {
                fOrg.value += doc.disbursed;
                fOrg.committed += doc.committed;
              } else {
                orgs.push({
                  ref: orgRef,
                  name: get(
                    doc.participating_org_narrative,
                    `[${index}]`,
                    orgRef
                  ),
                  value: doc.disbursed,
                  committed: doc.committed,
                  orgs: []
                });
              }
            }
          });
        });
        orgs = orgs.map((org: any) => ({
          ...org,
          percentage: (org.value / org.committed) * 100
        }));
        return {
          ref: type,
          name: get(find(orgTypesCodelist, { code: type }), "name", type),
          value: sumBy(data, "disbursed"),
          committed: sumBy(data, "committed"),
          percentage:
            (sumBy(data, "disbursed") / sumBy(data, "committed")) * 100,
          orgs
        };
      });
      res.json({
        count: orgTypesData.length,
        vizData: {
          name: "",
          color: "",
          children: getColorsBasedOnValues(orgTypesData, true)
        }
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}

export function organisationsTreemapChart(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
    {
      q: `${normalizeActivity2TransactionFilters(
        getFormattedFilters(get(req.body, "filters", {}))
      )} AND participating_org_ref:* AND (transaction_type:3 OR transaction_type:2)`,
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: "participating_org_ref",
          limit: -1,
          facet: {
            names: {
              type: "terms",
              field: "participating_org_narrative",
              limit: 2
            },
            disbursed: {
              type: "query",
              q: "transaction_type:3",
              facet: { value: "sum(transaction_value)" }
            },
            committed: {
              type: "query",
              q: "transaction_type:2",
              facet: { value: "sum(transaction_value)" }
            }
          }
        }
      }),
      rows: 0
    },
    "&",
    "=",
    {
      encodeURIComponent: (str: string) => str
    }
  )}`;

  axios
    .get(url)
    .then(call1Response => {
      const rawData = get(call1Response, "data.facets.items.buckets", []);
      const orgs: any[] = [];
      const codelist = orgMapping;

      const lvl4Orgs = filter(
        codelist,
        (item: any) =>
          item.info.level === 4 &&
          some(
            rawData,
            (dataItem: any) =>
              parseInt(dataItem.val.split("-")[0], 10) === item.code
          )
      );
      const lvl1Orgs = filter(
        codelist,
        (item: any) =>
          item.info.level === 1 &&
          (some(
            lvl4Orgs,
            (lvl4Item: any) => lvl4Item.info.lvl_1 === item.code
          ) ||
            some(
              rawData,
              (dataItem: any) =>
                parseInt(dataItem.val.split("-")[0], 10) === item.code
            ))
      );
      const lvl0Orgs = filter(
        codelist,
        (item: any) =>
          item.info.level === 0 &&
          (some(
            lvl1Orgs,
            (lvl1Item: any) => lvl1Item.info.lvl_0 === item.code
          ) ||
            some(
              rawData,
              (dataItem: any) =>
                parseInt(dataItem.val.split("-")[0], 10) === item.code
            ))
      );

      lvl0Orgs.forEach((lvl0Item: any) => {
        const lvl0Org = {
          name: lvl0Item.info.name,
          ref: lvl0Item.code.toString(),
          orgs: []
        };

        const lvl1OrgsResult: any[] = [];

        filter(
          lvl1Orgs,
          (lvl1Item: any) => lvl1Item.info.lvl_0 === lvl0Item.code
        ).forEach((lvl1Item: any) => {
          const codelistOrgs = filter(
            lvl4Orgs,
            (lvl4Item: any) => lvl4Item.info.lvl_1 === lvl1Item.code
          ).map((lvl4Item: any) => ({
            name: lvl4Item.info.name,
            ref: lvl4Item.code.toString(),
            orgs: filter(
              rawData,
              (dataItem: any) =>
                parseInt(dataItem.val.split("-")[0], 10) === lvl4Item.code
            ).map((dataItem: any) => {
              let name = "";
              const names = get(dataItem, "names.buckets", []);
              if (names.length > 0) {
                if (
                  names[0].val !== "Ministry for Foreign Affairs of Finland"
                ) {
                  name = names[0].val;
                } else if (names.length > 1) {
                  name = names[1].val;
                }
              }

              const disbursed = get(dataItem, "disbursed.value", 0);
              const committed = get(dataItem, "committed.value", 0);

              return {
                name,
                ref: dataItem.val,
                value: disbursed,
                committed: committed,
                percentage: (disbursed / committed) * 100,
                orgs: []
              };
            })
          }));
          const nonCodelistOrgs = filter(
            rawData,
            (dataItem: any) =>
              parseInt(dataItem.val.split("-")[0], 10) === lvl1Item.code
          ).map((dataItem: any) => {
            let name = "";
            const names = get(dataItem, "names.buckets", []);
            if (names.length > 0) {
              if (names[0].val !== "Ministry for Foreign Affairs of Finland") {
                name = names[0].val;
              } else if (names.length > 1) {
                name = names[1].val;
              }
            }

            const disbursed = get(dataItem, "disbursed.value", 0);
            const committed = get(dataItem, "committed.value", 0);

            return {
              name,
              ref: dataItem.val,
              value: disbursed,
              committed: committed,
              percentage: (disbursed / committed) * 100,
              orgs: []
            };
          });
          lvl1OrgsResult.push({
            name: lvl1Item.info.name,
            ref: lvl1Item.code.toString(),
            orgs: [...codelistOrgs, ...nonCodelistOrgs]
          });
        });

        lvl0Org.orgs = lvl1OrgsResult as never[];

        orgs.push(lvl0Org);
      });

      orgs.forEach((org: any, index: number) => {
        let disbursed = 0;
        let committed = 0;
        org.orgs.forEach((org1: any, index1: number) => {
          org1.orgs.forEach((org2: any, index2: number) => {
            if (org2.orgs.length > 0) {
              disbursed = sumBy(org2.orgs, "value");
              committed = sumBy(org2.orgs, "committed");
              orgs[index].orgs[index1].orgs[index2].value = disbursed;
              orgs[index].orgs[index1].orgs[index2].committed = committed;
              orgs[index].orgs[index1].orgs[index2].percentage =
                (disbursed / committed) * 100;
            }
            orgs[index].orgs[index1].orgs[index2].orgs = getColorsBasedOnValues(
              orgs[index].orgs[index1].orgs[index2].orgs,
              true
            );
          });
          disbursed = sumBy(org1.orgs, "value");
          committed = sumBy(org1.orgs, "committed");
          orgs[index].orgs[index1].value = disbursed;
          orgs[index].orgs[index1].committed = committed;
          orgs[index].orgs[index1].percentage = (disbursed / committed) * 100;
          orgs[index].orgs[index1].orgs = getColorsBasedOnValues(
            orgs[index].orgs[index1].orgs,
            true
          );
        });
        disbursed = sumBy(org.orgs, "value");
        committed = sumBy(org.orgs, "committed");
        orgs[index].value = disbursed;
        orgs[index].committed = committed;
        orgs[index].percentage = (disbursed / committed) * 100;
      });

      res.json({
        count: orgs.length,
        vizData: {
          name: "",
          color: "",
          children: getColorsBasedOnValues(
            filter(orgs, (org: any) => org.value > 0 || org.committed > 0),
            true
          )
        }
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
