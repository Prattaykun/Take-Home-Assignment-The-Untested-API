# Bug Report

## 1. Pagination skipped the first page
- Expected: `GET /tasks?page=1&limit=2` should return the first two tasks.
- Actual: page 1 started at index `page * limit`, so the first page skipped ahead and returned the wrong slice.
- How I found it: a route test with three seeded tasks expected the first page to include the first two items and failed before the fix.
- Fix: change the offset calculation to `(page - 1) * limit` in `src/services/taskService.js`.

## 2. Status filtering matched substrings instead of exact statuses
- Expected: filtering by `status=todo` should only return tasks whose status is exactly `todo`.
- Actual: the code used `includes`, so unrelated partial matches could leak into the response.
- How I found it: a service test asserted exact status filtering and showed the current implementation was too loose.
- Fix: compare status with strict equality in `src/services/taskService.js`.

## 3. Assign endpoint did not exist
- Expected: `PATCH /tasks/:id/assign` should accept an assignee string and return the updated task.
- Actual: the route was missing entirely.
- How I found it: the API reference in `ASSIGNMENT.md` listed the endpoint, but the router had no matching handler.
- Fix: add a new route in `src/routes/tasks.js`, plus service and validation support.