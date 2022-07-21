import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";
import {
  AF_REPORTING_ORG_NARRATIVE,
  AF_REPORTING_ORG_REF,
  AF_TRANSACTION_PROVIDER_ORG_REF
} from "../../static/apiFilterFields";

export function publisherDetail(req: any, res: any) {
  const activitiesValues = {
    q: getFormattedFilters(req.body.filters),
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: AF_REPORTING_ORG_REF,
        limit: 1,
        numBuckets: true
      }
    }),
    rows: 1,
    fl: AF_REPORTING_ORG_NARRATIVE
  };
  const donorsValues = {
    q: getFormattedFilters(req.body.filters),
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: AF_REPORTING_ORG_REF,
        limit: 1,
        facet: {
          sub: {
            type: "terms",
            field: AF_TRANSACTION_PROVIDER_ORG_REF,
            limit: -1,
            numBuckets: true
          }
        }
      }
    }),
    rows: 0
  };
  const calls = [
    axios.get(
      `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
        activitiesValues,
        "&",
        "=",
        {
          encodeURIComponent: (str: string) => str
        }
      )}`
    ),
    axios.get(
      `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
        donorsValues,
        "&",
        "=",
        {
          encodeURIComponent: (str: string) => str
        }
      )}`
    )
  ];
  axios
    .all(calls)
    .then(
      axios.spread((...responses) => {
        const name = get(
          responses[0],
          `data.response.docs[0]["${AF_REPORTING_ORG_NARRATIVE}"][0]`,
          ""
        );
        const activities = get(responses[0], "data.facets.items.buckets", []);
        const donorsCount = get(
          responses[1],
          "data.facets.items.buckets[0].sub.numBuckets",
          0
        );
        res.json({
          data: {
            name,
            activitiesCount: activities[0].count,
            donorsCount,
            publishersCount: 1
          }
        });
      })
    )
    .catch(errors => {
      genericError(errors, res);
    });
}
