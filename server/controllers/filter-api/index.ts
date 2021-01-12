import get from "lodash/get";
import { getFormattedFilters } from "../../utils/filters";

// controllers
import { getTagOptions } from "../../controllers/filter-api/utils/tag";
import { getDonorsOptions } from "../../controllers/filter-api/utils/donors";
import { getSectorsOptions } from "../../controllers/filter-api/utils/sectors";
import { getRegionsOptions } from "../../controllers/filter-api/utils/regions";
import { getCurrencyOptions } from "../../controllers/filter-api/utils/currency";
import { getLanguageOptions } from "../../controllers/filter-api/utils/language";
import { getCountriesOptions } from "../../controllers/filter-api/utils/countries";
import { getHierarchyOptions } from "../../controllers/filter-api/utils/hierarchy";
import { getPublishersOptions } from "../../controllers/filter-api/utils/publishers";
import { getIATIVersionOptions } from "../../controllers/filter-api/utils/iativersion";
import { getPolicyMarkerOptions } from "../../controllers/filter-api/utils/policymarker";
import { getOrganisationsOptions } from "../../controllers/filter-api/utils/organisations";
import { getActivituScopeOptions } from "../../controllers/filter-api/utils/activityscope";
import { getSectorVocabularyOptions } from "../../controllers/filter-api/utils/sectorvocab";
import { getDefaultAidTypeOptions } from "../../controllers/filter-api/utils/defaultaidtype";
import { getActivituStatusOptions } from "../../controllers/filter-api/utils/activitystatus";
import { getHumanitarianScopeVocabs } from "../../controllers/filter-api/utils/humscopevocab";
import { getDefaultFlowTypeOptions } from "../../controllers/filter-api/utils/defaultflowtype";
import { getTransactionTypeOptions } from "../../controllers/filter-api/utils/transactiontype";
import { getReportingOrgTypeOptions } from "../../controllers/filter-api/utils/reportingorgtype";
import { getDefaultTiedStatusOptions } from "../../controllers/filter-api/utils/defaulttiedstatus";
import { getCollaborationTypeOptions } from "../../controllers/filter-api/utils/collaborationtype";
import { getDefaultFinanceTypeOptions } from "../../controllers/filter-api/utils/defaultfinancetype";
import { getOtherIdentifierTypeOptions } from "../../controllers/filter-api/utils/otheridentifiertype";
import { getTransactionFlowTypeOptions } from "../../controllers/filter-api/utils/transactionflowtype";
import { getDocumentLinkCategoryOptions } from "../../controllers/filter-api/utils/documentlinkcategory";
import { getTransactionTiedStatusOptions } from "../../controllers/filter-api/utils/transactiontiedstatus";
import { getDefaultAidTypeVocabOptions } from "../../controllers/filter-api/utils/defaultaidtypevocabulary";
import { getDefaultAidTypeCategoryOptions } from "../../controllers/filter-api/utils/defaultaidtypecategory";
import { getTransactionReceiverOrgOptions } from "../../controllers/filter-api/utils/transactionreceiverorg";
import { getTransactionValueCurrencyOptions } from "../../controllers/filter-api/utils/transactionvaluecurrency";

export async function dynamicFilterOptions(req: any, res: any) {
  const filters: any = get(req.body, "filters", {});
  const filterString = getFormattedFilters(filters);

  getCountriesOptions(filterString).then(countries => {
    getRegionsOptions(filterString).then(regions => {
      getSectorsOptions(filterString).then(sectors => {
        getDonorsOptions(filterString).then(donors => {
          getOrganisationsOptions(filterString).then(organisations => {
            getPublishersOptions(filterString).then(publishers => {
              getActivituStatusOptions(filterString).then(activitystatus => {
                res.json({
                  countries,
                  regions,
                  sectors,
                  donors,
                  organisations,
                  publishers,
                  activitystatus
                });
              });
            });
          });
        });
      });
    });
  });
}

export async function getFilterGroupOptions(req: any, res: any) {
  const filters: any = get(req.body, "filters", {});
  const filterString = getFormattedFilters(filters);

  let getter = getCountriesOptions;

  switch (req.body.filter_type) {
    case "regions":
      getter = getRegionsOptions;
      break;
    case "sectors":
      getter = getSectorsOptions;
      break;
    case "donors":
      getter = getDonorsOptions;
      break;
    case "organisations":
      getter = getOrganisationsOptions;
      break;
    case "publishers":
      getter = getPublishersOptions;
      break;
    case "activitystatus":
      getter = getActivituStatusOptions;
      break;
    case "activityscope":
      getter = getActivituScopeOptions;
      break;
    case "documentlinkcategory":
      getter = getDocumentLinkCategoryOptions;
      break;
    case "hierarchy":
      getter = getHierarchyOptions;
      break;
    case "humanitarianscopevocab":
      getter = getHumanitarianScopeVocabs;
      break;
    case "iativersion":
      getter = getIATIVersionOptions;
      break;
    case "otheridentifiertype":
      getter = getOtherIdentifierTypeOptions;
      break;
    case "tag":
      getter = getTagOptions;
      break;
    case "transactionflowtype":
      getter = getTransactionFlowTypeOptions;
      break;
    case "transactiontiedstatus":
      getter = getTransactionTiedStatusOptions;
      break;
    case "transactiontype":
      getter = getTransactionTypeOptions;
      break;
    case "transactionvaluecurrency":
      getter = getTransactionValueCurrencyOptions;
      break;
    case "defaultaidtype":
      getter = getDefaultAidTypeOptions;
      break;
    case "defaultaidtypecategory":
      getter = getDefaultAidTypeCategoryOptions;
      break;
    case "defaultaidtypevocabulary":
      getter = getDefaultAidTypeVocabOptions;
      break;
    case "currency":
      getter = getCurrencyOptions;
      break;
    case "defaultfinancetype":
      getter = getDefaultFinanceTypeOptions;
      break;
    case "defaultflowtype":
      getter = getDefaultFlowTypeOptions;
      break;
    case "language":
      getter = getLanguageOptions;
      break;
    case "defaulttiedstatus":
      getter = getDefaultTiedStatusOptions;
      break;
    case "transactionreceiverorg":
      getter = getTransactionReceiverOrgOptions;
      break;
    case "reportingorgtype":
      getter = getReportingOrgTypeOptions;
      break;
    case "collaborationtype":
      getter = getCollaborationTypeOptions;
      break;
    case "sectorvocabulary":
      getter = getSectorVocabularyOptions;
      break;
    case "policymarker":
      getter = getPolicyMarkerOptions;
      break;
    default:
      getter = getCountriesOptions;
  }

  getter(filterString).then((items: any) => {
    let count = 0;
    if (req.body.filter_type === "sectors") {
      count = items.dac3.length + items.dac5.length;
    } else {
      count = items.length;
    }
    res.json({
      count,
      data: items
    });
  });
}
