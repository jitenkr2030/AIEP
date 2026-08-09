// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/core";

const rules = {
  logs: {
    allow: {
      view: "true",
      create: "true",
      delete: "true",
      update: "true",
    },
  },
  results: {
    allow: {
      view: "true",
      create: "true",
      delete: "true",
      update: "true",
    },
  },
  facultyq: {
    allow: {
      view: "true",
      create: "true",
      delete: "true",
      update: "true",
    },
  },
  vouchers: {
    allow: {
      view: "true",
      create: "true",
      delete: "true",
      update: "true",
    },
  },
  adminconfig: {
    allow: {
      view: "true",
      create: "true",
      delete: "true",
      update: "true",
    },
  },
  portalusers: {
    allow: {
      view: "true",
      create: "true",
      delete: "true",
      update: "true",
    },
  },
} satisfies InstantRules;

export default rules;
