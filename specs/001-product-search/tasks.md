---

description: "Task list template for feature implementation"
---

# Tasks: Product Search and Enhanced View

**Input**: Design documents from `/specs/001-product-search/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are not explicitly requested in the feature specification, so this task list focuses on implementation and validation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared data shapes and contract surfaces used by all product discovery stories

- [x] T001 [P] Update shared product display types in `Clients\mc.market.reactwebapp\models\product.ts` to carry category name, parameter summary, and detail metadata needed by the enhanced view.
- [x] T002 [P] Update product browse and detail contract models in `Services\Catalog\MC.Catalog.Domain\Views\ProductCatalogView.cs`, `Services\Catalog\MC.Catalog.Application\DTOs\ProductCatalogViewDto.cs`, and `Services\Catalog\MC.Catalog.Application\Responses\ProductDetailedResponse.cs` so the API can return the richer product data.
- [x] T003 Extend the product query model and validation in `Services\Catalog\MC.Catalog.Application\Models\ProductParams.cs` and `Services\Catalog\MC.Catalog.Application\Validators\ProductParamsValidator.cs` to represent name search and parameter filters.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend and client plumbing that MUST be complete before any user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement server-side product filtering and projection in `Services\Catalog\MC.Catalog.Infrastructure\Persistence\Repositories\ProductRepository.cs` so browse results can match trimmed product names and selected parameters across the catalog.
- [x] T005 Wire the catalog service and controller flow in `Services\Catalog\MC.Catalog.Application\Services\ProductService.cs`, `Services\Catalog\MC.Catalog.Application\Interfaces\Services\IProductService.cs`, and `Services\Catalog\MC.Catalog.API\Controllers\ProductsController.cs` to pass the expanded browse criteria through pagination and product lookup responses.
- [x] T006 [P] Update the React catalog API client in `Clients\mc.market.reactwebapp\src\api\products.ts` to request filtered catalog pages and map the expanded browse and detail payloads.

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Enhanced Product Catalog View (Priority: P1) 🎯 MVP

**Goal**: Make products easier to scan by showing richer product information in the catalog and detail views.

**Independent Test**: Open the home page, browse page, and a product detail page to confirm the product name, price, category context, and supporting metadata are easier to read at a glance.

### Implementation for User Story 1

- [x] T007 [P] [US1] Redesign the product card summary in `Clients\mc.market.reactwebapp\src\components\GridCard.tsx` to show the richer scan-friendly product fields.
- [x] T008 [US1] Update the product detail page in `Clients\mc.market.reactwebapp\src\pages\ProductDetail.tsx` to surface category context, parameter data, and clearer fallback states in the enhanced view.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Find Products by Name (Priority: P1)

**Goal**: Let users search products by name across the catalog instead of only filtering what is already loaded.

**Independent Test**: Search for a known product name and confirm matching products appear while unrelated products are excluded; clear the query and confirm the full browse list returns.

### Implementation for User Story 2

- [x] T009 [US2] Replace client-side browse filtering in `Clients\mc.market.reactwebapp\src\pages\Browse.tsx` with API-backed name search and URL-driven result state.
- [x] T010 [P] [US2] Update the search bar in `Clients\mc.market.reactwebapp\src\components\SearchBar.tsx` so submitted search terms round-trip through the browse URL and clear cleanly back to the catalog view.

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently

---

## Phase 5: User Story 3 - Filter by Product Parameters (Priority: P2)

**Goal**: Let users narrow products using the parameters each product has, and combine those filters with name search.

**Independent Test**: Apply one or more product parameter filters and confirm only matching products remain visible, even when combined with a name search.

### Implementation for User Story 3

- [x] T011 [P] [US3] Add a reusable product filter panel in `Clients\mc.market.reactwebapp\src\components\ProductFilters.tsx` for parameter-based narrowing.
- [x] T012 [US3] Wire `Clients\mc.market.reactwebapp\src\pages\Browse.tsx` to combine name search and parameter filters while preserving active filter state, counts, and empty-state messaging.

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across the discovery experience

- [x] T013 [P] Validate the updated discovery flow against `specs\001-product-search\quickstart.md` and fix any regressions in `Clients\mc.market.reactwebapp\src\pages\Browse.tsx` and `Clients\mc.market.reactwebapp\src\pages\ProductDetail.tsx`.
- [x] T014 [P] Run the frontend and catalog build validation for the changed files, then update `specs\001-product-search\tasks.md` markers after implementation is complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in priority order (P1 → P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Uses the same browse surface but remains independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Builds on the browse/search surface and remains independently testable

### Within Each User Story

- Shared contracts and query shapes before story-specific UI work
- Browser-facing state before presentation polish
- Core implementation before cross-cutting cleanup
- Story complete before moving to the next priority

### Parallel Opportunities

- Phase 1 tasks T001, T002, and T003 can run in parallel because they touch different contract/model files.
- Phase 2 task T006 can run in parallel with backend work once the query model is defined.
- In User Story 1, T007 can run in parallel with T008 because they touch different UI files.
- In User Story 2, T010 can run in parallel with T009 because the URL/search-bar contract can be updated separately from browse-state logic.
- In User Story 3, T011 can run in parallel with T012 once the filter-panel contract is agreed.

---

## Parallel Example: User Story 1

```text
Task: "Redesign the product card summary in Clients\mc.market.reactwebapp\src\components\GridCard.tsx"
Task: "Update the product detail page in Clients\mc.market.reactwebapp\src\pages\ProductDetail.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks all stories)
3. Complete Phase 3: User Story 1
4. Stop and validate the enhanced product view independently

### Incremental Delivery

1. Complete Setup + Foundational
2. Deliver User Story 1 as the first visible improvement
3. Add User Story 2 so name search works across the catalog
4. Add User Story 3 so users can narrow results by product parameters
5. Finish with polish and quickstart validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundation is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Merge story increments independently and validate each surface on its own

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify the browsing flow against the quickstart guide after implementation
- Avoid vague tasks, same-file conflicts, and cross-story dependencies that break independence
