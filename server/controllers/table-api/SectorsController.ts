import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import sumBy from "lodash/sumBy";
import uniqBy from "lodash/uniqBy";
import filter from "lodash/filter";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";
import { sectorMapping } from "../../static/sectorMapping";
import { AF_SECTOR, AF_SECTOR_NARRATIVE } from "../../static/apiFilterFields";

// exclude sectors that don't have data
export function getSectorsWithData(sectorData: any) {
  let result: any = [];
  sectorMapping.children.forEach((sector: any) => {
    if (find(sectorData, { val: sector.code })) {
      result.push(sector);
    } else if (sector.children) {
      sector.children.forEach((child: any) => {
        if (find(sectorData, { val: child.code })) {
          result.push(sector);
        } else if (child.children) {
          child.children.forEach((gchild: any) => {
            if (find(sectorData, { val: gchild.code })) {
              result.push(sector);
            }
          });
        }
      });
    }
  });
  result = orderBy(uniqBy(result, "title"), "title");
  return result;
}

export function sectorsTable(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
    {
      q: getFormattedFilters(get(req.body, "filters", {})),
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: AF_SECTOR,
          limit: -1,
          missing: true,
          numBuckets: true,
          facet: {
            sub: {
              type: "terms",
              field: AF_SECTOR_NARRATIVE,
              limit: 1
            }
          }
        }
      }),
      rows: 0
    },
    "&",
    "=",
    {
      encodeURIComponent: (str: string) => str
    }
  )}`;
  axios
    .get(url)
    .then(call1Response => {
      const count = get(call1Response, "data.facets.items.numBuckets", 0);
      const actualData = get(call1Response, "data.facets.items.buckets", []);

      let result = getSectorsWithData(actualData);

      // loop through sectorMapping array and fill in the size of each sector
      function loopChildren(arr: any[]) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].hasOwnProperty("children")) {
            loopChildren(arr[i].children);
          } else {
            const fItem = find(actualData, { val: arr[i].code });
            if (fItem) {
              arr[i].size = fItem.count;
            } else {
              arr[i].size = 0;
            }
          }
        }
      }
      loopChildren(result);

      // calculate parent sectors size based on children
      function calcParentSize(arr: any[]) {
        for (let i = 0; i < arr.length; i++) {
          if (
            arr[i].hasOwnProperty("children") &&
            !arr[i].hasOwnProperty("size")
          ) {
            arr[i].size = sumBy(arr[i].children, "size");
            calcParentSize(arr[i].children);
          }
        }
      }
      calcParentSize(result);

      result = result.map((item: any) => ({
        ...item,
        size: item.children ? sumBy(item.children, "size") : item.size
      }));

      // sort children sectors based on size
      function sortChildren(arr: any[]) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].hasOwnProperty("children")) {
            arr[i].children = orderBy(arr[i].children, "size", "desc");
            loopChildren(arr[i].children);
          }
        }
      }
      sortChildren(result);

      result = filter(result, (item: any) => item.size > 0);

      result.forEach((item: any, index: number) => {
        if (item.children) {
          result[index].code = "";
          result[index].children = filter(
            result[index].children,
            (item2: any) => item2.size > 0
          );
          result[index].children.forEach((child: any, childIndex: number) => {
            if (child.children) {
              result[index].children[childIndex].children = filter(
                result[index].children[childIndex].children,
                (item3: any) => item3.size > 0
              );
            }
          });
        }
      });

      res.json({
        count,
        data: result
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
