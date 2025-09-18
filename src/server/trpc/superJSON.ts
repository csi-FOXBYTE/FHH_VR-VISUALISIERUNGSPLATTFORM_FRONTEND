import SuperJSON from "superjson";

SuperJSON.registerCustom<Date, string>(
  {
    isApplicable: (v): v is Date => {
      const isApplicable = typeof v?.["toISOString"] === "function";
      return isApplicable;
    },
    serialize: (v) => {
      return v.toISOString();
    },
    deserialize: (v) => {
      return new Date(v);
    },
  },
  "customDate"
);

export default SuperJSON;
