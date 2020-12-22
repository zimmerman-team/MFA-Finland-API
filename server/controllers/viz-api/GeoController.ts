import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import uniq from "lodash/uniq";
import querystring from "querystring";
import { countries } from "../../static/countries";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";
import { getCountryISO3 } from "../../utils/countryISOMapping";

export function activitiesGeoChart(req: any, res: any) {
  const values = {
    q: getFormattedFilters(get(req.body, "filters", {})),
    "json.facet": JSON.stringify({
      items: { type: "terms", field: "recipient_country_code", limit: -1 }
    }),
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
    .then(call1Response => {
      const numFound = get(call1Response, "data.response.numFound", 0);
      const actualData = get(call1Response, "data.facets.items.buckets", []);
      const result = actualData.map((item: any) => {
        return {
          id: getCountryISO3(item.val),
          value: item.count,
          name: get(find(countries, { code: item.val }), "name", item.val)
        };
      });

      res.json({
        data: result,
        count: numFound,
        label: "activities"
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}

function getNumberOfDonors(data: any): number {
  let donors: any[] = [];
  data.forEach(
    (item: any) =>
      (donors = [
        ...donors,
        ...item.sub.buckets.map((bucket: any) => bucket.val)
      ])
  );
  const uniqDonors = uniq(donors);
  return uniqDonors.length;
}

// https://iatidatastore.iatistandard.org/search/activity?q=*:*&rows=0&facet=on&facet.limit=1000&facet.pivot=recipient_country_name,reporting_org_ref,reporting_org_narrative
export function publishersGeoChart(req: any, res: any): void {
  //TODO: sort on numBuckets (desc)
  const values = {
    q: getFormattedFilters(get(req.body, "filters", {})),
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "recipient_country_code",
        limit: -1,
        facet: {
          sub: {
            type: "terms",
            numBuckets: true,
            field: "reporting_org_ref",
            limit: -1
            // limit: 1
          }
        }
      }
    }),
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
    .then(call1Response => {
      const actualData = get(call1Response, "data.facets.items.buckets", []);

      const numberOfPublishers = getNumberOfDonors(actualData);

      const result = actualData.map((item: any) => {
        return {
          id: getCountryISO3(item.val),
          value: item.sub.numBuckets,
          name: get(find(countries, { code: item.val }), "name", item.val)
        };
      });

      res.json({
        data: result,
        count: numberOfPublishers,
        label: "publishers"
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}

export function donorsGeoChart(req: any, res: any): void {
  //TODO: sort on numBuckets (desc)
  const values = {
    q: getFormattedFilters(get(req.body, "filters", {})),
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "recipient_country_code",
        limit: -1,
        facet: {
          sub: {
            type: "terms",
            numBuckets: true,
            field: "transaction_provider_org_ref",
            limit: -1
            // limit: 1
          }
        }
      }
    }),
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
    .then(call1Response => {
      const actualData = get(call1Response, "data.facets.items.buckets", []);

      const numberOfDonors = getNumberOfDonors(actualData);

      const result = actualData.map((item: any) => {
        return {
          id: getCountryISO3(item.val),
          value: item.sub.numBuckets,
          name: get(find(countries, { code: item.val }), "name", item.val)
        };
      });

      res.json({
        data: result,
        count: numberOfDonors,
        label: "donors"
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}
