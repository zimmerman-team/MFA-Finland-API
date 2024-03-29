import axios from "axios";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import { AF_HIERARCHY } from "../../../static/apiFilterFields";

export function getHierarchyOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const values = {
      q: filterString,
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: AF_HIERARCHY,
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
        // TODO: This field does not have the name from the codelist, and therefore displays "1", "2" etc.
        resolve(
          orderBy(
            actualData.map((item: any) => ({
              name: item.val,
              code: item.val
            })),
            "name",
            "asc"
          )
        );
      })
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
