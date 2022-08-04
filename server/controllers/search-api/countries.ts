import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getCountries } from "../../utils/globalSearch";
import { getFormattedSearchParam } from "../../utils/filters";
import { AF_COUNTRY } from "../../static/apiFilterFields";

export function searchCountries(req: any, res: any) {
  if (!req.body.q || req.body.q.length === 0) {
    res.json({
      error: "'q' parameter is required"
    });
    return;
  }
  const limit = get(req.body, "rows", 10);
  const offset = get(req.body, "page", 0) * limit;
  const values = {
    q: getFormattedSearchParam(req.body.q),
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: AF_COUNTRY,
        limit,
        offset,
        numBuckets: true
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
      const countriesCount = get(
        call1Response,
        "data.facets.items.numBuckets",
        0
      );
      const actualData = get(call1Response, "data.facets.items.buckets", []);
      res.json({
        count: countriesCount,
        data: getCountries(actualData)
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
