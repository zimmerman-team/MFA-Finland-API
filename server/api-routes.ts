const router = require("express").Router();

// global search
const DonorsSearchController = require("./controllers/search-api/donors");
const SectorsSearchController = require("./controllers/search-api/sectors");
const CountriesSearchController = require("./controllers/search-api/countries");
const ActivitiesSearchController = require("./controllers/search-api/activities");
const OrganisationsSearchController = require("./controllers/search-api/organisations");
const ThematicAreasSearchController = require("./controllers/search-api/thematicareas");

// filter options
const FilterOptionsController = require("./controllers/filter-api");

// viz
const BarController = require("./controllers/viz-api/BarController");
const SDGController = require("./controllers/viz-api/SDGController");
const GeoController = require("./controllers/viz-api/GeoController");
const TreemapController = require("./controllers/viz-api/TreemapController");
const SunburstController = require("./controllers/viz-api/SunburstController");
const ThematicAreaController = require("./controllers/viz-api/ThematicAreaController");

// table
const ActivitiesTableController = require("./controllers/table-api/ActivitiesController");

// detail pages
const ActivityDetailController = require("./controllers/detail-api/activity");
const DetailCommonController = require("./controllers/detail-api/common");

// feedback
const FeedbackController = require("./controllers/feedback-api");

router.get("/", (req: any, res: any) => {
  res.json({ status: 200, message: "api working" });
});

router.get("/redirectToHome", (req: any, res: any) => {
  res.redirect(`${process.env.PROJECT_URL}/`);
});

/* FILTER OPTIONS */

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
router.route("/search/sectors").post(SectorsSearchController.searchSectors);
router
  .route("/search/thematic-areas")
  .post(ThematicAreasSearchController.searchThematicareas);

/* FILTER OPTIONS */

router
  .route("/filter-group-options")
  .post(FilterOptionsController.getFilterGroupOptions);

router.route("/detail-page-name").post(DetailCommonController.detailPageName);

/* VIZ */

// Geomap
router.route("/geo").post(GeoController.geoChart);

// Sectors sunburst/donut
router.route("/sunburst").post(SunburstController.basicSunburstChart);

router.route("/oda").post(BarController.ODAbarChart);

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

// Thematic Areas circular viz
router.route("/thematic-areas").post(ThematicAreaController.thematicAreasChart);

// SDGs viz
router.route("/sdgs").post(SDGController.SDGViz);

/* TABLE */

// Activities table
router.route("/activities").post(ActivitiesTableController.activitiesTable);

router
  .route("/activities-simple-table")
  .post(ActivitiesTableController.simpleActivitiesTable);

router.route("/activity-detail").post(ActivityDetailController.activityDetail);
router.route("/feedback").post(FeedbackController.sendMail);

module.exports = router;

export {};
