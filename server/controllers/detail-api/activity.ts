import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import {
  activityMetadataFl,
  activityTransactionsFl
} from "../../static/activityDetailConsts";
import { parseJsonSolrField } from "../../utils/parseJsonSolrField";
import {
  getBudget,
  getConditions,
  getContactInfo,
  getCountries,
  getCountryBudgetItems,
  getDates,
  getDefaultAidTypes,
  getDocumentLinks,
  getHumanitarianScopes,
  getLegacyData,
  getLocations,
  getOtherIdentifiers,
  getParticipatingOrgs,
  getPlannedDisbursements,
  getPolicyMarkers,
  getRegions,
  getRelatedActivities,
  getSectors,
  getSummary,
  getTags,
  getTransactions
} from "./utils/activity";

export function activityDetail(req: any, res: any) {
  if (!req.body.activityId || req.body.activityId.length === 0) {
    res.json({
      error: "'id' parameter is required"
    });
    return;
  }
  const decodedId = decodeURIComponent(req.body.activityId);
  const metadata = {
    q: `iati_identifier:${decodedId}`,
    fl: activityMetadataFl
  };
  const inTransactions = {
    q: `iati_identifier:${decodedId} AND (transaction_type:1 OR transaction_type:11 OR transaction_type:13)`,
    fl: activityTransactionsFl,
    rows: 1000
  };
  const outTransactions = {
    q: `iati_identifier:${decodedId} AND (transaction_type:2 OR transaction_type:3 OR transaction_type:4 OR transaction_type:12)`,
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
        inTransactions,
        "&",
        "=",
        {
          encodeURIComponent: (str: string) => str
        }
      )}`
    ),
    axios.get(
      `${process.env.DS_SOLR_API}/transaction/?${querystring.stringify(
        outTransactions,
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
        const inTransactionsData = get(responses[1], "data.response.docs", []);
        const outTransactionsData = get(responses[2], "data.response.docs", []);

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
              title: get(activityMetaData, "title_narrative_text", [""])[0],
              dates: getDates(get(activityMetaData, "activity_date", [])),
              description: get(activityMetaData, "description_narrative_text", [
                ""
              ])[0],
              budgets: getBudget(get(activityMetaData, "budget", [])),
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
              locations: getLocations(
                get(activityMetaData, "location_point_pos", []),
                get(activityMetaData, "location_description_narrative_text", [])
              ),
              humanitarian_scopes: getHumanitarianScopes(
                get(activityMetaData, "humanitarian_scope_type", []),
                get(activityMetaData, "humanitarian_scope_vocabulary", []),
                get(activityMetaData, "humanitarian_scope_code", []),
                get(activityMetaData, "humanitarian_scope_narrative_text", [])
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
              ),
              tags: getTags(
                get(activityMetaData, "iati_code", []),
                get(activityMetaData, "tag_narrative_text", [])
              ),
              contact_info: getContactInfo(
                get(activityMetaData, "contact_info", []),
                get(activityMetaData, "reporting_org_ref", null)
              ),
              other_identifiers: getOtherIdentifiers(
                get(activityMetaData, "other_identifier_ref", []),
                get(
                  activityMetaData,
                  "other_identifier_owner_org_narrative_text",
                  []
                )
              ),
              country_budget_items: getCountryBudgetItems(
                get(
                  activityMetaData,
                  "country_budget_items_vocabulary",
                  "no data"
                ),
                get(
                  activityMetaData,
                  "country_budget_items_budget_item_code",
                  []
                ),
                get(
                  activityMetaData,
                  "country_budget_items_budget_item_percentage",
                  []
                ),
                get(
                  activityMetaData,
                  "country_budget_items_budget_description_narrative_text",
                  []
                )
              ),
              planned_disbursements: getPlannedDisbursements(
                get(activityMetaData, "planned_disbursement_value", []),
                get(activityMetaData, "planned_disbursement_type", []),
                get(
                  activityMetaData,
                  "planned_disbursement_period_start_iso_date",
                  []
                ),
                get(
                  activityMetaData,
                  "planned_disbursement_period_end_iso_date",
                  []
                ),
                get(
                  activityMetaData,
                  "planned_disbursement_value_currency",
                  []
                ),
                get(
                  activityMetaData,
                  "planned_disbursement_provider_org_narrative_text",
                  []
                )
              ),
              document_links: getDocumentLinks(
                get(activityMetaData, "document_link_title_narrative_text", []),
                get(activityMetaData, "document_link_url", []),
                get(activityMetaData, "document_link_category_code", [])
              ),
              related_activities: getRelatedActivities(
                get(activityMetaData, "related_activity_ref", []),
                get(activityMetaData, "related_activity_type", [])
              ),
              legacy_data: getLegacyData(
                get(activityMetaData, "legacy_data_name", []),
                get(activityMetaData, "legacy_data_value", []),
                get(activityMetaData, "legacy_data_iati_equivalent", [])
              ),
              conditions: getConditions(
                get(activityMetaData, "conditions_condition_type", []),
                get(activityMetaData, "conditions_condition_narrative_text", [])
              )
            },
            inTransactions: getTransactions(inTransactionsData),
            outTransactions: getTransactions(outTransactionsData)
          }
        });
      })
    )
    .catch(errors => {
      genericError(errors, res);
    });
}
