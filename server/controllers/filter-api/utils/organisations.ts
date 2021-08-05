import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { formatOrganisationsOptions2 } from ".";
// import { orgDacChannel } from "../../../static/orgDacChannel";

export function getOrganisationsOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const values = {
      q: filterString,
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: "participating_org_ref",
          limit: -1,
          facet: {
            names: {
              type: "terms",
              field: "participating_org_narrative",
              limit: 2
            }
          }
        }
      }),
      rows: 0
    };

    axios
      .all([
        axios.get(
          `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
            values,
            "&",
            "=",
            {
              encodeURIComponent: (str: string) => str
            }
          )}`
        )
        // axios.get(
        //   "https://prod-iati-website.azureedge.net/prod-iati-website/reference_downloads/203/codelists/downloads/clv3/json/en/CRSChannelCode.json"
        // ),
      ])
      .then(
        axios.spread((...responses) => {
          const actualData = get(responses[0], "data.facets.items.buckets", []);
          // const codelist = get(responses[1], "data.data", orgDacChannel);
          resolve(formatOrganisationsOptions2(actualData));
        })
      )
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
