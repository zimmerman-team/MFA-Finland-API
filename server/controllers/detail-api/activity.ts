import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import sumBy from "lodash/sumBy";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import {
  activityMetadataFl,
  activityTransactionsFl
} from "../../static/activityDetailConsts";
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
import {
  AF_DESCRIPTION_NARRATIVE,
  AF_DESCRIPTION_NARRATIVE_LANG,
  AF_IATI_IDENTIFIER,
  AF_REPORTING_ORG_NARRATIVE,
  AF_REPORTING_ORG_REF,
  AF_REPORTING_ORG_TYPE_CODE,
  AF_REPORTING_ORG_TYPE_NAME,
  AF_TITLE_NARRATIVE,
  AF_TITLE_NARRATIVE_LANG,
  AF_TRANSACTION_COUNTRY,
  AF_TRANSACTION_REGION,
  AF_TRANSACTION_SECTOR_CODE,
  AF_TRANSACTION_TYPE_CODE,
  AF_TRANSACTION_VALUE
} from "../../static/apiFilterFields";
import { organisationTypeCodelist } from "../filter-api/utils/codelists";

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
    q: `${AF_IATI_IDENTIFIER}:"${decodedId}"`,
    fl: activityMetadataFl
  };
  const disbursements = {
    q: `${AF_IATI_IDENTIFIER}:"${decodedId}" AND (${AF_TRANSACTION_TYPE_CODE}:3)`,
    fl: activityTransactionsFl,
    rows: 1000
  };
  const commitments = {
    q: `${AF_IATI_IDENTIFIER}:"${decodedId}" AND (${AF_TRANSACTION_TYPE_CODE}:2)`,
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
              iati_identifier: get(
                activityMetaData,
                `["${AF_IATI_IDENTIFIER}"]`,
                ""
              ),
              reporting_org_ref: get(
                activityMetaData,
                AF_REPORTING_ORG_REF,
                ""
              ),
              reporting_org_narrative: get(
                activityMetaData,
                `["${AF_REPORTING_ORG_NARRATIVE}"]`,
                [""]
              )[0],
              reporting_org_type: get(
                activityMetaData,
                AF_REPORTING_ORG_TYPE_NAME,
                find(organisationTypeCodelist, {
                  code: get(
                    activityMetaData,
                    `["${AF_REPORTING_ORG_TYPE_CODE}"]`,
                    ""
                  )
                })?.name || ""
              ),
              title: getFieldValueLang(
                lang,
                get(activityMetaData, `["${AF_TITLE_NARRATIVE}"]`, [""]),
                get(activityMetaData, `["${AF_TITLE_NARRATIVE_LANG}"]`, [""])
              ),
              dates: getDates(activityMetaData),
              description: getFieldValueLang(
                lang,
                get(activityMetaData, `["${AF_DESCRIPTION_NARRATIVE}"]`, [""]),
                get(activityMetaData, `["${AF_DESCRIPTION_NARRATIVE_LANG}"]`, [
                  ""
                ])
              ),
              participating_orgs: getParticipatingOrgs(activityMetaData, lang),
              summary: getSummary(activityMetaData),
              countries: getCountries(
                activityMetaData,
                get(activityMetaData, AF_TRANSACTION_COUNTRY, []),
                lang
              ),
              regions: getRegions(
                activityMetaData,
                get(activityMetaData, AF_TRANSACTION_REGION, []),
                lang
              ),
              sectors: getSectors(
                activityMetaData,
                get(activityMetaData, AF_TRANSACTION_SECTOR_CODE, null),
                lang
              ),
              default_aid_types: getDefaultAidTypes(activityMetaData, lang),
              policy_markers: getPolicyMarkers(activityMetaData)
            },
            transactions: getTransactions([
              ...disbursementsData,
              ...commitmentsData
            ]),
            disbursementsTotal: sumBy(disbursementsData, AF_TRANSACTION_VALUE),
            commitmentsTotal: sumBy(commitmentsData, AF_TRANSACTION_VALUE)
          }
        });
      })
    )
    .catch(errors => {
      genericError(errors, res);
    });
}
