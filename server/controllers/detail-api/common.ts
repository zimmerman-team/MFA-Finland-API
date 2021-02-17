import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import querystring from "querystring";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";
import { findIndex } from "lodash";
import { thematicAreaNames } from "../../static/thematicAreaConsts";
import { orgTypesCodelist } from "../../static/orgTypesCodelist";

export function detailPageName(req: any, res: any) {
  const values = {
    q: getFormattedFilters(req.body.filters),
    fl:
      "participating_org_ref,participating_org_narrative,recipient_region_code,recipient_region_name,sector_code",
    rows: 1
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
    .then(response => {
      const data = get(response.data, "response.docs[0]", null);
      let result = "";
      if (req.body.filters && data) {
        if (req.body.filters.participating_org_ref) {
          const refIndex = findIndex(
            data.participating_org_ref,
            (ref: string) => ref === req.body.filters.participating_org_ref[0]
          );
          result = get(data, `participating_org_narrative[${refIndex}]`, "");
        }
        if (req.body.filters.recipient_region_code) {
          const refIndex = findIndex(
            data.recipient_region_code,
            (ref: string) => ref === req.body.filters.recipient_region_code[0]
          );
          result = get(data, `recipient_region_name[${refIndex}]`, "");
        }
        if (req.body.filters.sector_code) {
          result = data.sector_code;
        }
        if (req.body.filters.tag_code) {
          result = get(thematicAreaNames, req.body.filters.tag_code[0], "");
        }
        if (req.body.filters.participating_org_type) {
          result = get(
            find(orgTypesCodelist, {
              code: req.body.filters.participating_org_type[0]
            }),
            "name",
            ""
          );
        }
      }
      res.json({
        data: [result]
      });
    })
    .catch(errors => {
      genericError(errors, res);
    });
}
