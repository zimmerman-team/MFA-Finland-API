import {
  AF_ACTIVITY_DATE_END_ACTUAL,
  AF_ACTIVITY_DATE_START_ACTUAL,
  AF_ACTIVITY_STATUS_CODE
} from "./apiFilterFields";

export const sortKeys = {
  "Start date asc": `${AF_ACTIVITY_DATE_START_ACTUAL} asc`,
  "Start date desc": `${AF_ACTIVITY_DATE_START_ACTUAL} desc`,
  "End date asc": `${AF_ACTIVITY_DATE_END_ACTUAL} asc`,
  "End date desc": `${AF_ACTIVITY_DATE_END_ACTUAL} desc`,
  "Status asc": `${AF_ACTIVITY_STATUS_CODE} asc`,
  "Status desc": `${AF_ACTIVITY_STATUS_CODE} desc`,
  "Organisation asc": "index asc",
  "Organisation desc": "index desc",
  "Publisher asc": "index asc",
  "Publisher desc": "index desc",
  "Donor asc": "index asc",
  "Donor desc": "index desc",
  "Activities count asc": "count asc",
  "Activities count desc": "count desc",
  "IATI ref asc": "index asc",
  "IATI ref desc": "index desc"
};
