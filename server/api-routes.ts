const router = require("express").Router();

// global search
const DonorsSearchController = require("./controllers/search-api/donors");
const CountriesSearchController = require("./controllers/search-api/countries");
const ActivitiesSearchController = require("./controllers/search-api/activities");
const PublishersSearchController = require("./controllers/search-api/publishers");
const OrganisationsSearchController = require("./controllers/search-api/organisations");

// filter options
const FilterOptionsController = require("./controllers/filter-api");

// viz
const GeoController = require("./controllers/viz-api/GeoController");
const LineController = require("./controllers/viz-api/LineController");
const TreemapController = require("./controllers/viz-api/TreemapController");
const SunburstController = require("./controllers/viz-api/SunburstController");

// table
const DonorsTableController = require("./controllers/table-api/DonorsController");
const SectorsTableController = require("./controllers/table-api/SectorsController");
const CountriesTableController = require("./controllers/table-api/CountriesController");
const ActivitiesTableController = require("./controllers/table-api/ActivitiesController");
const PublishersTableController = require("./controllers/table-api/PublishersController");
const OrganisationsTableController = require("./controllers/table-api/OrganisationsController");

// detail pages
const CountryDetailController = require("./controllers/detail-api/country");
const DonorDetailController = require("./controllers/detail-api/donor");
const PublisherDetailController = require("./controllers/detail-api/publisher");
const OrganisationDetailController = require("./controllers/detail-api/organisation");
const ActivityDetailController = require("./controllers/detail-api/activity");

router.get("/", (req: any, res: any) => {
  res.json({ status: 200, message: "api working" });
});

router.get("/redirectToHome", (req: any, res: any) => {
  res.redirect(`${process.env.PROJECT_URL}/`);
});

// global search
router
  .route("/search/activities")
  .post(ActivitiesSearchController.searchActivities);
router
  .route("/search/countries")
  .post(CountriesSearchController.searchCountries);
router
  .route("/search/organisations")
  .post(OrganisationsSearchController.searchOrganisations);
router
  .route("/search/publishers")
  .post(PublishersSearchController.searchPublishers);
router.route("/search/donors").post(DonorsSearchController.searchDonors);

// filter options
router
  .route("/dynamic-filter-options")
  .post(FilterOptionsController.dynamicFilterOptions);
router
  .route("/filter-group-options")
  .post(FilterOptionsController.getFilterGroupOptions);

// viz
router.route("/geo/activities").post(GeoController.activitiesGeoChart);
router.route("/geo/donors").post(GeoController.donorsGeoChart);
router.route("/geo/publishers").post(GeoController.publishersGeoChart);
router.route("/line").post(LineController.basicLineChart);
router.route("/treemap").post(TreemapController.basicTreemapChart);
router.route("/sunburst").post(SunburstController.basicSunburstChart);
router.route("/donors-treemap").post(TreemapController.donorsTreemapChart);

// table
router.route("/donors").post(DonorsTableController.donorsTable);
router.route("/sectors").post(SectorsTableController.sectorsTable);
router.route("/countries").post(CountriesTableController.countriesTable);
router.route("/activities").post(ActivitiesTableController.activitiesTable);
router
  .route("/activities-new")
  .post(ActivitiesTableController.activitiesTableNew);
router.route("/publishers").post(PublishersTableController.publishersTable);
router
  .route("/organisations")
  .post(OrganisationsTableController.organisationsTable);

// detail pages
router.route("/country-detail").post(CountryDetailController.countryDetail);
router.route("/donor-detail").post(DonorDetailController.donorDetail);
router
  .route("/publisher-detail")
  .post(PublisherDetailController.publisherDetail);
router
  .route("/organisation-detail")
  .post(OrganisationDetailController.organisationDetail);
router.route("/activity-detail").post(ActivityDetailController.activityDetail);

module.exports = router;

export {};
