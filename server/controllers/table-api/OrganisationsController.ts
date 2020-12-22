import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import querystring from "querystring";
// import { sortKeys } from "../../static/sortKeys";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";

export function organisationsTable(req: any, res: any) {
  // const limit = get(req.body, "rows", 10);
  // const offset = get(req.body, "page", 0) * limit;
  // const sort: string = get(
  //   sortKeys,
  //   `[${get(req.body, "sort", "Activities count desc")}]`,
  //   ""
  // );
  const values = {
    q: getFormattedFilters(get(req.body, "filters", {})),
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "participating_org_ref",
        // sort,
        // limit,
        // offset,
        limit: -1,
        missing: true,
        numBuckets: true
        // facet: {
        //   sub: {
        //     type: "terms",
        //     field: "participating_org_narrative_text",
        //     limit: 1,
        //   },
        // },
      }
    }),
    rows: 0
  };
  axios
    .get(
      `${process.env.DS_REST_API}/codelists/OrganisationIdentifier/?format=json`
    )
    .then(codelistResponse => {
      const orgsCodelistData = get(codelistResponse, "data", []);
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
        .then(call1Response => {
          // const count = get(call1Response, "data.facets.items.numBuckets", 0);
          const actualData = get(
            call1Response,
            "data.facets.items.buckets",
            []
          );
          // const result = actualData.map((item: any) => [
          //   [item.val, get(item, "sub.buckets[0].val", "")],
          //   item.count,
          // ]);
          const result: any[] = [];
          actualData.forEach((item: any) => {
            const fOrg = find(
              orgsCodelistData,
              (org: any) => org.code.toLowerCase() === item.val.toLowerCase()
            );
            result.push([
              item.val.toUpperCase(),
              [item.val.toUpperCase(), get(fOrg, "name", "")],
              item.count
            ]);
          });
          const count = result.length;
          res.json({
            count,
            data: result
          });
        })
        .catch(error1 => {
          genericError(error1, res);
        });
    })
    .catch(error => {
      genericError(error, res);
    });
}
