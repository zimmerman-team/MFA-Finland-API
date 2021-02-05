import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import sumBy from "lodash/sumBy";
import uniqBy from "lodash/uniqBy";
import filter from "lodash/filter";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import {
  getFormattedFilters,
  normalizeActivity2TransactionFilters
} from "../../utils/filters";
import { sectorMapping } from "../../static/sectorMapping";

// exclude sectors that don't have data
function getSectorsWithData(sectorData: any) {
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

export function basicSunburstChart(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
    {
      q: normalizeActivity2TransactionFilters(
        getFormattedFilters(get(req.body, "filters", {}))
      ),
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: "activity_sector_code",
          limit: -1,
          facet: {
            disbursed: {
              type: "query",
              q: "transaction_type:3",
              facet: { value: "sum(transaction_value)" }
            },
            committed: {
              type: "query",
              q: "transaction_type:2",
              facet: { value: "sum(transaction_value)" }
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
      const actualData = get(call1Response, "data.facets.items.buckets", []);
      let result = {
        ...sectorMapping,
        children: getSectorsWithData(actualData)
      };

      // loop through sectorMapping array and fill in the size of each sector
      function loopChildren(arr: any[]) {
        for (let i = 0; i < arr.length; i++) {
          const fItem = find(actualData, { val: arr[i].code });
          if (arr[i].hasOwnProperty("children")) {
            arr[i].size = get(fItem, "disbursed.value", 0);
            arr[i].committed = get(fItem, "committed.value", 0);
            loopChildren(arr[i].children);
          } else {
            if (fItem) {
              arr[i].size = get(fItem, "disbursed.value", 0);
              arr[i].committed = get(fItem, "committed.value", 0);
              arr[i].percentage = (arr[i].size / arr[i].committed) * 100;
            } else {
              arr[i].size = 0;
            }
          }
        }
      }
      loopChildren(result.children);

      // calculate parent sectors size based on children
      function calcParentSize(arr: any[], recursive: boolean) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].hasOwnProperty("children")) {
            arr[i].size =
              sumBy(arr[i].children, "size") + get(arr[i], "size", 0);
            arr[i].committed =
              sumBy(arr[i].children, "committed") + get(arr[i], "committed", 0);
            arr[i].percentage = (arr[i].size / arr[i].committed) * 100;
            if (recursive) {
              calcParentSize(arr[i].children, true);
            }
          }
        }
      }
      calcParentSize(result.children, true);

      calcParentSize(result.children, false);

      // sort children sectors based on size
      function sortChildren(arr: any[]) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].hasOwnProperty("children")) {
            arr[i].children = orderBy(arr[i].children, "size", "desc");
            sortChildren(arr[i].children);
          }
        }
      }
      sortChildren(result.children);

      result.children.forEach((item: any, index: number) => {
        if (item.children) {
          result.children[index].children = filter(
            result.children[index].children,
            (item2: any) => item2.size > 0
          );
          result.children[index].children.forEach(
            (child: any, childIndex: number) => {
              if (child.children) {
                result.children[index].children[childIndex].children = filter(
                  result.children[index].children[childIndex].children,
                  (item3: any) => item3.size > 0
                );
              }
            }
          );
        }
      });

      result.children = filter(
        result.children,
        (item: any) => item.children.length > 0
      );

      res.json({
        count: sumBy(
          get(call1Response, "data.facets.items.buckets", []),
          "disbursed.value"
        ),
        vizData: result
      });
    })
    .catch(error => {
      // console.log(error);
      genericError(error, res);
    });
}
