import axios from "axios";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import {
  AF_REPORTING_ORG_REF,
  AF_PARTICIPATING_ORG_NARRATIVE,
  AF_PARTICIPATING_ORG_REF
} from "../../static/apiFilterFields";

export function searchOrganisations(req: any, res: any) {
  if (!req.body.q || req.body.q.length === 0) {
    res.json({
      error: "'q' parameter is required"
    });
    return;
  }
  const limit = get(req.body, "rows", 10);
  const offset = get(req.body, "page", 0) * limit;
  const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
    {
      q: `${AF_REPORTING_ORG_REF}:${process.env.MFA_PUBLISHER_REF} AND ${AF_PARTICIPATING_ORG_NARRATIVE}:"${req.body.q}"`,
      fl: `${AF_PARTICIPATING_ORG_REF},${AF_PARTICIPATING_ORG_NARRATIVE}`,
      rows: 20000
    },
    "&",
    "=",
    {
      encodeURIComponent: (str: string) => str
    }
  )}`;

  axios
    .get(url)
    .then(callResponse => {
      const actualData = get(callResponse, "data.response.docs", []);
      let orgs: any[] = [];
      actualData.forEach((doc: any) => {
        doc[AF_PARTICIPATING_ORG_REF].forEach((ref: string, index: number) => {
          if (ref.trim().length > 0) {
            orgs.push({
              ref,
              name: doc[AF_PARTICIPATING_ORG_NARRATIVE][index]
            });
          }
        });
      });
      orgs = uniqBy(orgs, "ref");
      res.json({
        count: orgs.length,
        data: orgs.map((org: any) => ({
          name: org.name,
          link: `/organisations/${org.ref}`
        }))
      });
    })
    .catch(error1 => {
      genericError(error1, res);
    });
}
