import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import sumBy from "lodash/sumBy";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { translatedCountries } from "../../static/countries";
import { getCountryISO3 } from "../../utils/countryISOMapping";
import {
  getFormattedFilters,
  normalizeActivity2TransactionFilters
} from "../../utils/filters";
import {
  AF_COUNTRY,
  AF_TRANSACTION_UNDERSCORED,
  AF_TRANSACTION_COUNTRY,
  AF_TRANSACTION_TYPE_CODE,
  AF_REGION,
  AF_TRANSACTION_REGION
} from "../../static/apiFilterFields";

export function geoChart(req: any, res: any) {
  const values = {
    q: `${normalizeActivity2TransactionFilters(
      getFormattedFilters(get(req.body, "filters", {}), true)
    )} AND ${AF_TRANSACTION_TYPE_CODE}:3`,
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: AF_COUNTRY,
        limit: -1,
        facet: { sum: `sum(${AF_TRANSACTION_UNDERSCORED})` }
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
        query: `${AF_TRANSACTION_TYPE_CODE}:3 AND (${AF_COUNTRY}:998 OR ${AF_TRANSACTION_COUNTRY}:998 OR ${AF_REGION}:998 OR ${AF_TRANSACTION_REGION}:998)`,
        facet: { sum: `sum(${AF_TRANSACTION_UNDERSCORED})` }
      },
      total: {
        type: "query",
        query: `${AF_TRANSACTION_TYPE_CODE}:3`,
        facet: { sum: `sum(${AF_TRANSACTION_UNDERSCORED})` }
      }
    }),
    rows: 0
  };
  const projectCountValues = {
    q: getFormattedFilters(get(req.body, "filters", {})),
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
    ),
    axios.get(
      `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
        projectCountValues,
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
          const fCountry = find(translatedCountries, { code: item.val });
          return {
            id: getCountryISO3(item.val),
            value: item.sum,
            name: get(fCountry, "info.name", item.val),
            name_fi: get(fCountry, "info.name_fi", item.val),
            name_se: get(fCountry, "info.name_se", item.val)
          };
        });

        res.json({
          vizData: result,
          label: "activities",
          count: sumBy(result, "value"),
          unallocablePercentage: ((unallocable * 100) / total).toFixed(2),
          totalDisbursement: total,
          projectCount: get(responses[2], "data.response.numFound", 0)
        });
      })
    )
    .catch(error => {
      genericError(error, res);
    });
}
