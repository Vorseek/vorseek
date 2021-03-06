import axios, { AxiosResponse } from 'axios';
import { NextPage } from 'next';
import React from 'react';

interface Props {
  res: string;
  timeInitialProps: string;
}

const StaticProps: NextPage<Props> = (props) => {
  const { res, timeInitialProps } = props;

  return (
    <div>
      <p>Static build</p>
      {res?.split('\n').map((text) => (
        <p key={text}>{text}</p>
      ))}
      <h1>static</h1>
      <p>InitialProps</p>
      {timeInitialProps?.split('\n').map((text) => (
        <p key={text}>{text}</p>
      ))}
    </div>
  );
};

export async function getStaticProps() {
  const timerMS = 0;

  const res = await new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        `StaticProps build
          date: ${new Date().getDate()}
          hours: ${new Date().getHours()}
          minutes: ${new Date().getMinutes()} 
          `
      );
    }, timerMS);
  });

  const arr = new Array(1).fill(null);

  const result = [] as Promise<AxiosResponse>[];

  arr.forEach(async () => {
    const image = axios.get(
      'https://images.pexels.com/photos/11254131/pexels-photo-11254131.jpeg?cs=srgb&dl=pexels-summer-rune-11254131.jpg&fm=jpg&w=1300&h=1300'
    );

    result.push(image);
  });

  const largeImageArr = await Promise.all(result).then((values) =>
    values.map((el) => JSON.stringify(el.data))
  );

  return {
    props: { res, largeImageArr },
  };
}

export async function getStaticPaths() {
  const paths = new Array(20).fill(null).map((_, index) => ({ params: { uid: `${index + 1}` } }));

  return {
    paths,
    fallback: true,
  };
}

export default StaticProps;
