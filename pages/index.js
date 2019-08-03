import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';

const H1 = styled.h1`
  font-size: 50px;
  color: ${({ theme }) => theme.colors.primary};
`;

const P = styled.p`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.primary};
`;

export default function Index() {
  return (
    <>
      <Head>
        <title>My page title</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
          key="viewport"
        />
      </Head>
      <H1>Next App</H1>
      <P>Wired up with Next.js, Apollo and Styled Components</P>
    </>
  );
}
