import get from "lodash/get";
import find from "lodash/find";
import orderBy from "lodash/orderBy";
import { countries } from "../../../static/countries";

interface OptionModel {
  name: string;
  code: string;
}

interface SectorOptionsModel {
  dac3: OptionModel[];
  dac5: OptionModel[];
}

export function formatCountryOptions(rawData: any) {
  let result: OptionModel[] = [];

  rawData.forEach((item: any) => {
    const fCountry = find(countries, { code: item.val });
    if (fCountry) {
      result.push({
        name: fCountry.name,
        code: fCountry.code
      });
    }
  });

  return orderBy(result, "name", "asc");
}

export function formatRegionOptions(rawData: any) {
  const result: OptionModel[] = [];

  rawData.forEach((item: any) => {
    result.push({
      name: get(item, "sub.buckets[0].val", item.val.toUpperCase()),
      code: item.val
    });
  });

  return orderBy(result, "name", "asc");
}

export function formatSectorOptions(rawData: any) {
  const result: SectorOptionsModel = {
    dac3: [],
    dac5: []
  };

  rawData.forEach((item: any) => {
    if (item.code.length === 3) {
      result.dac3.push(item);
    } else if (item.code.length === 5) {
      result.dac5.push(item);
    }
    // item.children.forEach((child: any) => {
    //   result.dac3.push({
    //     name: child.title,
    //     code: child.code
    //   });
    //   if (child.children) {
    //     child.children.forEach((gchild: any) => {
    //       result.dac5.push({
    //         name: gchild.title,
    //         code: gchild.code
    //       });
    //     });
    //   }
    // });
  });

  result.dac3 = orderBy(result.dac3, "name", "asc");
  result.dac5 = orderBy(result.dac5, "name", "asc");

  return result;
}

// export function formatDonorOptions(rawData: any) {
//   const result: OptionModel[] = [];

//   rawData.forEach((item: any) => {
//     result.push({
//       name: get(item, "sub.buckets[0].val", item.val.toUpperCase()),
//       code: item.val.toUpperCase(),
//     });
//   });

//   return orderBy(result, "name", "asc");
// }

export function formatOrganisationsOptions(rawData: any, codelistData: any) {
  const result: OptionModel[] = [];

  rawData.forEach((item: any) => {
    const fOrg = find(
      codelistData,
      (org: any) => org.code.toLowerCase() === item.val.toLowerCase()
    );
    if (fOrg) {
      result.push({
        name: fOrg.name,
        code: fOrg.code.toUpperCase()
      });
    }
  });

  return orderBy(result, "name", "asc");
}

export function formatPublishersOptions(rawData: any) {
  const result: OptionModel[] = [];

  rawData.forEach((item: any) => {
    result.push({
      name: get(item, "sub.buckets[0].val", item.val.toUpperCase()),
      code: item.val.toUpperCase()
    });
  });

  return orderBy(result, "name", "asc");
}

export function formatActivituStatusOptions(rawData: any, codelistData: any) {
  const result: OptionModel[] = [];

  rawData.forEach((item: any) => {
    const fOption = find(codelistData, (org: any) => org.code === item.val);
    if (fOption) {
      result.push({
        name: fOption.name,
        code: fOption.code
      });
    }
  });

  return orderBy(result, "name", "asc");
}
