const mongoose = require("mongoose");

const filterOptionSchema = {
  name: { type: String, required: true },
  code: { type: String, required: true }
};

const filtersSchema = new mongoose.Schema({
  countries: [filterOptionSchema],
  regions: [filterOptionSchema],
  sectors: {
    dac3: [filterOptionSchema],
    dac5: [filterOptionSchema]
  },
  donors: [filterOptionSchema],
  organisations: [filterOptionSchema],
  publishers: [filterOptionSchema],
  activitystatus: [filterOptionSchema]
});

module.exports = mongoose.model("filtersSchema", filtersSchema);

module.exports.get = (callback: any, limit: any) => {
  filtersSchema.find(callback).limit(limit);
};
