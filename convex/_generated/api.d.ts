/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as classes from "../classes.js";
import type * as files from "../files.js";
import type * as schedule from "../schedule.js";
import type * as students from "../students.js";
import type * as submissions from "../submissions.js";
import type * as tasks from "../tasks.js";
import type * as teachers from "../teachers.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  classes: typeof classes;
  files: typeof files;
  schedule: typeof schedule;
  students: typeof students;
  submissions: typeof submissions;
  tasks: typeof tasks;
  teachers: typeof teachers;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
