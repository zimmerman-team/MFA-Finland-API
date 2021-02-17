import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import querystring from "querystring";
import { countries } from "../../static/countries";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";

export function countryDetail(req: any, res: any) {
  const activitiesValues = {
    q: getFormattedFilters(req.body.filters),
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "recipient_country_code",
        limit: 1,
        numBuckets: true
      }
    }),
    rows: 0
  };
  const donorsValues = {
    q: getFormattedFilters(req.body.filters),
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "recipient_country_code",
        limit: 1,
        facet: {
          sub: {
            type: "terms",
            field: "transaction_provider_org_ref",
            limit: -1,
            numBuckets: true
          }
        }
      }
    }),
    rows: 0
  };
  const publishersValue = {
    q: getFormattedFilters(req.body.filters),
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "recipient_country_code",
        limit: 1,
        facet: {
          sub: {
            type: "terms",
            field: "reporting_org_ref",
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
  const fCountry = find(countries, {
    code: get(req.body, "filters.recipient_country_code[0]", "")
  });
  if (fCountry) {
    const wikiExcerptValue = {
      origin: "*",
      action: "query",
      prop: "extracts",
      exsentences: 3,
      exlimit: 1,
      exintro: 1,
      explaintext: 1,
      exsectionformat: "raw",
      formatversion: 2,
      titles: fCountry.name,
      format: "json"
    };
    calls.push(
      axios.get(
        `https://en.wikipedia.org/w/api.php?${querystring.stringify(
          wikiExcerptValue,
          "&",
          "=",
          {
            encodeURIComponent: (str: string) => str
          }
        )}`
      )
    );
  }
  axios
    .all(calls)
    .then(
      axios.spread((...responses) => {
        const activities = get(responses[0], "data.facets.items.buckets", []);
        const donors = get(responses[1], "data.facets.items.buckets", []);
        const publishers = get(responses[2], "data.facets.items.buckets", []);
        const excerpt = get(responses, "[3].data.query.pages[0].extract", "");
        res.json({
          data: {
            activitiesCount: activities[0].count,
            donorsCount: donors[0].sub.numBuckets,
            publishersCount: publishers[0].sub.numBuckets,
            wikiExcerpt: excerpt
          }
        });
      })
    )
    .catch(errors => {
      genericError(errors, res);
    });
}
