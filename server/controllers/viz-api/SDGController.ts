import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import filter from "lodash/filter";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { GOALS } from "../../static/sdgs";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";

export function SDGViz(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
    {
      q: `${getFormattedFilters(
        get(req.body, "filters", {})
      )} AND tag_vocabulary:2 AND (transaction_type:2 OR transaction_type:3)`,
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
    .then(callResponse => {
      const activities = get(callResponse, "data.response.docs", []);
      const goals: any = [...GOALS];

      goals.forEach((goal: any, index: number) => {
        const goalActivities = filter(activities, (act: any) =>
          find(act.tag_code, (c: string) => c === goal.code)
        );

        let disbursed = 0;
        let committed = 0;

        goalActivities.forEach((item: any) => {
          if (item.transaction_type && item.transaction_value) {
            const disbTransIndex = findIndex(
              item.transaction_type,
              (tt: string) => tt === "3"
            );
            const comTransIndex = findIndex(
              item.transaction_type,
              (tt: string) => tt === "2"
            );
            if (disbTransIndex > -1) {
              disbursed += get(item, `transaction_value[${disbTransIndex}]`, 0);
            }
            if (comTransIndex > -1) {
              committed += get(item, `transaction_value[${comTransIndex}]`, 0);
            }
          }
        });
        goals[index] = {
          committed,
          disbursed,
          name: goal.name,
          icon: `/sdgs/${goal.code}.png`,
          number: parseInt(goal.code, 10),
          disabled: disbursed === 0 || committed === 0
        };
      });

      res.json(goals);
    })
    .catch(error => {
      genericError(error, res);
    });
}
