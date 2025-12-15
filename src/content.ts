type RatingData = {
  Rating: number;
  ID: number;
  Title: string;
  TitleZH: string;
  TitleSlug: string;
  ContestSlug: string;
  ProblemIndex: string;
  ContestID_en: string;
  ContestID_zh: string;
};

const fetchRatingsData = async (): Promise<Record<number, RatingData>> => {
  let problemIdToDataMap: Record<number, RatingData> = {};
  try {
    const response = await fetch(
      'https://zerotrac.github.io/leetcode_problem_rating/data.json'
    );
    const data = (await response.json()) as RatingData[];
    problemIdToDataMap = data.reduce((acc, el) => {
      acc[el.ID] = el;
      return acc;
    }, problemIdToDataMap);
  } catch {
    console.error('Leetcode Ratings: Cannot fetch leetcode ratings');
  }
  return problemIdToDataMap;
};

const exec = (
  titleElement: Element | null,
  badgesContainer: Element | null,
  problemIdToDataMap: Record<number, RatingData>
) => {
  if (
    !titleElement ||
    !badgesContainer ||
    !Object.keys(problemIdToDataMap).length
  )
    return;
  const id = 'leetcode-ratings-badge';

  const existingRatingBadge = document.getElementById(id);
  if (existingRatingBadge) existingRatingBadge.remove();

  const problemId = +titleElement.innerHTML.split('.')[0];
  const rating = Math.round(problemIdToDataMap[problemId]?.Rating);
  if (!rating) return;
  const ratingBadge = document.createElement('div');
  ratingBadge.id = id;
  ratingBadge.className =
    'relative inline-flex items-center justify-center text-caption px-2 py-1 gap-1 rounded-full bg-fill-secondary';
  if (rating <= 1400) {
    ratingBadge.classList.add(
      'text-difficulty-easy',
      'dark:text-difficulty-easy'
    );
  } else if (rating <= 1800) {
    ratingBadge.classList.add(
      'text-difficulty-medium',
      'dark:text-difficulty-medium'
    );
  } else {
    ratingBadge.classList.add(
      'text-difficulty-hard',
      'dark:text-difficulty-hard'
    );
  }
  ratingBadge.innerText = `Rating: ${rating}`;
  badgesContainer.appendChild(ratingBadge);
};

const titleSelector = '#qd-content div.text-title-large a';
const badgesContainerSelector =
  '#qd-content [data-layout-path="/ts0/t0"] .flex.items-start.justify-between.gap-4 + div.flex.gap-1';
let problemIdToDataMap: Record<number, RatingData> = {};

(async () => {
  const titleElement = document.querySelector(titleSelector);
  const badgesContainer = document.querySelector(badgesContainerSelector);
  problemIdToDataMap = await fetchRatingsData();
  exec(titleElement, badgesContainer, problemIdToDataMap);
})();

let lastUrl = location.href;
const observer = new MutationObserver((_mutations) => {
  // Note: A hack, need to improve it
  // Cases it might fail: Slow network
  // Todo: Detect changes in DOM and then execute with the elements
  const url = location.href;
  if (lastUrl != url && url.startsWith('https://leetcode.com/problems')) {
    lastUrl = url;
    setTimeout(() => {
      const titleElement = document.querySelector(titleSelector);
      const badgesContainer = document.querySelector(badgesContainerSelector);
      exec(titleElement, badgesContainer, problemIdToDataMap);
    }, 700);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
