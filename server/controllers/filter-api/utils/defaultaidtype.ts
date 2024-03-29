import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { formatAidTypeOptions } from ".";
import { tranlatedAidTypes } from "../../../static/codelists";
import { AF_DEFAULT_AID_TYPE_CODE } from "../../../static/apiFilterFields";

export function getDefaultAidTypeOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const values = {
      q: filterString,
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: AF_DEFAULT_AID_TYPE_CODE,
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
      .then(callResponse => {
        const actualData = get(callResponse, "data.facets.items.buckets", []);
        resolve(formatAidTypeOptions(actualData, tranlatedAidTypes));
      })
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
