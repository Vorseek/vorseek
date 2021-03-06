import type { GetServerSideProps } from 'next';
import React from 'react';

const index = ({ location, headers, ip, cookies, resHeaders }) => {
  console.log({ headers, cookies, resHeaders });

  return (
    <div>
      <p> Current country: {headers?.['country-user']}</p>
      <p>location: {JSON.stringify(location)}</p>
      <h1>ServerSide</h1>
      {ip}
    </div>
  );
};

export default index;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { headers, cookies } = req;
  const resHeaders = res.getHeaders();
  const forwarded = headers['x-forwarded-for'] as string | undefined;

  const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;

  const location = await fetch('https://main--vorseek.netlify.app/geolocation', {
    headers: { 'x-real-ip': '54.93.50.54' || ip, 'x-forwarded-for': '54.93.50.54' },
  })
    .then((value) => value.json())
    .catch(() => null);

  return {
    props: {
      location: location || null,
      headers,
      cookies,
      resHeaders,
    },
  };
};
