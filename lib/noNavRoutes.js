// Pages that have their own top bar and therefore do NOT show the shop header (nav).
// Header.js and AccountPanel.js both read this one list, so they can never disagree.
// Add a new page of this kind here and nothing else needs to change.
export const NO_NAV_ROUTES = ['/contact', '/terms', '/refund-policy', '/privacy']
