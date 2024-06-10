'use client'
import React from 'react';
import { NextPage } from 'next';
import Rating from './components/rating';

const Home: NextPage = () => {
  const ratingsData = [
    { stars: 5, percentage: 86 },
    { stars: 4, percentage: 36 },
    { stars: 3, percentage: 18 },
    { stars: 2, percentage: 24 },
    { stars: 1, percentage: 22 },
  ];

  return (
    <div>
      <Rating averageRating={4.4} totalReviews={139} ratings={ratingsData} />
    </div>
  );
};

export default Home;
