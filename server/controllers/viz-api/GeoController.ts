import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import sumBy from "lodash/sumBy";
import querystring from "querystring";
import { countries } from "../../static/countries";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";
import { getCountryISO3 } from "../../utils/countryISOMapping";

export function geoChart(req: any, res: any) {
  const values = {
    q: `${getFormattedFilters(
      get(req.body, "filters", {})
    )} AND transaction_type:3`,
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "activity_recipient_country_code",
        limit: -1,
        facet: { sum: "sum(transaction_value)" }
      }
    }),
    rows: 0
  };

  axios
    .get(
      `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
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
      const result = actualData.map((item: any) => {
        return {
          id: getCountryISO3(item.val),
          value: item.sum,
          name: get(find(countries, { code: item.val }), "name", item.val)
        };
      });

      res.json({
        vizData: result,
        label: "activities",
        count: sumBy(result, "value")
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
