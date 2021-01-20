const router = require("express").Router();

// global search
const DonorsSearchController = require("./controllers/search-api/donors");
const CountriesSearchController = require("./controllers/search-api/countries");
const ActivitiesSearchController = require("./controllers/search-api/activities");
const OrganisationsSearchController = require("./controllers/search-api/organisations");

// filter options
const FilterOptionsController = require("./controllers/filter-api");

// viz
const BarController = require("./controllers/viz-api/BarController");
const GeoController = require("./controllers/viz-api/GeoController");
// const LineController = require("./controllers/viz-api/LineController");
const TreemapController = require("./controllers/viz-api/TreemapController");
const SunburstController = require("./controllers/viz-api/SunburstController");

// table
// const DonorsTableController = require("./controllers/table-api/DonorsController");
// const SectorsTableController = require("./controllers/table-api/SectorsController");
// const CountriesTableController = require("./controllers/table-api/CountriesController");
const ActivitiesTableController = require("./controllers/table-api/ActivitiesController");
// const OrganisationsTableController = require("./controllers/table-api/OrganisationsController");

// detail pages
// const CountryDetailController = require("./controllers/detail-api/country");
// const DonorDetailController = require("./controllers/detail-api/donor");
// const OrganisationDetailController = require("./controllers/detail-api/organisation");
// const ActivityDetailController = require("./controllers/detail-api/activity");

router.get("/", (req: any, res: any) => {
  res.json({ status: 200, message: "api working" });
});

router.get("/redirectToHome", (req: any, res: any) => {
  res.redirect(`${process.env.PROJECT_URL}/`);
});

// SEARCH
router
  .route("/search/activities")
  .post(ActivitiesSearchController.searchActivities);
router
  .route("/search/countries")
  .post(CountriesSearchController.searchCountries);
router
  .route("/search/organisations")
  .post(OrganisationsSearchController.searchOrganisations);
router.route("/search/donors").post(DonorsSearchController.searchDonors);

/* FILTER OPTIONS */
router
  .route("/filter-group-options")
  .post(FilterOptionsController.getFilterGroupOptions);
// router
//   .route("/dynamic-filter-options")
//   .post(FilterOptionsController.dynamicFilterOptions);

/* VIZ */

// Geomap
router.route("/geo").post(GeoController.geoChart);

// Sectors sunburst/donut
router.route("/sunburst").post(SunburstController.basicSunburstChart);

// router.route("/line").post(LineController.basicLineChart);

// Activities treemap
router
  .route("/activities-treemap")
  .post(TreemapController.projectsTreemapChart);

// Locations treemap
router
  .route("/locations-treemap")
  .post(TreemapController.locationsTreemapChart);

// Organisations treemap
router
  .route("/organisations-treemap")
  .post(TreemapController.organisationsTreemapChart);

// Budget line bar chart
router.route("/budget-line-bar-chart").post(BarController.budgetLineBarChart);

/* TABLE */

// Activities table
router.route("/activities").post(ActivitiesTableController.activitiesTable);

// router.route("/donors").post(DonorsTableController.donorsTable);
// router.route("/sectors").post(SectorsTableController.sectorsTable);
// router.route("/countries").post(CountriesTableController.countriesTable);
// router
//   .route("/organisations")
//   .post(OrganisationsTableController.organisationsTable);

/* DETAIL PAGE */
// router.route("/country-detail").post(CountryDetailController.countryDetail);
// router.route("/donor-detail").post(DonorDetailController.donorDetail);
// router
//   .route("/organisation-detail")
//   .post(OrganisationDetailController.organisationDetail);
// router.route("/activity-detail").post(ActivityDetailController.activityDetail);

module.exports = router;

export {};
