# Submission Notes

## What I changed
- Added unit tests for `src/services/taskService.js` and integration tests for the task routes.
- Fixed pagination and exact status filtering in the service layer.
- Implemented `PATCH /tasks/:id/assign` with validation for empty assignees.

## What I would test next
- I would add more validation coverage for malformed `dueDate` values and partial update combinations.
- I would also add tests around how assignment should behave if the API later needs to support clearing an assignee.

## What surprised me
- Pagination was off by one in the service layer, so `page=1` skipped the first page entirely.
- The status filter used substring matching, which is looser than the API contract implies.

## Questions before production
- Should assignment be allowed to overwrite an existing assignee, or should that require an explicit unassign flow?
- Should invalid fields in `PUT /tasks/:id` be rejected more strictly, or ignored as they are now?