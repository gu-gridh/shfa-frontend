// useSearchTracking.js
export default function useSearchTracking() {
    function trackSearch(query, category, resultsCount) {
      if (window._paq) {
        window._paq.push(['trackSiteSearch', query, category, resultsCount]);
      }
    }
  
    return {
      trackSearch,
    };
}
