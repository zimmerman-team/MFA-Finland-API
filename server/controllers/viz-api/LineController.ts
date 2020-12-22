import axios from "axios";
import get from "lodash/get";
import filter from "lodash/filter";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";

export function basicLineChart(req: any, res: any) {
  axios
    .get(
      `${process.env.DS_SOLR_API}/activity/?q=*:*&facet=on&facet.pivot=activity_date_start_actual&fl=facet_counts&rows=0`
    )
    .then(call1Response => {
      const activityYears = get(
        call1Response,
        "data.facet_counts.facet_pivot.activity_date_start_actual",
        []
      );
      let yearFacetsObj = {};
      activityYears.forEach((yearObj: any) => {
        const splits = yearObj.value.split("-");
        const yearValue = splits[0];
        yearFacetsObj = {
          ...yearFacetsObj,
          [yearValue]: {
            type: "query",
            q: `activity_date_start_actual_f:[${yearValue}-01-01T00:00:00Z TO ${yearValue}-12-31T23:59:59Z] OR activity_date_start_planned_f:[${yearValue}-01-01T00:00:00Z TO ${yearValue}-12-31T23:59:59Z]`
          }
        };
      });

      //TODO: Applying a date filter is giving unexpected data for this call, I was unable to fix this.
      //TODO: Created a ticket for this specific issue
      const values = {
        q: getFormattedFilters(get(req.body, "filters", {})),
        "json.facet": JSON.stringify(yearFacetsObj),
        rows: 0
      };

      axios
        .get(
          `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
            values,
            "&",
            "=",
            {
              encodeURIComponent: (str: string) => str
            }
          )}`
        )
        .then(call2Response => {
          const actualData = get(call2Response, "data.facets", {});
          const result = filter(
            Object.keys(actualData),
            (fkey: any) => actualData[fkey].count
          ).map((key: any) => {
            return {
              x: key,
              y: actualData[key].count
            };
          });

          res.json({
            count: get(call2Response, "data.response.numFound", 0),
            vizData: {
              id: "activities",
              color: "#2e4063",
              data: result
            }
          });
        })
        .catch(error => {
          genericError(error, res);
        });
    })
    .catch(error => {
      genericError(error, res);
    });
}
