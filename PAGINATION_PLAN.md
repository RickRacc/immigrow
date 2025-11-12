# Pagination Implementation Plan

## Overview
Implementing pagination for all 3 model pages (Events, Resources, Organizations) to meet Phase 2 rubric requirements.

## Rubric Requirements
- How many instances are there? (Already showing total count)
- How many instances per page? (Display "Displaying 15 events/resources/orgs")
- How many pages are there? (Display "Page X of Y")
- What page are you on? (Display current page number)
- Navigation: Go to first page, last page, next page, previous page

## Implementation Strategy

### Phase 1: Backend API Changes
**File: `backend/app.py`**

Modify three endpoints to support pagination:
- `/api/orgs?page=1&per_page=15`
- `/api/events?page=1&per_page=15`
- `/api/resources?page=1&per_page=15`

**Query Parameters:**
- `page` (default: 1) - Current page number
- `per_page` (default: 15) - Items per page

**Response Format:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "per_page": 15,
  "total_pages": 7
}
```

**Implementation:**
- Use SQLAlchemy's `.paginate(page=page, per_page=per_page, error_out=False)`
- Maintain backward compatibility (no params = page 1, 15 per page)
- Calculate total_pages: `math.ceil(total / per_page)`

### Phase 2: Backend Testing
**File: `backend/test_app.py`**

Add 3 new test functions:
1. `test_get_orgs_paginated()` - Verify pagination metadata and data structure
2. `test_get_events_paginated()` - Test page navigation (page 1 vs page 2)
3. `test_get_resources_paginated()` - Verify per_page parameter works

**Existing Tests:**
- All 6 existing tests should continue to pass (backward compatibility)

### Phase 3: Postman API Testing
**File: `inmigo_collection.json`**

Add 3 new requests:
1. `GET /api/orgs?page=1&per_page=15` with test script
2. `GET /api/events?page=1&per_page=15` with test script
3. `GET /api/resources?page=1&per_page=15` with test script

**Test Assertions:**
- Response has `data`, `total`, `page`, `per_page`, `total_pages` fields
- `data` is an array with max 15 items
- Pagination metadata is correct

### Phase 4: Frontend - Pagination Component
**File: `frontend/src/components/Pagination.jsx`**

Create reusable pagination component with props:
```jsx
<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(newPage) => ...}
  itemType="events" // or "resources" or "organizations"
/>
```

**UI Elements:**
1. Text: "Displaying 15 {itemType}"
2. Text: "Page {currentPage} of {totalPages}"
3. Buttons: `First | Previous | Next | Last`
4. Button states:
   - Disable First/Previous when on page 1
   - Disable Next/Last when on last page

### Phase 5: Frontend - API Layer
**File: `frontend/src/lib/api.js`**

Update fetch functions to accept pagination params:
```javascript
export async function fetchOrgs(page = 1, perPage = 15) {
  return fetchJson(`/orgs?page=${page}&per_page=${perPage}`);
}
// Similar for fetchEvents() and fetchResources()
```

### Phase 6: Frontend - Model Pages Integration
**Files to Update:**
- `frontend/src/pages/Events.jsx`
- `frontend/src/pages/Resources.jsx`
- `frontend/src/pages/Orgs.jsx`

**Changes for Each Page:**
1. Add state: `const [currentPage, setCurrentPage] = useState(1);`
2. Add state: `const [totalPages, setTotalPages] = useState(1);`
3. Add state: `const [total, setTotal] = useState(0);`
4. Update API call to use pagination params
5. Parse response to extract `data`, `total`, `total_pages`
6. Update header to show total count
7. Add `<Pagination>` component below the grid
8. Handle page changes with `useEffect` to reload data

### Phase 7: Testing & Verification
**Frontend Unit Tests:**
- Run: `npm test`
- Verify all 10 tests pass
- No changes needed (tests don't depend on pagination)

**Frontend Acceptance Tests:**
- Run: `node frontend/src/tests/run-all.js`
- Verify all 10 Selenium tests pass
- Tests should still find `.card` elements (pagination doesn't affect this)

**Backend Tests:**
- Run: `pytest backend/test_app.py -v`
- Verify all tests pass (6 existing + 3 new = 9 tests)

## Commit Strategy
Each phase can be committed independently:

1. **Commit 1:** Documentation (`PAGINATION_PLAN.md`)
2. **Commit 2:** Backend API changes (`backend/app.py`)
3. **Commit 3:** Backend tests (`backend/test_app.py`)
4. **Commit 4:** Postman collection (`inmigo_collection.json`)
5. **Commit 5:** Frontend Pagination component (`frontend/src/components/Pagination.jsx`)
6. **Commit 6:** Frontend API layer (`frontend/src/lib/api.js`)
7. **Commit 7:** Frontend Events page (`frontend/src/pages/Events.jsx`)
8. **Commit 8:** Frontend Resources page (`frontend/src/pages/Resources.jsx`)
9. **Commit 9:** Frontend Orgs page (`frontend/src/pages/Orgs.jsx`)
10. **Commit 10:** Final verification and test results

## Expected Outcomes
- ✅ Rubric requirement: Show instances per page (15 items displayed)
- ✅ Rubric requirement: Show total pages and current page
- ✅ Rubric requirement: Navigate to first/last/prev/next page
- ✅ Maintain all existing test coverage
- ✅ Add new test coverage for pagination
- ✅ Backward compatible API (optional query params)
