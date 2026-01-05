
export const LABELS = {
    SEARCH: 'SEARCH',
    DETAIL: 'DETAIL',
};

export const BASE_URL = 'https://www.linkedin.com/jobs/search';

export const SEARCH_URL_PARAMS = {
    location: 'Nepal',
    f_TPR: 'r604800', // Past week
};

export const SELECTORS = {
    // Search Page
    JOB_CARD: '.base-card',
    JOB_CARD_LINK: '.base-card__full-link',
    JOB_TITLE: '.base-search-card__title',
    JOB_COMPANY: '.base-search-card__subtitle',
    JOB_LOCATION: '.job-search-card__location',
    JOB_ID_ATTR: 'data-entity-urn',

    // Detail Page
    DETAIL_TITLE: '.top-card-layout__title',
    DETAIL_COMPANY: '.top-card-layout__second-sub-line .top-card-layout__first-sub-line-item',
    DETAIL_LOCATION: '.top-card-layout__first-sub-line .top-card-layout__second-sub-line-item',
    DETAIL_DESCRIPTION: '.description__text',
    DETAIL_POSTED_TIME: '.posted-time-ago__text',
    DETAIL_CRITERIA_LIST: '.description__job-criteria-list',
    DETAIL_CRITERIA_ITEM: '.description__job-criteria-item',
    DETAIL_CRITERIA_HEADER: '.description__job-criteria-subheader',
    DETAIL_CRITERIA_TEXT: '.description__job-criteria-text',

    // Fallback/Legacy Selectors (sometimes LinkedIn serves different HTML)
    LEGACY_TITLE: 'h1',
};
