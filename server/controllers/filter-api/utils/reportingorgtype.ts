import axios from "axios";
import get from "lodash/get";
import { formatOrgOptions } from ".";
import querystring from "querystring";
import { AF_REPORTING_ORG_TYPE_CODE } from "../../../static/apiFilterFields";
import { organisationTypeCodelist } from "./codelists";

export function getReportingOrgTypeOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const values = {
      q: filterString,
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: AF_REPORTING_ORG_TYPE_CODE,
          limit: -1
        }
      }),
      rows: 0
    };
    const codelistData = organisationTypeCodelist;
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
        resolve(formatOrgOptions(actualData, codelistData));
      })
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
