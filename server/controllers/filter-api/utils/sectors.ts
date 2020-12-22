import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import uniqBy from "lodash/uniqBy";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import { formatSectorOptions } from ".";
import { sectorMapping } from "../../../static/sectorMapping";
// import { getSectorsWithData } from "../../table-api/SectorsController";

function getSectorsWithData(sectorData: any) {
  let result: any = [];
  sectorMapping.children.forEach((sector: any) => {
    if (find(sectorData, { val: sector.code })) {
      result.push({
        name: sector.title,
        code: sector.code
      });
    }
    if (sector.children) {
      sector.children.forEach((child: any) => {
        if (find(sectorData, { val: child.code })) {
          result.push({
            name: child.title,
            code: child.code
          });
        }
        if (child.children) {
          child.children.forEach((gchild: any) => {
            if (find(sectorData, { val: gchild.code })) {
              result.push({
                name: gchild.title,
                code: gchild.code
              });
            }
          });
        }
      });
    }
  });
  result = orderBy(uniqBy(result, "name"), "name");
  return result;
}

export function getSectorsOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const values = {
      q: filterString,
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: "sector_code",
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
