// @ts-nocheck
import axios from "axios";
import get from "lodash/get";
import sum from "lodash/sum";
import find from "lodash/find";
import uniq from "lodash/uniq";
import sumBy from "lodash/sumBy";
import filter from "lodash/filter";
import orderBy from "lodash/orderBy";
import groupBy from "lodash/groupBy";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";
import { budgetLineCodes2Values, colors } from "../../static/budgetLineConsts";

export function budgetLineBarChart1(req: any, res: any) {
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

export function ODAbarChart1(req: any, res: any) {
  axios
    .get(
      `${process.env.DS_SOLR_API}/activity/?q=reporting_org_ref:FI-3&facet=on&facet.pivot=activity_date_start_actual&fl=facet_counts&rows=0`
    )
    .then(call1Response => {
      const activityYears = uniq(
        get(
          call1Response,
          "data.facet_counts.facet_pivot.activity_date_start_actual",
          []
        ).map((item: any) => item.value.split("-")[0])
      );

      let yearFacetsObj = {};

      activityYears.forEach((yearValue: any) => {
        yearFacetsObj = {
          ...yearFacetsObj,
          [`${yearValue}_total`]: {
            type: "query",
            q: `transaction_value_date:[${yearValue}-01-01T00:00:00Z TO ${yearValue}-12-31T23:59:59Z] AND (transaction_flow_type_code:10 OR default_flow_type_code:10) AND transaction_type:3`,
            facet: {
              value: "sum(transaction_value)"
            }
          },
          [`${yearValue}_exclusive`]: {
            type: "query",
            q: `transaction_value_date:[${yearValue}-01-01T00:00:00Z TO ${yearValue}-12-31T23:59:59Z] AND tag_vocabulary:99 AND tag_code:243066* AND transaction_type:3`,
            facet: {
              value: "sum(transaction_value)"
            }
          }
        };
      });

      const values = {
        q: getFormattedFilters(get(req.body, "filters", {})),
        "json.facet": JSON.stringify(yearFacetsObj),
        rows: 0
      };

      axios
        .get(
          `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
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

          const result: any = [];

          activityYears.forEach((year: any) => {
            const total = get(actualData, `${year}_total.value`, 0);
            const exclusive = get(actualData, `${year}_exclusive.value`, 0);
            const other = total - exclusive;

            if (total > 0) {
              result.push({
                year: parseInt(year, 10),
                exclusive,
                other,
                exclusiveColor: "#ACD1D1",
                otherColor: "#7491CE",
                gni: 0,
                gniColor: "#AE4764"
              });
            }
          });

          res.json({
            count: get(call2Response, "data.response.numFound", 0),
            vizData: orderBy(result, "year", "asc")
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

export function budgetLineBarChart2(req: any, res: any) {
  axios
    .get(
      `${process.env.DS_SOLR_API}/activity/?q=reporting_org_ref:FI-3&facet=on&facet.pivot=activity_date_start_actual&fl=facet_counts&rows=0`
    )
    .then(call1Response => {
      const activityYears = uniq(
        get(
          call1Response,
          "data.facet_counts.facet_pivot.activity_date_start_actual",
          []
        ).map((item: any) => item.value.split("-")[0])
      );

      let yearFacetsObj = {};

      activityYears.forEach((yearValue: any) => {
        yearFacetsObj = {
          ...yearFacetsObj,
          [`${yearValue}`]: {
            type: "query",
            q: `transaction_value_date:[${yearValue}-01-01T00:00:00Z TO ${yearValue}-12-31T23:59:59Z] AND tag_vocabulary:99 AND tag_code:243066* AND transaction_type:3`,
            facet: {
              lines: {
                type: "terms",
                field: "tag_code",
                limit: -1,
                facet: { value: "sum(transaction_value)" }
              }
            }
          }
        };
      });

      const values = {
        q: getFormattedFilters(get(req.body, "filters", {})),
        "json.facet": JSON.stringify(yearFacetsObj),
        rows: 0
      };

      axios
        .get(
          `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
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

          const result: any = [];

          activityYears.forEach((year: any) => {
            const tags = get(actualData, `${year}.lines.buckets`, []);

            if (tags.length > 0) {
              let item = {
                year: parseInt(year, 10)
              };
              tags.forEach((tag: any) => {
                const linename = get(budgetLineCodes2Values, tag.val, null);
                if (linename) {
                  item = {
                    ...item,
                    [linename]: tag.value,
                    [`${linename}Color`]: get(colors, tag.val, "")
                  };
                }
              });
              result.push(item);
            }
          });

          res.json({
            count: get(call2Response, "data.response.numFound", 0),
            vizData: result
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

export function ODAbarChart(req: any, res: any) {
  const totalURL = `${
    process.env.DS_SOLR_API
  }/activity/?${querystring.stringify(
    {
      q: `${getFormattedFilters(
        get(req.body, "filters", {})
      )} AND (transaction_flow_type_code:10 OR default_flow_type_code:10) AND transaction_type:3`,
      fl: "transaction_type,transaction_value,activity_date_start_actual",
      rows: 15000
    },
    "&",
    "=",
    {
      encodeURIComponent: (str: string) => str
    }
  )}`;

  const exclusiveURL = `${
    process.env.DS_SOLR_API
  }/activity/?${querystring.stringify(
    {
      q: `${getFormattedFilters(
        get(req.body, "filters", {})
      )} AND tag_vocabulary:99 AND tag_code:243066* AND transaction_type:3`,
      fl: "transaction_type,transaction_value,activity_date_start_actual",
      rows: 15000
    },
    "&",
    "=",
    {
      encodeURIComponent: (str: string) => str
    }
  )}`;

  axios
    .all([axios.get(totalURL), axios.get(exclusiveURL)])
    .then(
      axios.spread((...responses) => {
        let totalRes = get(responses[0], "data.response.docs", []);
        let exclusiveRes = get(responses[1], "data.response.docs", []);

        totalRes = totalRes.map((item: any) => {
          const valueIndex = findIndex(
            item.transaction_type,
            (t: string) => t === "3"
          );
          const value = get(item, `transaction_value[${valueIndex}]`, 0);
          return {
            value,
            year: item.activity_date_start_actual.slice(0, 4)
          };
        });

        exclusiveRes = exclusiveRes.map((item: any) => {
          const valueIndex = findIndex(
            item.transaction_type,
            (t: string) => t === "3"
          );
          const value = get(item, `transaction_value[${valueIndex}]`, 0);
          return {
            value,
            year: item.activity_date_start_actual.slice(0, 4)
          };
        });

        const groupedTotal = groupBy(totalRes, "year");
        const groupedExclusive = groupBy(exclusiveRes, "year");

        const years = uniq([
          ...Object.keys(groupedTotal),
          ...Object.keys(groupedExclusive)
        ]);

        const result = years.map((year: string) => {
          const total = sumBy(get(groupedTotal, year, []), "value");
          const exclusive = sumBy(get(groupedExclusive, year, []), "value");
          if (parseInt(year, 10) < 2015) {
            return {
              year: parseInt(year, 10),
              exclusive: 0,
              exclusiveColor: "#ACD1D1",
              other: 0,
              otherColor: "#7491CE",
              gni: 0,
              gniColor: "#AE4764"
            };
          }
          return {
            year: parseInt(year, 10),
            exclusive,
            exclusiveColor: "#ACD1D1",
            other: total - exclusive,
            otherColor: "#7491CE",
            gni: 0,
            gniColor: "#AE4764"
          };
        });

        res.json({
          vizData: result
        });
      })
    )
    .catch(error => {
      genericError(error, res);
    });
}

export function budgetLineBarChart(req: any, res: any) {
  const exclusiveURL = `${
    process.env.DS_SOLR_API
  }/activity/?${querystring.stringify(
    {
      q: `${getFormattedFilters(
        get(req.body, "filters", {})
      )} AND tag_vocabulary:99 AND tag_code:243066* AND transaction_type:3`,
      fl:
        "transaction_type,transaction_value,activity_date_start_actual,tag_code",
      rows: 15000
    },
    "&",
    "=",
    {
      encodeURIComponent: (str: string) => str
    }
  )}`;

  axios
    .get(exclusiveURL)
    .then(response => {
      let exclusiveRes = get(response, "data.response.docs", []);

      exclusiveRes = exclusiveRes.map((item: any) => {
        const valueIndex = findIndex(
          item.transaction_type,
          (t: string) => t === "3"
        );
        const value = get(item, `transaction_value[${valueIndex}]`, 0);
        return {
          value,
          tags: get(item, "tag_code", []),
          year: item.activity_date_start_actual.slice(0, 4)
        };
      });

      const groupedExclusive = groupBy(exclusiveRes, "year");

      const years = uniq(Object.keys(groupedExclusive));

      let result = years.map((year: string) => {
        let yearObj = {
          year: parseInt(year, 10)
        };
        if (
          get(req.body, "extra_param", "") === "simple-budgetlines-bar" ||
          yearObj.year > 2014
        ) {
          const yearInstances = get(groupedExclusive, year, []);
          yearInstances.forEach((item: any) => {
            item.tags.forEach((tag: string) => {
              const tagname = get(budgetLineCodes2Values, tag, "");
              if (tagname) {
                if (yearObj[tagname]) {
                  yearObj[tagname] += item.value;
                } else {
                  yearObj = {
                    ...yearObj,
                    [tagname]: item.value,
                    [`${tagname}Code`]: tag,
                    [`${tagname}Color`]: get(colors, tag, "")
                  };
                }
              }
            });
          });
        }
        return yearObj;
      });

      if (get(req.body, "extra_param", "") === "simple-budgetlines-bar") {
        if (result.length === 1) {
          result = filter(
            Object.keys(result[0]),
            (key: string) =>
              key !== "year" &&
              key.indexOf("Color") === -1 &&
              key.indexOf("Code") === -1
          ).map((tag: string) => {
            return {
              line: tag,
              value: result[0][tag],
              code: result[0][`${tag}Code`],
              valueColor: result[0][`${tag}Color`]
            };
          });
        }
      }

      res.json({
        vizData: result
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
