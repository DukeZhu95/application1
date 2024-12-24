import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    classrooms: defineTable({
        code: v.string(),
        teacherId: v.string(),
        name: v.optional(v.string()),
        createdAt: v.number(),
        students: v.array(v.string()),
    })
        .index("by_code", ["code"])
        .searchIndex("by_student", {
            searchField: "students",
            filterFields: ["students"]
        })  // 使用 searchIndex 来替代普通的 index
});