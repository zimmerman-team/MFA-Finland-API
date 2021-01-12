import axios from "axios";
import get from "lodash/get";
import { formatOrgOptions } from ".";
import querystring from "querystring";

export function getTransactionReceiverOrgOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const values = {
      q: filterString,
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: "transaction_receiver_org_ref",
          limit: -1
        }
      }),
      rows: 0
    };
    axios
      .get(
        `${process.env.DS_REST_API}/codelists/OrganisationIdentifier/?format=json`
      )
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
            resolve(formatOrgOptions(actualData, codelistData));
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
