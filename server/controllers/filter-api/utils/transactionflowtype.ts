import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { formatActivituStatusOptions } from ".";
import { AF_TRANSACTION_FLOW_TYPE_CODE } from "../../../static/apiFilterFields";
import { flowTypeCodelist } from "./codelists";

export function getTransactionFlowTypeOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const values = {
      q: filterString,
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: AF_TRANSACTION_FLOW_TYPE_CODE,
          limit: -1
        }
      }),
      rows: 0
    };
    const codelistData = flowTypeCodelist;
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
        resolve(formatActivituStatusOptions(actualData, codelistData));
      })
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
