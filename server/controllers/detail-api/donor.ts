import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";
import {
  AF_REPORTING_ORG_REF,
  AF_TRANSACTION_PROVIDER_ORG_NARRATIVE,
  AF_TRANSACTION_PROVIDER_ORG_REF
} from "../../static/apiFilterFields";

export function donorDetail(req: any, res: any) {
  let filters = getFormattedFilters(req.body.filters);
  const activitiesValues = {
    q: filters,
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: AF_TRANSACTION_PROVIDER_ORG_REF,
        limit: 1,
        numBuckets: true
      }
    }),
    rows: 1,
    fl: AF_TRANSACTION_PROVIDER_ORG_NARRATIVE
  };
  const publishersValue = {
    q: filters,
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: AF_TRANSACTION_PROVIDER_ORG_REF,
        limit: 1,
        facet: {
          sub: {
            type: "terms",
            field: AF_REPORTING_ORG_REF,
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
        publishersValue,
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
          `data.response.docs[0]["${AF_TRANSACTION_PROVIDER_ORG_NARRATIVE}"][0]`,
          ""
        );
        const activities = get(responses[0], "data.facets.items.buckets", []);
        const publishers = get(responses[1], "data.facets.items.buckets", []);
        res.json({
          data: {
            name,
            activitiesCount: activities[0].count,
            donorsCount: 1,
            publishersCount: publishers[0].sub.numBuckets
          }
        });
      })
    )
    .catch(errors => {
      genericError(errors, res);
    });
}
