import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { formatPublishersOptions } from ".";
import {
  AF_REPORTING_ORG_NARRATIVE,
  AF_REPORTING_ORG_REF
} from "../../../static/apiFilterFields";

export function getPublishersOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const values = {
      q: filterString,
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: AF_REPORTING_ORG_REF,
          limit: -1,
          facet: {
            sub: {
              type: "terms",
              field: AF_REPORTING_ORG_NARRATIVE,
              limit: 1
            }
          }
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
        const actualData = get(callResponse, "data.facets.items.buckets", []);
        resolve(formatPublishersOptions(actualData));
      })
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
