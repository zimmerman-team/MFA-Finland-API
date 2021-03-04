import get from "lodash/get";
import find from "lodash/find";
import { countries } from "../static/countries";
import { dac3sectors } from "../static/dac3sectors";
import { dac5sectors } from "../static/dac5sectors";

interface ResultModel {
  name: string;
  link: string;
}

export function getActivities(rawData: any) {
  return rawData.map((item: any) => ({
    name: get(item, "title_narrative_text[0]", ""),
    link: `/project/${encodeURIComponent(get(item, "iati_identifier", ""))}`
  }));
}

export function getCountries(rawData: any) {
  let result: ResultModel[] = [];

  rawData.forEach((item: any) => {
    const fCountry = find(countries, { code: item.val });
    if (fCountry) {
      result.push({
        name: fCountry.name,
        link: `/countries/${fCountry.code}`
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
      link: `/organisations/${item.val}`
    });
  });

  return result;
}

export function getSectors(rawData: any) {
  const result: ResultModel[] = [];

  rawData.forEach((item: any) => {
    const fSector = find([...dac3sectors, ...dac5sectors], { code: item.val });
    if (fSector) {
      result.push({
        name: fSector.name,
        link: `/sectors/${item.val}`
      });
    }
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
