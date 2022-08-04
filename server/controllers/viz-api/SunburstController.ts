import axios from "axios";
import produce from "immer";
import get from "lodash/get";
import find from "lodash/find";
import sumBy from "lodash/sumBy";
import uniqBy from "lodash/uniqBy";
import filter from "lodash/filter";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { genericError } from "../../utils/general";
import { sectorMapping } from "../../static/sectorMapping";
import { sectorTranslations } from "../../static/sectorTranslations";
import {
  getFormattedFilters,
  normalizeActivity2TransactionFilters
} from "../../utils/filters";
import {
  AF_SECTOR,
  AF_SECTOR_PERCENTAGE,
  AF_TRANSACTION_TYPE_CODE,
  AF_TRANSACTION_UNDERSCORED
} from "../../static/apiFilterFields";

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
  result = result.map((category: any) => {
    const fSector = find(sectorTranslations, {
      code: parseInt(category.code, 10)
    });
    return {
      ...category,
      title: get(fSector, "info.name", category.title),
      title_fi: get(fSector, "info.name_fi", category.title),
      title_se: get(fSector, "info.name_se", category.title),
      children: category.children.map((dac3: any) => {
        const fDac3Sector = find(sectorTranslations, {
          code: parseInt(dac3.code, 10)
        });
        return {
          ...dac3,
          title: get(fDac3Sector, "info.name", dac3.title),
          title_fi: get(fDac3Sector, "info.name_fi", dac3.title),
          title_se: get(fDac3Sector, "info.name_se", dac3.title),
          children: dac3.children.map((dac5: any) => {
            const fDac5Sector = find(sectorTranslations, {
              code: parseInt(dac5.code, 10)
            });
            return {
              ...dac5,
              title: get(fDac5Sector, "info.name", dac5.title),
              title_fi: get(fDac5Sector, "info.name_fi", dac5.title),
              title_se: get(fDac5Sector, "info.name_se", dac5.title)
            };
          })
        };
      })
    };
  });
  return result;
}

export function basicSunburstChart(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
    {
      q: `${normalizeActivity2TransactionFilters(
        getFormattedFilters(get(req.body, "filters", {}), true)
      )} AND ${AF_TRANSACTION_TYPE_CODE}:(2 3)`,
      fl: `${AF_SECTOR},${AF_SECTOR_PERCENTAGE},${AF_TRANSACTION_TYPE_CODE},${AF_TRANSACTION_UNDERSCORED}`,
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
        get(doc, AF_SECTOR, []).forEach((sector: string, index: number) => {
          const fSectorIndex = findIndex(rawSectors, { val: sector });
          const percentage = get(doc, `${AF_SECTOR_PERCENTAGE}[${index}]`, 100);
          const data = {
            val: sector,
            committed: { value: 0 },
            disbursed: { value: 0 }
          };
          if (doc[AF_TRANSACTION_TYPE_CODE][0] === "2") {
            if (fSectorIndex > -1) {
              rawSectors[fSectorIndex].committed.value +=
                (doc[AF_TRANSACTION_UNDERSCORED] * percentage) / 100;
            } else {
              data.committed.value =
                (doc[AF_TRANSACTION_UNDERSCORED] * percentage) / 100;
            }
          } else if (doc[AF_TRANSACTION_TYPE_CODE][0] === "3") {
            if (fSectorIndex > -1) {
              rawSectors[fSectorIndex].disbursed.value +=
                (doc[AF_TRANSACTION_UNDERSCORED] * percentage) / 100;
            } else {
              data.disbursed.value =
                (doc[AF_TRANSACTION_UNDERSCORED] * percentage) / 100;
            }
          }
          if (fSectorIndex === -1) {
            rawSectors.push(data);
          }
        });
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
                      filter(
                        draftData.children[index0].children[index1].children,
                        (c: any) => !Number.isNaN(c.size)
                      ),
                      "size"
                    ) +
                    get(draftData.children[index0].children[index1], "size", 0);
                  draftData.children[index0].children[index1].committed =
                    sumBy(
                      filter(
                        draftData.children[index0].children[index1].children,
                        (c: any) => !Number.isNaN(c.committed)
                      ),
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
              sumBy(
                filter(
                  draftData.children[index0].children,
                  (c: any) => !Number.isNaN(c.size)
                ),
                "size"
              ) + get(draftData.children[index0], "size", 0);
            draftData.children[index0].committed =
              sumBy(
                filter(
                  draftData.children[index0].children,
                  (c: any) => !Number.isNaN(c.committed)
                ),
                "committed"
              ) + get(draftData.children[index0], "committed", 0);
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
              "code",
              "asc"
            );
            draftData.children[index0].children.forEach(
              (sector1: any, index1: number) => {
                if (sector1.hasOwnProperty("children")) {
                  draftData.children[index0].children[
                    index1
                  ].children = orderBy(
                    draftData.children[index0].children[index1].children,
                    "code",
                    "asc"
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
                          "code",
                          "asc"
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

        draftData.children = orderBy(draftData.children, "title", "asc");
      });

      res.json({
        count: sumBy(nextData.children, "size"),
        vizData: nextData
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
