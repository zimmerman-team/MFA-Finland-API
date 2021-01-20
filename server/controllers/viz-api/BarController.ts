import axios from "axios";
import get from "lodash/get";
import sum from "lodash/sum";
import find from "lodash/find";
import uniq from "lodash/uniq";
import sumBy from "lodash/sumBy";
import filter from "lodash/filter";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";

export function budgetLineBarChart(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
    {
      q: `${getFormattedFilters(
        get(req.body, "filters", {})
      )} AND tag_vocabulary:99 AND tag_code:2*`,
      fl: "tag_code,budget_value,budget_value_date",
      rows: 10000
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
      const actualData = get(call1Response, "data.response.docs", []);
      const filteredData = filter(
        actualData,
        (doc: any) => doc.tag_code[0] === "2"
      );
      let years: string[] = [];
      filteredData.forEach((doc: any) => {
        if (doc.budget_value_date) {
          years = [
            ...years,
            ...doc.budget_value_date.map((item: any) => item.slice(0, 4))
          ];
        }
      });
      years = uniq(years);
      const yearsData = years.map((year: string) => {
        const data = filter(filteredData, (doc: any) => {
          if (doc.budget_value_date) {
            return find(
              doc.budget_value_date,
              (item: any) => item.slice(0, 4) === year
            );
          }
          return false;
        });
        let tags: string[] = [];
        data.forEach((doc: any) => {
          tags = [...tags, ...doc.tag_code];
        });
        tags = uniq(tags);
        tags = filter(tags, (tag: string) => tag[0] === "2");
        const tagsData = tags.map((tag: string) => {
          const tagData = filter(
            data,
            (doc: any) => doc.tag_code.indexOf(tag) > -1
          );
          let totalBudget = 0;
          tagData.forEach((doc: any) => {
            if (doc.budget_value) {
              totalBudget += sum(doc.budget_value);
            }
          });
          return {
            name: tag,
            code: tag,
            value: totalBudget
          };
        });
        return {
          year,
          value: sumBy(tagsData, "value"),
          children: tagsData
        };
      });
      res.json({
        count: yearsData.length,
        vizData: yearsData
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
