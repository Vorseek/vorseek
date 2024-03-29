import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { CONTENT_WRAPPER, FORM_STYLES, INPUT_STYLES, LOADING_STYLES } from 'styles';

interface PageSpeedResponse {
  categoriesPerformance?: number[];
  avrResultTest?: number;
  requestTime?: number;
  strategy?: string | string[];
  loading?: boolean;
}

const InputRedirect = ({ loading }) => {
  const ref = useRef(null);
  const {
    push,
    query: { url, count },
  } = useRouter();

  const [urlForPageSpeed, setUrlForPageSpeed] = useState(url);
  const [numberOfRequest, setNumberOfRequest] = useState(count || '10');

  useEffect(() => {
    const handleFocus = () => {
      if (ref.current) {
        ref.current.focus();
      }
    };

    handleFocus();

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    push({ query: { url: urlForPageSpeed, count: numberOfRequest } });
  };

  const handleUrlChange = (event) => {
    setUrlForPageSpeed(event.target.value);
  };
  const handleCountChange = (event) => {
    setNumberOfRequest(event.target.value);
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={FORM_STYLES}>
        <input
          ref={ref}
          type="text"
          name="url"
          style={INPUT_STYLES}
          placeholder="url"
          defaultValue={url}
          onChange={handleUrlChange}
        />
        <input
          type="number"
          name="request-count"
          style={INPUT_STYLES}
          placeholder="count"
          defaultValue={numberOfRequest}
          onChange={handleCountChange}
        />
        <input
          type="submit"
          style={{ position: 'absolute', left: '-99999px', width: '1px', height: '1px' }}
        />
      </form>
      {loading && (
        <h1 style={LOADING_STYLES} className="loading">
          loading <span>.</span> <span>.</span> <span>.</span>
        </h1>
      )}
    </>
  );
};

const PageSpeed = () => {
  const workerRef = useRef<Worker>();
  const [response, setResponse] = useState<PageSpeedResponse>({});
  const router = useRouter();
  const { url, count, strategy = 'MOBILE' } = router.query;
  // pageSpeed request
  // const { response } = usePageSpeedRequest();
  const { categoriesPerformance, avrResultTest, requestTime, loading } = response;

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/pageSpeed/pageSpeed.worker.ts', import.meta.url),
      { name: 'vorseek 😍 worker' }
    );
    workerRef.current.onmessage = ({ data }) => setResponse((prev) => ({ ...prev, ...data }));

    return () => {
      workerRef.current.terminate();
    };
  }, [router]);

  useEffect(() => {
    workerRef.current.postMessage({ url, count, strategy });
  }, [router]);

  const countRequest = count ? ` ${categoriesPerformance?.length || 0} / ${count}` : '';
  const resultPerformance = categoriesPerformance ? JSON.stringify(categoriesPerformance) : null;

  const getColor = () => {
    if (avrResultTest > 80) {
      return 'rgb(0, 204, 102)';
    }
    if (avrResultTest > 50) {
      return 'yellow';
    }
    return 'orangered';
  };

  return (
    <>
      <title>Vorseek{countRequest}</title>
      <div>
        <InputRedirect loading={loading} />
        <div style={CONTENT_WRAPPER}>
          <p>Count request: {countRequest}</p>
          <p>Results: {resultPerformance}</p>
          <p>
            Avr {strategy} result (strategy: MOBILE | DESKTOP):{' '}
            <span style={{ color: getColor() }}>{avrResultTest}</span>
          </p>
          <p>Request time (sec): {requestTime}</p>
        </div>
      </div>
    </>
  );
};

export default PageSpeed;
