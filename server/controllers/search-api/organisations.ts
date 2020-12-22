import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getFormattedSearchParam } from "../../utils/filters";
import { getOrganisations } from "../../utils/globalSearch";

export function searchOrganisations(req: any, res: any) {
  if (!req.body.q || req.body.q.length === 0) {
    res.json({
      error: "'q' parameter is required"
    });
    return;
  }
  const limit = get(req.body, "rows", 10);
  const offset = get(req.body, "page", 0) * limit;
  const values = {
    q: `participating_org_narrative:"${req.body.q}"`,
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "participating_org_ref",
        limit,
        offset,
        numBuckets: true
      }
    }),
    rows: 0
  };
  axios
    .get(
      `${process.env.DS_REST_API}/codelists/OrganisationIdentifier/?format=json`
    )
    .then(codelistResponse => {
      const orgsCodelistData = get(codelistResponse, "data", []);
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
          const organisationsCount = get(
            call1Response,
            "data.facets.items.numBuckets",
            0
          );
          const actualData = get(
            call1Response,
            "data.facets.items.buckets",
            []
          );
          res.json({
            count: organisationsCount,
            data: getOrganisations(actualData, orgsCodelistData)
          });
        })
        .catch(error1 => {
          genericError(error1, res);
        });
    })
    .catch(error => {
      genericError(error, res);
    });
}
