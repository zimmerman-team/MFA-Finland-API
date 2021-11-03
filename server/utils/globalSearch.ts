import get from "lodash/get";
import find from "lodash/find";
import { translatedCountries } from "../static/countries";
import { sectorTranslations } from "../static/sectorTranslations";

interface ResultModel {
  link: string;
  name: string;
  name_fi?: string;
  name_se?: string;
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
    const fCountry = find(translatedCountries, { code: item.val });
    if (fCountry) {
      result.push({
        link: `/countries/${fCountry.code}`,
        name: get(fCountry, "info.name", item.val),
        name_fi: get(fCountry, "info.name_fi", item.val),
        name_se: get(fCountry, "info.name_se", item.val)
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
    const fSector = find(sectorTranslations, { code: parseInt(item.val, 10) });
    if (fSector) {
      result.push({
        link: `/sectors/${item.val}`,
        name: get(fSector, "info.name", item.val),
        name_fi: get(fSector, "info.name_fi", item.val),
        name_se: get(fSector, "info.name_se", item.val)
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
