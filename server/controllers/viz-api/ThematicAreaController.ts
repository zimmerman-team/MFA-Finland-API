import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { genericError } from "../../utils/general";
import { formatLocale } from "../../utils/formatLocale";
import { getFormattedFilters } from "../../utils/filters";
import { thematicAreaNames } from "../../static/thematicAreaConsts";

const sizes = [200, 180, 140, 100];

export function thematicAreasChart(req: any, res: any) {
  const filters = {
    ...get(req.body, "filters", {}),
    tag_vocabulary: ["99"]
  };
  const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
    {
      q: `${getFormattedFilters(
        filters
      )} AND tag_code:Priority* AND transaction_type:3`,
      fl: "tag_code,transaction_type,transaction_value",
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
        activity.tag_code.forEach((tc: string) => {
          if (tc.indexOf("Priority") > -1) {
            const fItemIndex = findIndex(items, { name: tc });
            const disbTransIndex = findIndex(
              activity.transaction_type,
              (tt: string) => tt === "3"
            );
            if (fItemIndex === -1) {
              items.push({
                name: tc,
                area: get(thematicAreaNames, tc, ""),
                value: get(activity, `transaction_value[${disbTransIndex}]`, 0)
              });
            } else {
              items[fItemIndex].value += get(
                activity,
                `transaction_value[${disbTransIndex}]`,
                0
              );
            }
          }
        });
      });
      const result: any = orderBy(
        [
          {
            ref: "Priority area 1, primary",
            name: "Thematic area A (Main priority)",
            color: "#AE4764",
            area: "Strengthening of the rights and status of women and girls",
            value: get(
              find(
                items,
                (item: any) => item.name === "Priority area 1, primary"
              ),
              "value",
              0
            ),
            secondary: {
              name: "Priority area 1, secondary",
              area: "Strengthening of the rights and status of women and girls",
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
            ref: "Priority area 2, primary",
            name: "Thematic area B (Main priority)",
            color: "#DA8E68",
            area:
              "Generating jobs, livelihood opportunities and well-being in a developing country",
            value: get(
              find(
                items,
                (item: any) => item.name === "Priority area 2, primary"
              ),
              "value",
              0
            ),
            secondary: {
              name: "Priority area 2, secondary",
              area:
                "Generating jobs, livelihood opportunities and well-being in a developing country",
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
            ref: "Priority area 3, primary",
            name: "Thematic area C (Main priority)",
            color: "#819DAB",
            area: "Improving democracy in societies",
            value: get(
              find(
                items,
                (item: any) => item.name === "Priority area 3, primary"
              ),
              "value",
              0
            ),
            secondary: {
              name: "Priority area 3, secondary",
              area: "Improving democracy in societies",
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
            ref: "Priority area 4, primary",
            name: "Thematic area D (Main priority)",
            color: "#425346",
            area: "Improving food security, access to water and sustainability",
            value: get(
              find(
                items,
                (item: any) => item.name === "Priority area 4, primary"
              ),
              "value",
              0
            ),
            secondary: {
              name: "Priority area 4, secondary",
              area:
                "Improving food security, access to water and sustainability",
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
        size: sizes[index],
        values: [
          "Main priority",
          formatLocale(parea.value),
          "Secondary priority"
        ]
      }));
      res.json({
        vizData: result
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
