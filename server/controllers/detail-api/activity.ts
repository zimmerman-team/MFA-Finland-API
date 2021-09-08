import axios from "axios";
import get from "lodash/get";
import sumBy from "lodash/sumBy";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import {
  activityMetadataFl,
  activityTransactionsFl
} from "../../static/activityDetailConsts";
import { parseJsonSolrField } from "../../utils/parseJsonSolrField";
import {
  getCountries,
  getDates,
  getDefaultAidTypes,
  getParticipatingOrgs,
  getPolicyMarkers,
  getRegions,
  getSectors,
  getSummary,
  getTransactions
} from "./utils/activity";
import { getFieldValueLang } from "../../utils/getFieldValueLang";

export function activityDetail(req: any, res: any) {
  const lang = req.body.lang || "en";
  if (!req.body.activityId || req.body.activityId.length === 0) {
    res.json({
      error: "'id' parameter is required"
    });
    return;
  }
  const decodedId = decodeURIComponent(req.body.activityId);
  const metadata = {
    q: `iati_identifier:"${decodedId}"`,
    fl: activityMetadataFl
  };
  const disbursements = {
    q: `iati_identifier:"${decodedId}" AND (transaction_type:3)`,
    fl: activityTransactionsFl,
    rows: 1000
  };
  const commitments = {
    q: `iati_identifier:"${decodedId}" AND (transaction_type:2)`,
    fl: activityTransactionsFl,
    rows: 1000
  };
  const calls = [
    axios.get(
      `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
        metadata,
        "&",
        "=",
        {
          encodeURIComponent: (str: string) => str
        }
      )}`
    ),
    axios.get(
      `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
        disbursements,
        "&",
        "=",
        {
          encodeURIComponent: (str: string) => str
        }
      )}`
    ),
    axios.get(
      `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
        commitments,
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
        const activityMetaData = get(responses[0], "data.response.docs[0]", {});
        const disbursementsData = get(responses[1], "data.response.docs", []);
        const commitmentsData = get(responses[2], "data.response.docs", []);

        res.json({
          data: {
            metadata: {
              iati_identifier: get(activityMetaData, "iati_identifier", ""),
              reporting_org_ref: get(activityMetaData, "reporting_org_ref", ""),
              reporting_org_narrative: get(
                activityMetaData,
                "reporting_org_narrative",
                [""]
              )[0],
              reporting_org_type: parseJsonSolrField(
                activityMetaData.reporting_org,
                "type.name"
              ),
              title: getFieldValueLang(
                lang,
                get(activityMetaData, "title_narrative_text", [""]),
                get(activityMetaData, "title_narrative_lang", [""])
              ),
              dates: getDates(get(activityMetaData, "activity_date", [])),
              description: getFieldValueLang(
                lang,
                get(activityMetaData, "description_narrative_text", [""]),
                get(activityMetaData, "description_lang", [""])
              ),
              participating_orgs: getParticipatingOrgs(
                get(activityMetaData, "participating_org", [])
              ),
              summary: getSummary(activityMetaData),
              countries: getCountries(
                get(activityMetaData, "recipient_country", []),
                get(activityMetaData, "transaction_recipient_country_code", [])
              ),
              regions: getRegions(
                get(activityMetaData, "recipient_region", []),
                get(activityMetaData, "transaction_recipient_region_code", [])
              ),
              sectors: getSectors(
                get(activityMetaData, "sector", []),
                get(activityMetaData, "transaction_sector_code", []),
                get(activityMetaData, "reporting_org_ref", null)
              ),
              default_aid_types: getDefaultAidTypes(
                get(activityMetaData, "default_aid_type", [])
              ),
              policy_markers: getPolicyMarkers(
                get(activityMetaData, "policy_marker", [])
              )
            },
            transactions: getTransactions([
              ...disbursementsData,
              ...commitmentsData
            ]),
            disbursementsTotal: sumBy(disbursementsData, "transaction_value"),
            commitmentsTotal: sumBy(commitmentsData, "transaction_value")
          }
        });
      })
    )
    .catch(errors => {
      genericError(errors, res);
    });
}
