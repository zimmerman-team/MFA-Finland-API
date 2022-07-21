import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { GOALS, TARGETS } from "../../../static/sdgs";
import {
  AF_TAG_CODE,
  AF_TAG_VOCABULARY
} from "../../../static/apiFilterFields";

export function getSDGOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
      {
        q: `${filterString} AND (${AF_TAG_VOCABULARY}:2 OR ${AF_TAG_VOCABULARY}:3)`,
        fl: `${AF_TAG_CODE},${AF_TAG_VOCABULARY}`,
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
          activity[AF_TAG_VOCABULARY].forEach((tv: string, index: number) => {
            if (tv === "2") {
              if (activity[AF_TAG_CODE][index]) {
                const fItemIndex = findIndex(goals, {
                  code: activity[AF_TAG_CODE][index]
                });
                if (fItemIndex === -1 && activity[AF_TAG_CODE][index] !== "0") {
                  goals.push({
                    name: get(
                      find(GOALS, { code: activity[AF_TAG_CODE][index] }),
                      "name",
                      activity[AF_TAG_CODE][index]
                    ),
                    code: activity[AF_TAG_CODE][index]
                  });
                }
              }
            } else if (tv === "3") {
              if (activity[AF_TAG_CODE][index]) {
                const fItemIndex = findIndex(targets, {
                  code: activity[AF_TAG_CODE][index]
                });
                if (fItemIndex === -1) {
                  targets.push({
                    name: get(
                      find(TARGETS, { code: activity[AF_TAG_CODE][index] }),
                      "name",
                      activity[AF_TAG_CODE][index]
                    ),
                    code: activity[AF_TAG_CODE][index]
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
