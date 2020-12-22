import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { sortKeys } from "../../static/sortKeys";
import { genericError } from "../../utils/general";
import { getQuery } from "../../utils/filters";
import { donorsSearchFields } from "../../static/globalSearchFields";

export function donorsTable(req: any, res: any) {
  const limit = get(req.body, "rows", 10);
  const offset = get(req.body, "page", 0) * limit;
  const sort: string = get(
    sortKeys,
    `[${get(req.body, "sort", "Activities count desc")}]`,
    ""
  );
  const filters: any = get(req.body, "filters", {});
  const search: string = get(req.body, "search", "");

  const values = {
    q: getQuery(filters, search, donorsSearchFields),
    "json.facet": JSON.stringify({
      items: {
        type: "terms",
        field: "transaction_provider_org_ref",
        sort,
        limit,
        offset,
        missing: true,
        numBuckets: true,
        facet: {
          sub: {
            type: "terms",
            field: "transaction_provider_org_narrative",
            limit: 1
          }
        }
      }
    }),
    rows: 0
  };

  axios
    .get(
      `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
        values,
        "&",
        "=",
        {
          encodeURIComponent: (str: string) => str
        }
      )}`
    )
    .then(call1Response => {
      const count = get(call1Response, "data.facets.items.numBuckets", 0);
      const actualData = get(call1Response, "data.facets.items.buckets", []);
      const result = actualData.map((item: any) => [
        item.val.toUpperCase(),
        [item.val.toUpperCase(), get(item, "sub.buckets[0].val", "")],
        item.count
      ]);
      res.json({
        count,
        data: result
      });
    })
    .catch(error1 => {
      genericError(error1, res);
    });
}

// export function donorsTable(req: any, res: any) {
//   const limit = get(req.body, "rows", 10);
//   const offset = get(req.body, "page", 0) * limit;
//   const sort: string = get(
//     sortKeys,
//     `[${get(req.body, "sort", "Activities count desc")}]`,
//     ""
//   );
//   const values = {
//     q: getFormattedFilters(get(req.body, "filters", {})),
//     "json.facet": JSON.stringify({
//       items: {
//         type: "terms",
//         field: "participating_org_role",
//         limit: 1,
//         facet: {
//           sub: {
//             type: "terms",
//             field: "participating_org_narrative",
//             sort,
//             limit,
//             offset,
//             missing: true,
//             numBuckets: true,
//             facet: {
//               sub2: {
//                 type: "terms",
//                 field: "participating_org_ref",
//                 limit: 1,
//               },
//             },
//           },
//         },
//       },
//     }),
//     rows: 0,
//   };
//   axios
//     .get(
//       `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
//         values,
//         "&",
//         "=",
//         {
//           encodeURIComponent: (str: string) => str,
//         }
//       )}`
//     )
//     .then((call1Response) => {
//       const count = get(
//         call1Response,
//         "data.facets.items.buckets[0].sub.numBuckets",
//         0
//       );
//       const actualData = get(
//         call1Response,
//         "data.facets.items.buckets[0].sub.buckets",
//         []
//       );
//       const result = actualData.map((item: any) => [
//         get(item, "sub2.buckets[0].val", "").toUpperCase(),
//         [get(item, "sub2.buckets[0].val", "").toUpperCase(), item.val],
//         item.count,
//       ]);
//       res.json({
//         count,
//         data: result,
//       });
//     })
//     .catch((error1) => {
//       genericError(error1, res);
//     });
// }
