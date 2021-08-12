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
import produce from "immer";

// exclude sectors that don't have data
function getSectorsWithData(sectorData: any) {
  let draftState: any = [];
  [...sectorMapping.children].forEach((sector: any) => {
    if (find(sectorData, { val: sector.code })) {
      draftState.push(sector);
    } else if (sector.children) {
      sector.children.forEach((child: any) => {
        if (find(sectorData, { val: child.code })) {
          draftState.push(sector);
        } else if (child.children) {
          child.children.forEach((gchild: any) => {
            if (find(sectorData, { val: gchild.code })) {
              draftState.push(sector);
            }
          });
        }
      });
    }
  });
  draftState = orderBy(uniqBy(draftState, "title"), "title");
  return draftState;
}

export function basicSunburstChart(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
    {
      q: normalizeActivity2TransactionFilters(
        getFormattedFilters(get(req.body, "filters", {}), true)
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
  console.log("sectorMapping", sectorMapping);
  console.log("url", url);
  axios
    .get(url)
    .then(call1Response => {
      const actualData = get(call1Response, "data.facets.items.buckets", []);
      let baseState = {
        title: "activities",
        color: "",
        children: getSectorsWithData(actualData)
      };

      const nextState = produce(baseState, draftState => {
        draftState.children.forEach((sector0: any, index0: number) => {
          const fItem0 = find(actualData, { val: sector0.code });
          if (sector0.hasOwnProperty("children")) {
            draftState.children[index0].size = get(
              fItem0,
              "disbursed.value",
              0
            );
            draftState.children[index0].committed = get(
              fItem0,
              "committed.value",
              0
            );
            draftState.children[index0].children.forEach(
              (sector1: any, index1: number) => {
                const fItem1 = find(actualData, { val: sector1.code });
                if (sector1.hasOwnProperty("children")) {
                  draftState.children[index0].children[index1].size = get(
                    fItem1,
                    "disbursed.value",
                    0
                  );
                  draftState.children[index0].children[index1].committed = get(
                    fItem1,
                    "committed.value",
                    0
                  );
                  draftState.children[index0].children[index1].children.forEach(
                    (sector2: any, index2: number) => {
                      const fItem2 = find(actualData, { val: sector2.code });
                      if (sector2.hasOwnProperty("children")) {
                        draftState.children[index0].children[index1].children[
                          index2
                        ].size = get(fItem2, "disbursed.value", 0);
                        draftState.children[index0].children[index1].children[
                          index2
                        ].committed = get(fItem2, "committed.value", 0);
                      } else {
                        if (fItem2) {
                          draftState.children[index0].children[index1].children[
                            index2
                          ].size = get(fItem2, "disbursed.value", 0);
                          draftState.children[index0].children[index1].children[
                            index2
                          ].committed = get(fItem2, "committed.value", 0);
                          draftState.children[index0].children[index1].children[
                            index2
                          ].percentage =
                            (draftState.children[index0].children[index1]
                              .children[index2].size /
                              draftState.children[index0].children[index1]
                                .children[index2].committed) *
                            100;
                        } else {
                          draftState.children[index0].children[index1].children[
                            index2
                          ].size = 0;
                        }
                      }
                    }
                  );
                  draftState.children[index0].children[index1].size =
                    sumBy(
                      draftState.children[index0].children[index1].children,
                      "size"
                    ) +
                    get(
                      draftState.children[index0].children[index1],
                      "size",
                      0
                    );
                  draftState.children[index0].children[index1].committed =
                    sumBy(
                      draftState.children[index0].children[index1].children,
                      "committed"
                    ) +
                    get(
                      draftState.children[index0].children[index1],
                      "committed",
                      0
                    );
                  draftState.children[index0].children[index1].percentage =
                    (draftState.children[index0].children[index1].size /
                      draftState.children[index0].children[index1].committed) *
                    100;
                } else {
                  if (fItem1) {
                    draftState.children[index0].children[index1].size = get(
                      fItem1,
                      "disbursed.value",
                      0
                    );
                    draftState.children[index0].children[
                      index1
                    ].committed = get(fItem1, "committed.value", 0);
                    draftState.children[index0].children[index1].percentage =
                      (draftState.children[index0].children[index1].size /
                        draftState.children[index0].children[index1]
                          .committed) *
                      100;
                  } else {
                    draftState.children[index0].children[index1].size = 0;
                  }
                }
              }
            );
            draftState.children[index0].size =
              sumBy(draftState.children[index0].children, "size") +
              get(draftState.children[index0], "size", 0);
            draftState.children[index0].committed =
              sumBy(draftState.children[index0].children, "committed") +
              get(draftState.children[index0], "committed", 0);
            draftState.children[index0].percentage =
              (draftState.children[index0].size /
                draftState.children[index0].committed) *
              100;
          } else {
            if (fItem0) {
              draftState.children[index0].size = get(
                fItem0,
                "disbursed.value",
                0
              );
              draftState.children[index0].committed = get(
                fItem0,
                "committed.value",
                0
              );
              draftState.children[index0].percentage =
                (draftState.children[index0].size /
                  draftState.children[index0].committed) *
                100;
            } else {
              draftState.children[index0].size = 0;
            }
          }
        });

        // sort children sectors based on size
        draftState.children.forEach((sector0: any, index0: number) => {
          if (sector0.hasOwnProperty("children")) {
            draftState.children[index0].children = orderBy(
              draftState.children[index0].children,
              "size",
              "desc"
            );
            draftState.children[index0].children.forEach(
              (sector1: any, index1: number) => {
                if (sector1.hasOwnProperty("children")) {
                  draftState.children[index0].children[
                    index1
                  ].children = orderBy(
                    draftState.children[index0].children[index1].children,
                    "size",
                    "desc"
                  );
                  draftState.children[index0].children[index1].children.forEach(
                    (sector2: any, index2: number) => {
                      if (sector2.hasOwnProperty("children")) {
                        draftState.children[index0].children[index1].children[
                          index2
                        ].children = orderBy(
                          draftState.children[index0].children[index1].children[
                            index2
                          ].children,
                          "size",
                          "desc"
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        });

        draftState.children.forEach((item: any, index: number) => {
          if (item.children) {
            draftState.children[index].children = filter(
              draftState.children[index].children,
              (item2: any) => item2.size > 0
            );
            draftState.children[index].children.forEach(
              (child: any, childIndex: number) => {
                if (child.children) {
                  draftState.children[index].children[
                    childIndex
                  ].children = filter(
                    draftState.children[index].children[childIndex].children,
                    (item3: any) => item3.size > 0
                  );
                }
              }
            );
          }
        });

        draftState.children = filter(
          draftState.children,
          (item: any) => item.children.length > 0
        );
      });
      // loop through sectorMapping array and fill in the size of each sector
      res.json({
        count: sumBy(nextState.children, "size"),
        vizData: nextState
      });
    })
    .catch(error => {
      console.log(error);
      genericError(error, res);
    });
}
