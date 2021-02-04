import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { GOALS, TARGETS } from "../../../static/sdgs";

export function getSDGOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
      {
        q: `${filterString} AND (tag_vocabulary:2 OR tag_vocabulary:3)`,
        fl: "tag_code,tag_vocabulary",
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
        const actualData = get(callResponse, "data.response.docs", []);
        const goals: any = [];
        const targets: any = [];
        actualData.forEach((activity: any) => {
          activity.tag_vocabulary.forEach((tv: string, index: number) => {
            if (tv === "2") {
              if (activity.tag_code[index]) {
                const fItemIndex = findIndex(goals, {
                  code: activity.tag_code[index]
                });
                if (fItemIndex === -1) {
                  goals.push({
                    name: get(
                      find(GOALS, { code: activity.tag_code[index] }),
                      "name",
                      activity.tag_code[index]
                    ),
                    code: activity.tag_code[index]
                  });
                }
              }
            } else if (tv === "3") {
              if (activity.tag_code[index]) {
                const fItemIndex = findIndex(targets, {
                  code: activity.tag_code[index]
                });
                if (fItemIndex === -1) {
                  targets.push({
                    name: get(
                      find(TARGETS, { code: activity.tag_code[index] }),
                      "name",
                      activity.tag_code[index]
                    ),
                    code: activity.tag_code[index]
                  });
                }
              }
            }
          });
        });
        resolve({
          goals: orderBy(goals, (g: any) => parseInt(g.code, 10), "asc"),
          targets: orderBy(targets, "name", "asc")
        });
      })
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
