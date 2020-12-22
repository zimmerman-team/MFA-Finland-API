import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getActivities } from "../../utils/globalSearch";
import { getFormattedSearchParam } from "../../utils/filters";
import { globalSearchSelectFields } from "../../static/globalSearchFields";

export function searchActivities(req: any, res: any) {
  if (!req.body.q || req.body.q.length === 0) {
    res.json({
      error: "'q' parameter is required"
    });
    return;
  }
  const rows = get(req.body, "rows", 10);
  const start = get(req.body, "page", 0) * rows;
  const values = {
    q: getFormattedSearchParam(req.body.q),
    fl: globalSearchSelectFields.join(","),
    start,
    rows
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
      const activitiesCount = get(call1Response, "data.response.numFound", 0);
      const actualData = get(call1Response, "data.response.docs", []);
      res.json({
        count: activitiesCount,
        data: getActivities(actualData)
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
