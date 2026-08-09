import { i } from "@instantdb/core";

const _schema = i.schema({
  entities: {
    "portalusers": i.entity({
      "name": i.string(),
      "email": i.string(),
      "phone": i.string(),
      "roll": i.string(),
      "tier": i.string(),
      "joined": i.string(),
    }),
    "results": i.entity({
      "name": i.string(),
      "email": i.string(),
      "roll": i.string(),
      "exam": i.string(),
      "paper": i.string(),
      "score": i.number(),
      "total": i.number(),
      "pct": i.number(),
      "date": i.string(),
    }),
    "vouchers": i.entity({
      "desc": i.string(),
      "used": i.number(),
      "max": i.number(),
      "tier": i.string(),
    }),
    "facultyq": i.entity({
      "paperKey": i.string(),
      "count": i.number(),
      "questions": i.string(),
      "updated": i.string(),
    }),
    "logs": i.entity({
      "action": i.string(),
      "time": i.string(),
    }),
    "adminconfig": i.entity({
      "username": i.string(),
      "updated": i.string(),
    }),
  },
});

export default _schema;
