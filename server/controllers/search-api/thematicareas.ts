import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getFormattedSearchParam } from "../../utils/filters";
import { thematicAreaNames } from "../../static/thematicAreaConsts";

export function searchThematicareas(req: any, res: any) {
  if (!req.body.q || req.body.q.length === 0) {
    res.json({
      error: "'q' parameter is required"
    });
    return;
  }
  const values = {
    q: `${getFormattedSearchParam(
      req.body.q
    )} AND (tag_code:Priority* OR tag_code:(${req.body.q}))`,
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "tag_code",
        limit: -1
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
      const actualData = get(call1Response, "data.facets.items.buckets", []);
      const data: any = [];
      actualData.forEach((tag: any) => {
        if (tag.val.indexOf("Priority") > -1) {
          const fArea = get(thematicAreaNames, tag.val, "");
          if (fArea) {
            data.push({
              name: fArea,
              link: encodeURIComponent(`thematic-area/${tag.val}`)
            });
          }
        }
      });
      res.json({
        count: data.length,
        data
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
