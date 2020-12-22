import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getPublishers } from "../../utils/globalSearch";
import { getFormattedSearchParam } from "../../utils/filters";

export function searchPublishers(req: any, res: any) {
  if (!req.body.q || req.body.q.length === 0) {
    res.json({
      error: "'q' parameter is required"
    });
    return;
  }
  const limit = get(req.body, "rows", 10);
  const offset = get(req.body, "page", 0) * limit;
  const values = {
    q: `reporting_org_narrative:"${req.body.q}"`,
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "reporting_org_ref",
        limit,
        offset,
        numBuckets: true,
        facet: {
          sub: {
            type: "terms",
            field: "reporting_org_narrative",
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
      const publishersCount = get(
        call1Response,
        "data.facets.items.numBuckets",
        0
      );
      const actualData = get(call1Response, "data.facets.items.buckets", []);
      res.json({
        count: publishersCount,
        data: getPublishers(actualData)
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
