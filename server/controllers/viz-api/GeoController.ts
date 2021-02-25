import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import sumBy from "lodash/sumBy";
import querystring from "querystring";
import { countries } from "../../static/countries";
import { genericError } from "../../utils/general";
import { getCountryISO3 } from "../../utils/countryISOMapping";
import {
  getFormattedFilters,
  normalizeActivity2TransactionFilters
} from "../../utils/filters";

export function geoChart(req: any, res: any) {
  const values = {
    q: `${normalizeActivity2TransactionFilters(
      getFormattedFilters(get(req.body, "filters", {}), true)
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
  const unallocableValues = {
    q: `${normalizeActivity2TransactionFilters(
      getFormattedFilters(get(req.body, "filters", {}), true)
    )}`,
    "json.facet": JSON.stringify({
      unallocable: {
        type: "query",
        query:
          "transaction_type:3 AND (activity_recipient_country_code:998 OR transaction_recipient_country_code:998 OR activity_recipient_region_code:998 OR transaction_recipient_region_code:998)",
        facet: { sum: "sum(transaction_value)" }
      },
      total: {
        type: "query",
        query: "transaction_type:3",
        facet: { sum: "sum(transaction_value)" }
      }
    }),
    rows: 0
  };

  const calls = [
    axios.get(
      `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
        values,
        "&",
        "=",
        {
          encodeURIComponent: (str: string) => str
        }
      )}`
    ),
    axios.get(
      `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
        unallocableValues,
        "&",
        "=",
        {
          encodeURIComponent: (str: string) => str
        }
      )}`
    )
  ];

  axios
    .all(calls)
    .then(
      axios.spread((...responses) => {
        const actualData = get(responses[0], "data.facets.items.buckets", []);
        const unallocable = get(responses[1], "data.facets.unallocable.sum", 0);
        const total = get(responses[1], "data.facets.total.sum", 0);

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
          count: sumBy(result, "value"),
          unallocablePercentage: ((unallocable * 100) / total).toFixed(2)
        });
      })
    )
    .catch(error => {
      genericError(error, res);
    });
}
