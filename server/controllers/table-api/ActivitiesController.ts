import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import uniq from "lodash/uniq";
import querystring from "querystring";
import { sortKeys } from "../../static/sortKeys";
import { countries } from "../../static/countries";
import { genericError } from "../../utils/general";
import { formatDate } from "../../utils/formatDate";
import { getQuery } from "../../utils/filters";
import { activityStatusCodelist } from "../../static/activityStatusCodelist";
import { activitySearchFields } from "../../static/globalSearchFields";

export function activitiesTable(req: any, res: any) {
  const rows = get(req.body, "rows", 10);
  const start = get(req.body, "page", 0) * rows;
  const sort: string = get(
    sortKeys,
    `[${get(req.body, "sort", "Start date desc")}]`,
    ""
  );
  const filters: any = get(req.body, "filters", {});
  const search: string = get(req.body, "search", "");

  const values = {
    q: getQuery(filters, search, activitySearchFields),
    fl: `iati_identifier,activity_status_code,title,title_narrative_text,recipient_country_code,transaction_recipient_country_code,activity_date_start_actual,activity_date_end_actual,result_type`,
    start,
    rows,
    sort
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
    .then(call1Response => {
      const count = get(call1Response, "data.response.numFound", 0);
      const actualData = get(call1Response, "data.response.docs", []);
      const result = actualData.map((activity: any) => {
        const startDate = activity.activity_date_start_actual || "";
        const endDate = activity.activity_date_end_actual || "";
        const statusName = find(activityStatusCodelist, [
          "code",
          activity.activity_status_code
        ]);
        const code = get(activity, "iati_identifier", "");
        const title = get(activity, "title_narrative_text[0]", "-");
        const countriesData = uniq([
          ...get(activity, "recipient_country_code", []),
          ...get(activity, "transaction_recipient_country_code", [])
        ]);
        const countryNames =
          countriesData.length > 0
            ? countriesData.map(countryCode => {
                const country = find(countries, { code: countryCode });
                if (country) {
                  return country.name;
                }
                return "";
              })
            : [];
        const resultCount = activity.result_type
          ? activity.result_type.length
          : 0;
        return [
          formatDate(startDate),
          formatDate(endDate),
          statusName ? statusName.name : "no data",
          [code, title],
          countryNames,
          resultCount
        ];
      });
      res.json({
        count,
        data: result
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
