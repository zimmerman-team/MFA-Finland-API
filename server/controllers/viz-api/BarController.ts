// @ts-nocheck
import axios from "axios";
import get from "lodash/get";
import sum from "lodash/sum";
import find from "lodash/find";
import uniq from "lodash/uniq";
import sumBy from "lodash/sumBy";
import filter from "lodash/filter";
import orderBy from "lodash/orderBy";
import isEmpty from "lodash/isEmpty";
import groupBy from "lodash/groupBy";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";
import {
  colors,
  translatedLines,
  budgetLineCodes2Values
} from "../../static/budgetLineConsts";
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
  AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE,
  AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_INDEX,
  AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_REF_INDEX,
  AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE_INDEX
} from "../../static/apiFilterFields";

export function ODAbarChart(req: any, res: any) {
  const totalURL = `${
    process.env.DS_SOLR_API
  }/activity/?${querystring.stringify(
    {
      q: `${getFormattedFilters(
        get(req.body, "filters", {}),
        false,
        true
      )} AND (${AF_TRANSACTION_FLOW_TYPE_CODE}:10 OR ${AF_DEFAULT_FLOW_TYPE_CODE}:10) AND ${AF_TRANSACTION_TYPE_CODE}:3`,
      fl: `${AF_TRANSACTION_TYPE_CODE},${AF_TRANSACTION},${AF_TRANSACTION_VALUE_DATE}`,
      rows: 20000
    },
    "&",
    "=",
    {
      encodeURIComponent: (str: string) => str
    }
  )}`;

  /** Review: organisation_identifier, needs to be fixed on solr before it can be migrated */
  const orgTotalURL = `${process.env.DS_SOLR_API}/organisation/?q=organisation_identifier:${process.env.MFA_PUBLISHER_REF}&fl=${AF_ORGANISATION_TOTAL_EXPENDITURE_VALUE_UNDERSCORED},${AF_ORGANISATION_TOTAL_EXPENDITURE_PERIOD_START},${AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_REF},${AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE},${AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE_INDEX},${AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_INDEX},${AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_REF_INDEX}`;

  const exclusiveURL = `${
    process.env.DS_SOLR_API
  }/activity/?${querystring.stringify(
    {
      q: `${getFormattedFilters(
        get(req.body, "filters", {}),
        false,
        true
      )} ${AF_TAG_CODE}:243066* AND ${AF_TRANSACTION_TYPE_CODE}:3`,
      fl: `${AF_TRANSACTION_TYPE_CODE},${AF_TRANSACTION},${AF_TRANSACTION_VALUE_DATE}`,
      rows: 20000
    },
    "&",
    "=",
    {
      encodeURIComponent: (str: string) => str
    }
  )}`;
  axios
    .all([axios.get(totalURL), axios.get(exclusiveURL), axios.get(orgTotalURL)])
    .then(
      axios.spread((...responses) => {
        let totalRes = get(responses[0], "data.response.docs", []);
        let exclusiveRes = get(responses[1], "data.response.docs", []);
        let orgtotalRes = get(responses[2], "data.response.docs[0]", []);
        totalRes = totalRes.map((item: any) => {
          const valueIndex = findIndex(
            item[AF_TRANSACTION_TYPE_CODE],
            (t: string) => t === "3"
          );
          const value = get(item, `["${AF_TRANSACTION}"][${valueIndex}]`, 0);
          return {
            value,
            year: get(
              item,
              `["${AF_TRANSACTION_VALUE_DATE}"][${valueIndex}]`,
              ""
            ).slice(0, 4)
          };
        });

        // process the organisation total expenditure.
        let organisationTotalExpenditures = [];
        // value is 1..1
        const allValues =
          orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_VALUE_UNDERSCORED];
        const allYears =
          orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_PERIOD_START];

        const lineRefs =
          orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_REF];
        const lineValues =
          orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE];
        const lineIndexes =
          orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_INDEX];
        const lineRefIndexes =
          orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_REF_INDEX];
        const lineValueIndexes =
          orgtotalRes[
            AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE_INDEX
          ];
        let expenselineStartIndex = 0;
        allValues.forEach((value: number, valueIndex: number) => {
          let exclusiveValues = [];
          let gniValues = [];

          const year = allYears[valueIndex].slice(0, 4); // year is also 1..1
          const numberOfExpenseLines = lineIndexes[valueIndex];
          const expenselineEndIndex =
            expenselineStartIndex + numberOfExpenseLines;

          if (numberOfExpenseLines !== 0) {
            const expenselineValueIndexes = lineValueIndexes.slice(
              expenselineStartIndex,
              expenselineEndIndex
            );
            const expenselineRefIndexes = lineRefIndexes.slice(
              expenselineStartIndex,
              expenselineEndIndex
            );

            expenselineValueIndexes.forEach(
              (expenselineValueIndex, expenselineIndex: number) => {
                const expenselineRefIndex =
                  expenselineRefIndexes[expenselineIndex];
                const expenselineValue =
                  lineValues[expenselineStartIndex + expenselineValueIndex];
                const expenselineRef =
                  lineRefs[expenselineStartIndex + expenselineRefIndex];

                if (expenselineRef.indexOf("24.30.66.") > -1) {
                  exclusiveValues.push(expenselineValue);
                } else if (expenselineRef.indexOf("ODA/GNI") > -1) {
                  gniValues.push(expenselineValue);
                }
              }
            );
          }
          expenselineStartIndex = expenselineEndIndex;

          organisationTotalExpenditures.push({
            value: value,
            year: year,
            exclusive: sum(exclusiveValues),
            gni: sum(gniValues)
          });
        });
        orgtotalRes = organisationTotalExpenditures;

        exclusiveRes = exclusiveRes.map((item: any) => {
          const valueIndex = findIndex(
            item[AF_TRANSACTION_TYPE_CODE],
            (t: string) => t === "3"
          );
          const value = get(item, `["${AF_TRANSACTION}"][${valueIndex}]`, 0);
          return {
            value,
            year: get(
              item,
              `["${AF_TRANSACTION_VALUE_DATE}"][${valueIndex}]`,
              ""
            ).slice(0, 4)
          };
        });

        const groupedTotal = groupBy(totalRes, "year");
        const groupedOrgTotal = groupBy(orgtotalRes, "year");
        const groupedExclusive = groupBy(exclusiveRes, "year");

        const years = uniq([
          ...Object.keys(groupedTotal),
          ...Object.keys(groupedOrgTotal),
          ...Object.keys(groupedExclusive)
        ]);

        const result = years.map((year: string) => {
          let exclusive = sumBy(get(groupedExclusive, year, []), "value");
          if (parseInt(year, 10) < 2015) {
            if (isEmpty(get(req.body, "filters", {}))) {
              const orgtotal = sumBy(get(groupedOrgTotal, year, []), "value");
              exclusive = get(groupedOrgTotal, `${year}[0].exclusive`, 0);
              return {
                year: parseInt(year, 10),
                exclusive,
                exclusiveColor: "#ACD1D1",
                other: orgtotal - exclusive,
                otherColor: "#7491CE",
                gni: get(groupedOrgTotal, `${year}[0].gni`, 0),
                gniColor: "#D495A7"
              };
            } else {
              return {
                year: parseInt(year, 10),
                exclusive: 0,
                exclusiveColor: "#ACD1D1",
                other: 0,
                otherColor: "#7491CE",
                gni: 0,
                gniColor: "#D495A7"
              };
            }
          }
          const total = sumBy(get(groupedTotal, year, []), "value");
          return {
            year: parseInt(year, 10),
            exclusive,
            exclusiveColor: "#ACD1D1",
            other: total - exclusive,
            otherColor: "#7491CE",
            gni: get(groupedOrgTotal, `${year}[0].gni`, 0),
            gniColor: "#D495A7"
          };
        });

        res.json({
          vizData: orderBy(
            filter(result, (item: any) => item.exclusive > 0 || item.other > 0),
            "year",
            "asc"
          )
        });
      })
    )
    .catch(error => {
      genericError(error, res);
    });
}

