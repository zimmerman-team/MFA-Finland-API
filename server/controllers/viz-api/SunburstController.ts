import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import sumBy from "lodash/sumBy";
import uniqBy from "lodash/uniqBy";
import filter from "lodash/filter";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { genericError } from "../../utils/general";
import {
  getFormattedFilters,
  normalizeActivity2TransactionFilters
} from "../../utils/filters";
import { sectorMapping } from "../../static/sectorMapping";
import produce from "immer";

// exclude sectors that don't have data
function getSectorsWithData(sectorData: any) {
  let result: any = [];
  [...sectorMapping.children].forEach((sector: any) => {
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
      q: `${normalizeActivity2TransactionFilters(
        getFormattedFilters(get(req.body, "filters", {}), true)
      )} AND transaction_type:(2 3)`,
      fl:
        "activity_sector_code,activity_sector_percentage,transaction_type,transaction_value",
      rows: 50000
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
      const rawData = get(call1Response, "data.response.docs", []);
      const rawSectors: any = [];

      rawData.forEach((doc: any) => {
        get(doc, "activity_sector_code", []).forEach(
          (sector: string, index: number) => {
            const fSectorIndex = findIndex(rawSectors, { val: sector });
            const percentage = get(doc, `sector_percentage[${index}]`, 100);
            const data = {
              val: sector,
              committed: { value: 0 },
              disbursed: { value: 0 }
            };
            if (doc.transaction_type === "2") {
              if (fSectorIndex > -1) {
                rawSectors[fSectorIndex].committed.value +=
                  (doc.transaction_value * percentage) / 100;
              } else {
                data.committed.value =
                  (doc.transaction_value * percentage) / 100;
              }
            } else if (doc.transaction_type === "3") {
              if (fSectorIndex > -1) {
                rawSectors[fSectorIndex].disbursed.value +=
                  (doc.transaction_value * percentage) / 100;
              } else {
                data.disbursed.value =
                  (doc.transaction_value * percentage) / 100;
              }
            }
            if (fSectorIndex === -1) {
              rawSectors.push(data);
            }
          }
        );
      });

      let baseData = {
        title: "activities",
        color: "",
        children: getSectorsWithData(rawSectors)
      };

      const nextData = produce(baseData, draftData => {
        // loop through sectorMapping array and fill in the size of each sector
        draftData.children.forEach((sector0: any, index0: number) => {
          const fItem0 = find(rawSectors, { val: sector0.code });
          if (sector0.hasOwnProperty("children")) {
            draftData.children[index0].size = get(fItem0, "disbursed.value", 0);
            draftData.children[index0].committed = get(
              fItem0,
              "committed.value",
              0
            );
            draftData.children[index0].children.forEach(
              (sector1: any, index1: number) => {
                const fItem1 = find(rawSectors, { val: sector1.code });
                if (sector1.hasOwnProperty("children")) {
                  draftData.children[index0].children[index1].size = get(
                    fItem1,
                    "disbursed.value",
                    0
                  );
                  draftData.children[index0].children[index1].committed = get(
                    fItem1,
                    "committed.value",
                    0
                  );
                  draftData.children[index0].children[index1].children.forEach(
                    (sector2: any, index2: number) => {
                      const fItem2 = find(rawSectors, { val: sector2.code });
                      if (sector2.hasOwnProperty("children")) {
                        draftData.children[index0].children[index1].children[
                          index2
                        ].size = get(fItem2, "disbursed.value", 0);
                        draftData.children[index0].children[index1].children[
                          index2
                        ].committed = get(fItem2, "committed.value", 0);
                      } else {
                        if (fItem2) {
                          draftData.children[index0].children[index1].children[
                            index2
                          ].size = get(fItem2, "disbursed.value", 0);
                          draftData.children[index0].children[index1].children[
                            index2
                          ].committed = get(fItem2, "committed.value", 0);
                          draftData.children[index0].children[index1].children[
                            index2
                          ].percentage =
                            (draftData.children[index0].children[index1]
                              .children[index2].size /
                              draftData.children[index0].children[index1]
                                .children[index2].committed) *
                            100;
                        } else {
                          draftData.children[index0].children[index1].children[
                            index2
                          ].size = 0;
                        }
                      }
                    }
                  );
                  draftData.children[index0].children[index1].size =
                    sumBy(
                      draftData.children[index0].children[index1].children,
                      "size"
                    ) +
                    get(draftData.children[index0].children[index1], "size", 0);
                  draftData.children[index0].children[index1].committed =
                    sumBy(
                      draftData.children[index0].children[index1].children,
                      "committed"
                    ) +
                    get(
                      draftData.children[index0].children[index1],
                      "committed",
                      0
                    );
                  draftData.children[index0].children[index1].percentage =
                    (draftData.children[index0].children[index1].size /
                      draftData.children[index0].children[index1].committed) *
                    100;
                } else {
                  if (fItem1) {
                    draftData.children[index0].children[index1].size = get(
                      fItem1,
                      "disbursed.value",
                      0
                    );
                    draftData.children[index0].children[index1].committed = get(
                      fItem1,
                      "committed.value",
                      0
                    );
                    draftData.children[index0].children[index1].percentage =
                      (draftData.children[index0].children[index1].size /
                        draftData.children[index0].children[index1].committed) *
                      100;
                  } else {
                    draftData.children[index0].children[index1].size = 0;
                  }
                }
              }
            );
            draftData.children[index0].size =
              sumBy(draftData.children[index0].children, "size") +
              get(draftData.children[index0], "size", 0);
            draftData.children[index0].committed =
              sumBy(draftData.children[index0].children, "committed") +
              get(draftData.children[index0], "committed", 0);
            draftData.children[index0].percentage =
              (draftData.children[index0].size /
                draftData.children[index0].committed) *
              100;
          } else {
            if (fItem0) {
              draftData.children[index0].size = get(
                fItem0,
                "disbursed.value",
                0
              );
              draftData.children[index0].committed = get(
                fItem0,
                "committed.value",
                0
              );
              draftData.children[index0].percentage =
                (draftData.children[index0].size /
                  draftData.children[index0].committed) *
                100;
            } else {
              draftData.children[index0].size = 0;
            }
          }
        });

        // sort children sectors based on size
        draftData.children.forEach((sector0: any, index0: number) => {
          if (sector0.hasOwnProperty("children")) {
            draftData.children[index0].children = orderBy(
              draftData.children[index0].children,
              "size",
              "desc"
            );
            draftData.children[index0].children.forEach(
              (sector1: any, index1: number) => {
                if (sector1.hasOwnProperty("children")) {
                  draftData.children[index0].children[
                    index1
                  ].children = orderBy(
                    draftData.children[index0].children[index1].children,
                    "size",
                    "desc"
                  );
                  draftData.children[index0].children[index1].children.forEach(
                    (sector2: any, index2: number) => {
                      if (sector2.hasOwnProperty("children")) {
                        draftData.children[index0].children[index1].children[
                          index2
                        ].children = orderBy(
                          draftData.children[index0].children[index1].children[
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

        draftData.children.forEach((item: any, index: number) => {
          if (item.children) {
            draftData.children[index].children = filter(
              draftData.children[index].children,
              (item2: any) => item2.size > 0
            );
            draftData.children[index].children.forEach(
              (child: any, childIndex: number) => {
                if (child.children) {
                  draftData.children[index].children[
                    childIndex
                  ].children = filter(
                    draftData.children[index].children[childIndex].children,
                    (item3: any) => item3.size > 0
                  );
                }
              }
            );
          }
        });

        draftData.children = filter(
          draftData.children,
          (item: any) => item.children.length > 0
        );
      });

      res.json({
        count: sumBy(nextData.children, "size"),
        vizData: nextData
      });
    })
    .catch(error => {
      console.log(error);
      genericError(error, res);
    });
}
