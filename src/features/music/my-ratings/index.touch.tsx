import {MusicMyRatingsContent} from './my-ratings-content';
import type {MusicMyRatingsViewProps} from './index';

const MusicMyRatingsTouchView = (props: MusicMyRatingsViewProps) => {
    return <MusicMyRatingsContent {...props} />;
};

export default MusicMyRatingsTouchView;
