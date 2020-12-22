import axios from "axios";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";
import { getColorsBasedOnValues } from "../../utils/treemap";

export function basicTreemapChart(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
    {
      q: getFormattedFilters(get(req.body, "filters", {})),
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: "reporting_org_type_name",
          limit: -1,
          facet: {
            orgs: {
              type: "terms",
              field: "reporting_org_narrative",
              limit: -1
            },
            refs: {
              type: "terms",
              field: "reporting_org_ref",
              limit: -1
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
          const organisationBucket = get(item, "orgs.buckets", []);
          const refBucket = get(item, "refs.buckets", []);

          function getOrgs() {
            const orgs: any = [];

            Object.values(organisationBucket).forEach((org, index) => {
              orgs.push({
                title: organisationBucket[index].val,
                size: organisationBucket[index].count,
                ref: get(refBucket[index], "val", null)
              });
            });

            return orgs;
          }

          const orgList = getOrgs();

          return {
            name: item.val,
            orgs: orderBy(orgList, "size", "desc"),
            value: item.count
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

export function donorsTreemapChart(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
    {
      q: getFormattedFilters(get(req.body, "filters", {})),
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: "transaction_provider_org_ref",
          limit: -1,
          facet: {
            sub: {
              type: "terms",
              field: "transaction_provider_org_narrative",
              limit: 1
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
            name: `${get(
              item,
              "sub.buckets[0].val",
              ""
            )} | ${item.val.toUpperCase()}`,
            value: item.count,
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
