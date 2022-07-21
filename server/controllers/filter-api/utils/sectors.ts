import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { formatSectorOptions } from ".";
import { getSectorsWithData } from "../../table-api/SectorsController";
import { AF_SECTOR } from "../../../static/apiFilterFields";

export function getSectorsOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const values = {
      q: filterString,
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: AF_SECTOR,
          limit: -1
          // missing: true,
          // facet: {
          //   sub: {
          //     type: "terms",
          //     field: "sector_narrative_text",
          //     limit: 1,
          //   },
          // },
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
        const actualData = getSectorsWithData(
          get(callResponse, "data.facets.items.buckets", [])
        );
        resolve(formatSectorOptions(actualData));
      })
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
