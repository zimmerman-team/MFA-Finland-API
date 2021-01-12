import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { formatActivituStatusOptions } from ".";

export function getCurrencyOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const values = {
      q: filterString,
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: "default_currency",
          limit: -1
        }
      }),
      rows: 0
    };
    axios
      .get(`${process.env.DS_REST_API}/codelists/Currency/?format=json`)
      .then(codelistResponse => {
        const codelistData = get(codelistResponse, "data", []);
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
            const actualData = get(
              callResponse,
              "data.facets.items.buckets",
              []
            );
            resolve(formatActivituStatusOptions(actualData, codelistData));
          })
          .catch(error => {
            const _error = error.response ? error.response.data : error;
            console.error(_error);
            resolve([]);
          });
      })
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
