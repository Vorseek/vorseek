import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { PageSpeedData } from 'types';

const PAGE_SPEED_KEY = 'AIzaSyD6CQTIkDv3fMgyj3sthUcpXI-0YNWuRW0';

interface PageSpeedResponse {
  categoriesPerformance?: number[];
  avrResultTest?: number;
  requestTime?: number;
  strategy?: string | string[];
  loading?: boolean;
}

const getCategoriesPerformance = (pageSpeedResponse: PageSpeedData[]) =>
  pageSpeedResponse.map((testResult) => testResult.lighthouseResult.categories.performance.score);

export const usePageSpeedRequest = () => {
  const router = useRouter();
  const { url, count, strategy = 'MOBILE' } = router.query;

  const [response, setResponse] = useState<PageSpeedResponse>({});

  const request = () => {
    if (!url) {
      return;
    }

    setResponse({ loading: true });
    const startDate = +new Date();

    const pageSpeedResponse = [] as PageSpeedData[];

    const pageSpeedRequest = () =>
      axios
        .get(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&key=${PAGE_SPEED_KEY}&strategy=${strategy}&category=performance`
        )
        .then(async (el) => {
          pageSpeedResponse.push(el.data);

          const categoriesPerformance = getCategoriesPerformance(pageSpeedResponse);
          setResponse((prev) => ({ ...prev, categoriesPerformance }));

          if (pageSpeedResponse.length < +count) {
            await pageSpeedRequest();
          }
        });

    pageSpeedRequest()
      .then(() => {
        const categoriesPerformance = getCategoriesPerformance(pageSpeedResponse);

        const sumResult = categoriesPerformance.reduce((prev, current) => prev + current, 0);

        const avrResultTest = (sumResult / pageSpeedResponse.length) * 100;

        const requestTime = (+new Date() - startDate) / 1000;

        setResponse({
          categoriesPerformance,
          avrResultTest,
          requestTime,
          strategy,
          loading: false,
        });
      })
      .catch(() => {
        setResponse((prev) => ({ ...prev, loading: false }));
      });
  };

  useEffect(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return { response };
};
