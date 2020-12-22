import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import querystring from "querystring";
import { countries } from "../../static/countries";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";

export function countriesTable(req: any, res: any) {
  const values = {
    q: getFormattedFilters(get(req.body, "filters", {})),
    "json.facet": JSON.stringify({
      items: { type: "terms", field: "recipient_country_code", limit: -1 }
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
      const count = actualData.length;
      const result: any[] = [];
      actualData.forEach((item: any) => {
        const country = find(countries, { code: item.val });
        if (country) {
          result.push([country.code, [country.code, country.name], item.count]);
        }
      });
      res.json({
        count,
        data: result
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
