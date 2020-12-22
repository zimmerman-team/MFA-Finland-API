import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getDonors } from "../../utils/globalSearch";
import { getFormattedSearchParam } from "../../utils/filters";

export function searchDonors(req: any, res: any) {
  if (!req.body.q || req.body.q.length === 0) {
    res.json({
      error: "'q' parameter is required"
    });
    return;
  }
  const limit = get(req.body, "rows", 10);
  const offset = get(req.body, "page", 0) * limit;
  const values = {
    q: `transaction_provider_org_narrative:"${req.body.q}"`,
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "transaction_provider_org_ref",
        limit,
        offset,
        missing: true,
        numBuckets: true,
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
    .then(call1Response => {
      const donorsCount = get(call1Response, "data.facets.items.numBuckets", 0);
      const actualData = get(call1Response, "data.facets.items.buckets", []);
      res.json({
        count: donorsCount,
        data: getDonors(actualData)
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
