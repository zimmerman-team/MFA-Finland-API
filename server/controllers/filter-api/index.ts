import get from "lodash/get";
import { getFormattedFilters } from "../../utils/filters";

// controllers
import { getDonorsOptions } from "../../controllers/filter-api/utils/donors";
import { getSectorsOptions } from "../../controllers/filter-api/utils/sectors";
import { getRegionsOptions } from "../../controllers/filter-api/utils/regions";
import { getCountriesOptions } from "../../controllers/filter-api/utils/countries";
import { getPublishersOptions } from "../../controllers/filter-api/utils/publishers";
import { getOrganisationsOptions } from "../../controllers/filter-api/utils/organisations";
import { getActivituStatusOptions } from "../../controllers/filter-api/utils/activitystatus";

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
