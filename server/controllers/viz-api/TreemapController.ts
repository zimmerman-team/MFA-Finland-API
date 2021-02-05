import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import uniq from "lodash/uniq";
import sumBy from "lodash/sumBy";
import filter from "lodash/filter";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { countries as COUNTRIES } from "../../static/countries";
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
        getFormattedFilters(get(req.body, "filters", {}))
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
        })
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
        getFormattedFilters(get(req.body, "filters", {}))
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
      const countries = countriesData.map((item: any, index: number) => {
        return {
          name: get(find(COUNTRIES, { code: item.val }), "name", item.val),
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

export function organisationsTreemapChart(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
    {
      q: `${getFormattedFilters(
        get(req.body, "filters", {})
      )} AND participating_org_ref:* AND (transaction_type:3 OR transaction_type:2)`,
      fl:
        "transaction_value,transaction_type,participating_org_ref,participating_org_type,participating_org_narrative",
      rows: 15000
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
          children: getColorsBasedOnValues(orgTypesData)
        }
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
