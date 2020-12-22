import get from "lodash/get";
import find from "lodash/find";
import { countries } from "../static/countries";

interface ResultModel {
  name: string;
  link: string;
}

export function getActivities(rawData: any) {
  return rawData.map((item: any) => ({
    name: get(item, "title_narrative_text[0]", ""),
    link: `/activity/${encodeURIComponent(get(item, "iati_identifier", ""))}`
  }));
}

export function getCountries(rawData: any) {
  let result: ResultModel[] = [];

  rawData.forEach((item: any) => {
    const fCountry = find(countries, { code: item.val });
    if (fCountry) {
      result.push({
        name: fCountry.name,
        link: `/country/${fCountry.name}/overview`
      });
    }
  });

  return result;
}

export function getOrganisations(rawData: any, codelistData: any) {
  let result: ResultModel[] = [];

  rawData.forEach((item: any) => {
    const fOrg = find(
      codelistData,
      (org: any) => org.code.toLowerCase() === item.val.toLowerCase()
    );
    result.push({
      name: get(fOrg, "name", item.val.toUpperCase()),
      link: `/organisation/${item.val}/overview`
    });
  });

  return result;
}

export function getPublishers(rawData: any) {
  const result: ResultModel[] = [];

  rawData.forEach((item: any) => {
    result.push({
      name: get(item, "sub.buckets[0].val", item.val.toUpperCase()),
      link: `/publisher/${item.val}/overview`
    });
  });

  return result;
}

export function getDonors(rawData: any) {
  const result: ResultModel[] = [];

  rawData.forEach((item: any) => {
    result.push({
      name: get(item, "sub.buckets[0].val", item.val.toUpperCase()),
      link: `/donor/${item.val}/overview`
    });
  });

  return result;
}
