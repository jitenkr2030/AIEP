import { i } from "@instantdb/core";

const _schema = i.schema({
  entities: {
    "portalusers": i.entity({
      "name": i.string().optional(),
      "email": i.string().optional(),
      "phone": i.string().optional(),
      "roll": i.string().optional(),
      "tier": i.string().optional(),
      "joined": i.string().optional(),
    }),
    "results": i.entity({
      "name": i.string().optional(),
      "email": i.string().optional(),
      "roll": i.string().optional(),
      "exam": i.string().optional(),
      "paper": i.string().optional(),
      "score": i.number().optional(),
      "total": i.number().optional(),
      "pct": i.number().optional(),
      "date": i.string().optional(),
    }),
    "vouchers": i.entity({
      "desc": i.string().optional(),
      "used": i.number().optional(),
      "max": i.number().optional(),
      "tier": i.string().optional(),
    }),
    "facultyq": i.entity({
      "paperKey": i.string().optional(),
      "count": i.number().optional(),
      "questions": i.string().optional(),
      "updated": i.string().optional(),
    }),
    "logs": i.entity({
      "action": i.string().optional(),
      "time": i.string().optional(),
    }),
    "adminconfig": i.entity({
      "username": i.string().optional(),
      "updated": i.string().optional(),
    }),
  },
});

export default _schema;
