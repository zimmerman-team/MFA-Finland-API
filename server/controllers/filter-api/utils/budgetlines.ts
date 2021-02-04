import axios from "axios";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { budgetLineCodes2Values } from "../../../static/budgetLineConsts";

export function getBudgetLinesOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
      {
        q: `${filterString} AND tag_code:243066*`,
        fl: "tag_code",
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
        const result: any = [];
        actualData.forEach((activity: any) => {
          activity.tag_code.forEach((tc: string) => {
            const budgetLine = get(budgetLineCodes2Values, tc, null);
            if (budgetLine) {
              const fItemIndex = findIndex(result, { name: budgetLine });
              if (fItemIndex === -1) {
                result.push({
                  name: budgetLine,
                  code: tc
                });
              }
            }
          });
        });
        resolve({
          count: result.length,
          data: orderBy(result, "name", "asc")
        });
      })
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
