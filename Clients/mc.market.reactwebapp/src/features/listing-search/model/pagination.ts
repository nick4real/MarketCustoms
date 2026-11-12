interface PageAvailability {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const shouldShowPagination = (page: PageAvailability) =>
  page.hasPreviousPage || page.hasNextPage;
