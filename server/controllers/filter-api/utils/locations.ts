import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import {
  formatRegionOptions,
  formatCountryOptions,
  formatLocationOptions
} from ".";

export function getLocationsOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const values = {
      q: filterString,
      "json.facet": JSON.stringify({
        countries: {
          type: "terms",
          field: "recipient_country_code",
          limit: -1
        },
        regions: {
          type: "terms",
          field: "recipient_region_code",
          limit: -1,
          facet: {
            sub: {
              type: "terms",
              field: "recipient_region_name",
              limit: 1
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
      .then(callResponse => {
        const countriesData = get(
          callResponse,
          "data.facets.countries.buckets",
          []
        );
        const regionsData = get(
          callResponse,
          "data.facets.regions.buckets",
          []
        );
        const countries = formatCountryOptions(countriesData);
        const regions = formatRegionOptions(regionsData);
        resolve(formatLocationOptions([...countries, ...regions]));
      })
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
