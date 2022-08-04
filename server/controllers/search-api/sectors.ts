import axios from "axios";
import get from "lodash/get";
import filter from "lodash/filter";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getSectors } from "../../utils/globalSearch";
import { dac3sectors } from "../../static/dac3sectors";
import { dac5sectors } from "../../static/dac5sectors";
import { AF_REPORTING_ORG_REF, AF_SECTOR } from "../../static/apiFilterFields";

export function searchSectors(req: any, res: any) {
  if (!req.body.q || req.body.q.length === 0) {
    res.json({
      error: "'q' parameter is required"
    });
    return;
  }
  const limit = get(req.body, "rows", 10);
  const offset = get(req.body, "page", 0) * limit;
  const fSectors = filter(
    [...dac3sectors, ...dac5sectors],
    (s: any) => s.name.toLowerCase().indexOf(req.body.q.toLowerCase()) > -1
  )
    .map((s: any) => s.code)
    .join(" ");
  const values = {
    q: `${AF_REPORTING_ORG_REF}:${process.env.MFA_PUBLISHER_REF} AND (${AF_SECTOR}:"${req.body.q}" OR ${AF_SECTOR}:(${fSectors}))`,
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: AF_SECTOR,
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
    .then(callResponse => {
      const sectorsCount = get(callResponse, "data.facets.items.numBuckets", 0);
      const actualData = get(callResponse, "data.facets.items.buckets", []);
      res.json({
        count: sectorsCount,
        data: getSectors(actualData)
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
