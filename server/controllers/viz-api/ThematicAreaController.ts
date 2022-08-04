import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { genericError } from "../../utils/general";
import {
  getFormattedFilters,
  normalizeActivity2TransactionFilters
} from "../../utils/filters";
import { thematicAreaNames } from "../../static/thematicAreaConsts";
import {
  AF_TAG_CODE,
  AF_TAG_VOCABULARY,
  AF_BUDGET_VALUE,
  AF_BUDGET_VALUE_UNDERSCORED,
  AF_BUDGET_VALUE_DATE,
  AF_REPORTING_ORG_REF,
  AF_TRANSACTION_VALUE_DATE,
  AF_TRANSACTION_FLOW_TYPE_CODE,
  AF_TRANSACTION_TYPE_CODE,
  AF_TRANSACTION_UNDERSCORED,
  AF_DEFAULT_FLOW_TYPE_CODE,
  AF_TRANSACTION,
  AF_ORGANISATION_TOTAL_EXPENDITURE_VALUE_UNDERSCORED,
  AF_ORGANISATION_TOTAL_EXPENDITURE_PERIOD_START,
  AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_REF,
  AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE
} from "../../static/apiFilterFields";

const sizes = [120, 100, 80, 60];
export function thematicAreasChart(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
    {
      q: `${getFormattedFilters(
        get(req.body, "filters", {})
      )} AND ${AF_TAG_CODE}:Priority* AND ${AF_TRANSACTION_TYPE_CODE}:3 AND ${AF_TAG_VOCABULARY}:99`,
      fl: `${AF_TAG_CODE},${AF_TRANSACTION_TYPE_CODE},${AF_TRANSACTION_UNDERSCORED}`,
      rows: 20000
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
      const activities = get(call1Response, "data.response.docs", []);
      const items: any = [];
      activities.forEach((activity: any) => {
        activity[AF_TAG_CODE].forEach((tc: string) => {
          if (tc.indexOf("Priority") > -1) {
            const fItemIndex = findIndex(items, { name: tc });
            const disbTransIndex = findIndex(
              activity[AF_TRANSACTION_TYPE_CODE],
              (tt: string) => tt === "3"
            );
            if (fItemIndex === -1) {
              items.push({
                name: tc,
                area: get(thematicAreaNames, tc, ""),
                value: get(
                  activity,
                  `${AF_TRANSACTION_UNDERSCORED}[${disbTransIndex}]`,
                  0
                )
              });
            } else {
              items[fItemIndex].value += get(
                activity,
                `${AF_TRANSACTION_UNDERSCORED}[${disbTransIndex}]`,
                0
              );
            }
          }
        });
      });
      const result: any = orderBy(
        [
          {
            ref: "Priority area 1",
            name: "Thematic area A",
            color: "#D06448",
            area: "Strengthening the status and rights of women and girls",
            value:
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 1, primary"
                ),
                "value",
                0
              ) +
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 1, secondary"
                ),
                "value",
                0
              ),
            primary: {
              name: "Priority area 1, primary",
              area: "Strengthening the status and rights of women and girls",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 1, primary"
                ),
                "value",
                0
              )
            },
            secondary: {
              name: "Priority area 1, secondary",
              area: "Strengthening the status and rights of women and girls",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 1, secondary"
                ),
                "value",
                0
              )
            }
          },
          {
            ref: "Priority area 2",
            name: "Thematic area B",
            color: "#D98B2C",
            area:
              "Strengthening the economic base of developing countries and creating jobs",
            value:
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 2, primary"
                ),
                "value",
                0
              ) +
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 2, secondary"
                ),
                "value",
                0
              ),
            primary: {
              name: "Priority area 2, primary",
              area:
                "Strengthening the economic base of developing countries and creating jobs",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 2, primary"
                ),
                "value",
                0
              )
            },
            secondary: {
              name: "Priority area 2, secondary",
              area:
                "Strengthening the economic base of developing countries and creating jobs",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 2, secondary"
                ),
                "value",
                0
              )
            }
          },
          {
            ref: "Priority area 3",
            name: "Thematic area C",
            color: "#8C6E91",
            area: "Education, well-functioning societies and democracy",
            value:
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 3, primary"
                ),
                "value",
                0
              ) +
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 3, secondary"
                ),
                "value",
                0
              ),
            primary: {
              name: "Priority area 3, primary",
              area: "Education, well-functioning societies and democracy",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 3, primary"
                ),
                "value",
                0
              )
            },
            secondary: {
              name: "Priority area 3, secondary",
              area: "Education, well-functioning societies and democracy",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 3, secondary"
                ),
                "value",
                0
              )
            }
          },
          {
            ref: "Priority area 4",
            name: "Thematic area D",
            color: "#5F8070",
            area: "Climate change and natural resources",
            value:
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 4, primary"
                ),
                "value",
                0
              ) +
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 4, secondary"
                ),
                "value",
                0
              ),
            primary: {
              name: "Priority area 4, primary",
              area: "Climate change and natural resources",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 4, primary"
                ),
                "value",
                0
              )
            },
            secondary: {
              name: "Priority area 4, secondary",
              area: "Climate change and natural resources",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 4, secondary"
                ),
                "value",
                0
              )
            }
          }
        ],
        "value",
        "desc"
      ).map((parea: any, index: number) => ({
        ...parea,
        size: sizes[index]
      }));
      res.json({
        vizData: result
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}

export function thematicAreasChart2(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
    {
      q: `${normalizeActivity2TransactionFilters(
        getFormattedFilters(get(req.body, "filters", {}))
      )} AND ${AF_TAG_CODE}:Priority* AND ${AF_TRANSACTION_TYPE_CODE}:3 AND ${AF_TAG_VOCABULARY}:99`,
      fl: `${AF_TAG_CODE},${AF_TRANSACTION_TYPE_CODE},${AF_TRANSACTION_UNDERSCORED}`,
      rows: 20000
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
      const transactions = get(call1Response, "data.response.docs", []);
      const items: any = [];
      transactions.forEach((transaction: any) => {
        transaction[AF_TAG_CODE].forEach((tc: string) => {
          if (tc.indexOf("Priority") > -1) {
            const fItemIndex = findIndex(items, { name: tc });
            if (fItemIndex === -1) {
              items.push({
                name: tc,
                area: get(thematicAreaNames, tc, ""),
                value: get(transaction, `${AF_TRANSACTION_UNDERSCORED}`, 0)
              });
            } else {
              items[fItemIndex].value += get(
                transaction,
                `${AF_TRANSACTION_UNDERSCORED}`,
                0
              );
            }
          }
        });
      });
      const result: any = orderBy(
        [
          {
            ref: "Priority area 1",
            name: "Thematic area A",
            color: "#AE4764",
            area: "Strengthening the status and rights of women and girls",
            value:
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 1, primary"
                ),
                "value",
                0
              ) +
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 1, secondary"
                ),
                "value",
                0
              ),
            primary: {
              name: "Priority area 1, primary",
              area: "Strengthening the status and rights of women and girls",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 1, primary"
                ),
                "value",
                0
              )
            },
            secondary: {
              name: "Priority area 1, secondary",
              area: "Strengthening the status and rights of women and girls",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 1, secondary"
                ),
                "value",
                0
              )
            }
          },
          {
            ref: "Priority area 2",
            name: "Thematic area B",
            color: "#DA8E68",
            area:
              "Strengthening the economic base of developing countries and creating jobs",
            value:
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 2, primary"
                ),
                "value",
                0
              ) +
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 2, secondary"
                ),
                "value",
                0
              ),
            primary: {
              name: "Priority area 2, primary",
              area:
                "Strengthening the economic base of developing countries and creating jobs",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 2, primary"
                ),
                "value",
                0
              )
            },
            secondary: {
              name: "Priority area 2, secondary",
              area:
                "Strengthening the economic base of developing countries and creating jobs",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 2, secondary"
                ),
                "value",
                0
              )
            }
          },
          {
            ref: "Priority area 3",
            name: "Thematic area C",
            color: "#819DAB",
            area: "Education, well-functioning societies and democracy",
            value:
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 3, primary"
                ),
                "value",
                0
              ) +
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 3, secondary"
                ),
                "value",
                0
              ),
            primary: {
              name: "Priority area 3, primary",
              area: "Education, well-functioning societies and democracy",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 3, primary"
                ),
                "value",
                0
              )
            },
            secondary: {
              name: "Priority area 3, secondary",
              area: "Education, well-functioning societies and democracy",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 3, secondary"
                ),
                "value",
                0
              )
            }
          },
          {
            ref: "Priority area 4",
            name: "Thematic area D",
            color: "#425346",
            area: "Climate change and natural resources",
            value:
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 4, primary"
                ),
                "value",
                0
              ) +
              get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 4, secondary"
                ),
                "value",
                0
              ),
            primary: {
              name: "Priority area 4, primary",
              area: "Climate change and natural resources",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 4, primary"
                ),
                "value",
                0
              )
            },
            secondary: {
              name: "Priority area 4, secondary",
              area: "Climate change and natural resources",
              value: get(
                find(
                  items,
                  (item: any) => item.name === "Priority area 4, secondary"
                ),
                "value",
                0
              )
            }
          }
        ],
        "value",
        "desc"
      ).map((parea: any, index: number) => ({
        ...parea,
        size: sizes[index]
      }));
      res.json({
        vizData: result
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
