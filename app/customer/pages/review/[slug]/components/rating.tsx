import React from 'react';
import { Card, Progress, Spacer } from '@nextui-org/react';

interface RatingProps {
  averageRating: number;
  totalReviews: number;
  ratings: {
    stars: number;
    percentage: number;
  }[];
}

const Rating: React.FC<RatingProps> = ({ averageRating, totalReviews, ratings }) => {
  return (
    <Card>
      <Card>
        <h4>
          {averageRating} • (Based on {totalReviews} reviews)
        </h4>
        {ratings.map((rating) => (
          <div key={rating.stars}>
            <h4>
              {rating.stars} stars
            </h4>
            <Progress value={rating.percentage} color="primary" />
            <Spacer y={0.5} />
          </div>
        ))}
      </Card>
    </Card>
  );
};

export default Rating;
