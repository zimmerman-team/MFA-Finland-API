import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { sortKeys } from "../../static/sortKeys";
import { genericError } from "../../utils/general";
import { getQuery } from "../../utils/filters";
import {
  activitySearchFields,
  publishersSearchFields
} from "../../static/globalSearchFields";

export function publishersTable(req: any, res: any) {
  const limit = get(req.body, "rows", 10);
  const offset = get(req.body, "page", 0) * limit;
  const sort: string = get(
    sortKeys,
    `[${get(req.body, "sort", "Activities count desc")}]`,
    ""
  );
  const filters: any = get(req.body, "filters", {});
  const search: string = get(req.body, "search", "");

  const values = {
    q: getQuery(filters, search, publishersSearchFields),
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "reporting_org_ref",
        sort,
        limit,
        offset,
        missing: true,
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
      const count = get(call1Response, "data.facets.items.numBuckets", 0);
      const actualData = get(call1Response, "data.facets.items.buckets", []);
      const result = actualData.map((item: any) => [
        item.val.toUpperCase(),
        [item.val.toUpperCase(), get(item, "sub.buckets[0].val", "")],
        item.count
      ]);
      res.json({
        count,
        data: result
      });
    })
    .catch(error1 => {
      genericError(error1, res);
    });
}
