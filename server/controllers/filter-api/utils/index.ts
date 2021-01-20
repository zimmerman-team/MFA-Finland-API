import get from "lodash/get";
import find from "lodash/find";
import filter from "lodash/filter";
import orderBy from "lodash/orderBy";
import { countries } from "../../../static/countries";
import { orgDacChannel } from "../../../static/orgDacChannel";

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

export function formatOrganisationsOptions(rawData: any) {
  const result: any[] = [];

  const categories = filter(
    orgDacChannel,
    (item: any) => item.channel_id === item.channel_category
  );

  categories.forEach((category: any) => {
    const children = filter(orgDacChannel, {
      channel_category: category.channel_id
    });
    result.push({
      name: category.name,
      code: category.channel_id.toString(),
      children: filter(children, (item: any) =>
        find(rawData, { val: item.channel_id.toString() })
      ).map((item: any) => ({
        name: item.name,
        code: item.channel_id.toString()
      }))
    });
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

export function formatOrgOptions(rawData: any, codelistData: any) {
  const result: OptionModel[] = [];

  rawData.forEach((item: any) => {
    const fOption = find(
      codelistData,
      (org: any) => org.code.toLowerCase() === item.val.toLowerCase()
    );
    if (fOption) {
      result.push({
        name: fOption.name,
        code: fOption.code
      });
    } else if (
      item.val.length > 1 &&
      item.val[0] !== "(" &&
      item.val[0] !== "&"
    ) {
      result.push({
        name: item.val,
        code: item.val
      });
    }
  });

  return orderBy(result, "name", "asc");
}
