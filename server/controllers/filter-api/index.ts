import get from "lodash/get";
import { getFormattedFilters } from "../../utils/filters";

// controllers
import { getSDGOptions } from "../../controllers/filter-api/utils/sdgs";
import { getSectorsOptions } from "../../controllers/filter-api/utils/sectors";
import { getRegionsOptions } from "../../controllers/filter-api/utils/regions";
import { getCountriesOptions } from "../../controllers/filter-api/utils/countries";
import { getLocationsOptions } from "../../controllers/filter-api/utils/locations";
import { getBudgetLinesOptions } from "../../controllers/filter-api/utils/budgetlines";
import { getPolicyMarkerOptions } from "../../controllers/filter-api/utils/policymarker";
import { getThematicAreaOptions } from "../../controllers/filter-api/utils/thematicareas";
import { getOrganisationsOptions } from "../../controllers/filter-api/utils/organisations";
import { getDefaultAidTypeOptions } from "../../controllers/filter-api/utils/defaultaidtype";
import { getActivituStatusOptions } from "../../controllers/filter-api/utils/activitystatus";
import { getCollaborationTypeOptions } from "../../controllers/filter-api/utils/collaborationtype";

export async function getFilterGroupOptions(req: any, res: any) {
  const filters: any = get(req.body, "filters", {});
  const filterString = getFormattedFilters(filters, false, false, true);

  let getter = getCountriesOptions;

  switch (req.body.filter_type) {
    case "locations":
      getter = getLocationsOptions;
      break;
    case "regions":
      getter = getRegionsOptions;
      break;
    case "sectors":
      getter = getSectorsOptions;
      break;
    case "organisations":
      getter = getOrganisationsOptions;
      break;
    case "activitystatus":
      getter = getActivituStatusOptions;
      break;
    case "thematicareas":
      getter = getThematicAreaOptions;
      break;
    case "sdgs":
      getter = getSDGOptions;
      break;
    case "defaultaidtype":
      getter = getDefaultAidTypeOptions;
      break;
    case "policymarker":
      getter = getPolicyMarkerOptions;
      break;
    case "collaborationtype":
      getter = getCollaborationTypeOptions;
      break;
    case "budgetlines":
      getter = getBudgetLinesOptions;
      break;
    default:
      getter = getCountriesOptions;
  }

  getter(filterString).then((items: any) => {
    res.json({
      count: items.length,
      data: items
    });
  });
}