export function budgetLineBarChart(req: any, res: any) {
  const extra_param = get(req.body, "extra_param", "");
  const yearFilter = get(req.body, "filters.years", []);
  const orgTotalURL = `${process.env.DS_SOLR_API}/organisation/?q=organisation_identifier:${process.env.MFA_PUBLISHER_REF}&fl=${AF_ORGANISATION_TOTAL_EXPENDITURE_VALUE_UNDERSCORED},${AF_ORGANISATION_TOTAL_EXPENDITURE_PERIOD_START},${AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_REF},${AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE},${AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE_INDEX},${AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_INDEX},${AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_REF_INDEX}`;
  if (
    yearFilter.length > 0 &&
    parseInt(yearFilter[0], 10) < 2015 &&
    extra_param === "simple-budgetlines-bar"
  ) {
    axios
      .get(orgTotalURL)
      .then(response => {
        let orgtotalRes = get(response, "data.response.docs[0]", []);

        // process the organisation total expenditure.
        let organisationTotalExpenditures = [];
        // value is 1..1
        const allValues =
          orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_VALUE_UNDERSCORED];
        const allYears =
          orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_PERIOD_START];

        const lineRefs =
          orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_REF];
        const lineValues =
          orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE];
        const lineIndexes =
          orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_INDEX];
        const lineRefIndexes =
          orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_REF_INDEX];
        const lineValueIndexes =
          orgtotalRes[
            AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE_INDEX
          ];
        let expenselineStartIndex = 0;
        allValues.forEach((value: number, valueIndex: number) => {
          const lines = [];
          const year = allYears[valueIndex].slice(0, 4); // year is also 1..1
          const numberOfExpenseLines = lineIndexes[valueIndex];
          const expenselineEndIndex =
            expenselineStartIndex + numberOfExpenseLines;

          if (numberOfExpenseLines !== 0) {
            const expenselineValueIndexes = lineValueIndexes.slice(
              expenselineStartIndex,
              expenselineEndIndex
            );
            const expenselineRefIndexes = lineRefIndexes.slice(
              expenselineStartIndex,
              expenselineEndIndex
            );

            expenselineValueIndexes.forEach(
              (expenselineValueIndex, expenselineIndex: number) => {
                const expenselineRefIndex =
                  expenselineRefIndexes[expenselineIndex];
                const expenselineValue =
                  lineValues[expenselineStartIndex + expenselineValueIndex];
                const expenselineRef =
                  lineRefs[expenselineStartIndex + expenselineRefIndex];

                if (expenselineRef.indexOf("24.30.66.") > -1) {
                  lines.push({ expenselineRef, value: expenselineValue });
                }
              }
            );
          }
          expenselineStartIndex = expenselineEndIndex;

          organisationTotalExpenditures.push({
            value,
            year,
            lines
          });
        });
        orgtotalRes = organisationTotalExpenditures;
        let result = find(orgtotalRes, { year: yearFilter[0] });

        result = get(result, "lines", []).map((line: string) => {
          const ref = line.ref.replace(/\./g, "");
          const translatedLine = find(translatedLines, { code: ref });
          return {
            line: get(translatedLine, "info.name", ref),
            line_fi: get(translatedLine, "info.name_fi", ref),
            line_se: get(translatedLine, "info.name_se", ref),
            value: line.value,
            code: line.ref,
            valueColor: get(colors, ref, "")
          };
        });

        res.json({
          vizData: result
        });
      })
      .catch(error => genericError(error, res));
  } else {
    const exclusiveURL = `${
      process.env.DS_SOLR_API
    }/activity/?${querystring.stringify(
      {
        q: `${getFormattedFilters(
          get(req.body, "filters", {}),
          false,
          true
        )} AND ${AF_TAG_CODE}:243066* AND ${AF_TRANSACTION_TYPE_CODE}:3`,
        fl: `${AF_TRANSACTION_TYPE_CODE},${AF_TRANSACTION},${AF_TRANSACTION_VALUE_DATE},${AF_TAG_CODE}`,
        rows: 20000
      },
      "&",
      "=",
      {
        encodeURIComponent: (str: string) => str
      }
    )}`;

    axios
      .all([axios.get(exclusiveURL), axios.get(orgTotalURL)])
      .then(
        axios.spread((...responses) => {
          let exclusiveRes = get(responses[0], "data.response.docs", []);
          let orgtotalRes = get(responses[1], "data.response.docs[0]", []);

          // process the organisation total expenditure.
          let organisationTotalExpenditures = [];
          // value is 1..1
          const allValues =
            orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_VALUE_UNDERSCORED];
          const allYears =
            orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_PERIOD_START];

          const lineRefs =
            orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_REF];
          const lineValues =
            orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE];
          const lineIndexes =
            orgtotalRes[AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_INDEX];
          const lineRefIndexes =
            orgtotalRes[
              AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_REF_INDEX
            ];
          const lineValueIndexes =
            orgtotalRes[
              AF_ORGANISATION_TOTAL_EXPENDITURE_EXPENSE_LINE_VALUE_INDEX
            ];
          let expenselineStartIndex = 0;
          allValues.forEach((value: number, valueIndex: number) => {
            const lines = [];
            const year = allYears[valueIndex].slice(0, 4); // year is also 1..1
            const numberOfExpenseLines = lineIndexes[valueIndex];
            const expenselineEndIndex =
              expenselineStartIndex + numberOfExpenseLines;

            if (numberOfExpenseLines !== 0) {
              const expenselineValueIndexes = lineValueIndexes.slice(
                expenselineStartIndex,
                expenselineEndIndex
              );
              const expenselineRefIndexes = lineRefIndexes.slice(
                expenselineStartIndex,
                expenselineEndIndex
              );

              expenselineValueIndexes.forEach(
                (expenselineValueIndex, expenselineIndex: number) => {
                  const expenselineRefIndex =
                    expenselineRefIndexes[expenselineIndex];
                  const expenselineValue =
                    lineValues[expenselineStartIndex + expenselineValueIndex];
                  const expenselineRef =
                    lineRefs[expenselineStartIndex + expenselineRefIndex];

                  if (expenselineRef.indexOf("24.30.66.") > -1) {
                    lines.push({
                      ref: expenselineRef,
                      value: expenselineValue
                    });
                  }
                }
              );
            }
            expenselineStartIndex = expenselineEndIndex;

            organisationTotalExpenditures.push({
              value,
              year,
              lines
            });
          });
          orgtotalRes = organisationTotalExpenditures;

          exclusiveRes = exclusiveRes.map((item: any) => {
            const valueIndex = findIndex(
              item[AF_TRANSACTION_TYPE_CODE],
              (t: string) => t === "3"
            );
            const value = get(item, `["${AF_TRANSACTION}"][${valueIndex}]`, 0);
            return {
              value,
              tags: get(item, AF_TAG_CODE, []),
              year: get(
                item,
                `["${AF_TRANSACTION_VALUE_DATE}"][${valueIndex}]`,
                ""
              ).slice(0, 4)
            };
          });

          const groupedTotalOrg = groupBy(orgtotalRes, "year");
          const groupedExclusive = groupBy(exclusiveRes, "year");
          const years = uniq([
            ...Object.keys(groupedTotalOrg),
            ...Object.keys(groupedExclusive)
          ]);

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
                  const translatedLine = find(translatedLines, { code: tag });
                  const tagname = get(translatedLine, "info.name", null);
                  const tagnamefi = get(translatedLine, "info.name_fi", null);
                  const tagnamese = get(translatedLine, "info.name_se", null);
                  if (tagname) {
                    if (yearObj[tagname]) {
                      yearObj[tagname] += item.value;
                      yearObj[`${tagnamefi}_fi`] += item.value;
                      yearObj[`${tagnamese}_se`] += item.value;
                    } else {
                      yearObj = {
                        ...yearObj,
                        [tagname]: item.value,
                        [`${tagnamefi}_fi`]: item.value,
                        [`${tagnamese}_se`]: item.value,
                        [`${tagname}Code`]: tag,
                        [`${tagnamefi}Code`]: tag,
                        [`${tagnamese}Code`]: tag,
                        [`${tagname}Color`]: get(colors, tag, ""),
                        [`${tagnamefi}Color`]: get(colors, tag, ""),
                        [`${tagnamese}Color`]: get(colors, tag, "")
                      };
                    }
                  }
                });
              });
            } else {
              if (isEmpty(get(req.body, "filters", {}))) {
                const yearInstances = get(
                  find(orgtotalRes, { year: year }),
                  "lines",
                  []
                );
                yearInstances.forEach((item: any) => {
                  const ref = item.ref.replace(/\./g, "");
                  const translatedLine = find(translatedLines, { code: ref });
                  const tagname = get(translatedLine, "info.name", null);
                  const tagnamefi = get(translatedLine, "info.name_fi", null);
                  const tagnamese = get(translatedLine, "info.name_se", null);
                  if (tagname) {
                    if (yearObj[tagname]) {
                      yearObj[tagname] += item.value;
                      yearObj[`${tagnamefi}_fi`] += item.value;
                      yearObj[`${tagnamese}_se`] += item.value;
                    } else {
                      yearObj = {
                        ...yearObj,
                        [tagname]: item.value,
                        [`${tagnamefi}_fi`]: item.value,
                        [`${tagnamese}_se`]: item.value,
                        [`${tagname}Code`]: ref,
                        [`${tagnamefi}Code`]: ref,
                        [`${tagnamese}Code`]: ref,
                        [`${tagname}Color`]: get(colors, ref, ""),
                        [`${tagnamefi}Color`]: get(colors, ref, ""),
                        [`${tagnamese}Color`]: get(colors, ref, "")
                      };
                    }
                  }
                });
              }
            }
            return yearObj;
          });

          if (extra_param === "simple-budgetlines-bar") {
            const fYear = find(result, { year: parseInt(yearFilter[0], 10) });
            if (fYear) {
              result = filter(
                Object.keys(fYear),
                (key: string) =>
                  key !== "year" &&
                  key.indexOf("Color") === -1 &&
                  key.indexOf("Code") === -1 &&
                  key.indexOf("_fi") === -1 &&
                  key.indexOf("_se") === -1
              ).map((tag: string) => {
                const translatedLine = find(translatedLines, {
                  code: fYear[`${tag}Code`]
                });
                return {
                  line: tag,
                  line_fi: get(translatedLine, "info.name_fi", null),
                  line_se: get(translatedLine, "info.name_se", null),
                  value: fYear[tag],
                  code: fYear[`${tag}Code`],
                  valueColor: fYear[`${tag}Color`]
                };
              });
            }
          }

          res.json({
            vizData: filter(
              orderBy(result, "year", "asc"),
              (item: any) => Object.keys(item).length > 1
            )
          });
        })
      )
      .catch(error => {
        console.error(error);
        genericError(error, res);
      });
  }
}
