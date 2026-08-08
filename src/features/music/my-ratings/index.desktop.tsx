import {MusicMyRatingsContent} from './my-ratings-content';
import type {MusicMyRatingsViewProps} from './index';

const MusicMyRatingsDesktopView = (props: MusicMyRatingsViewProps) => {
    return <MusicMyRatingsContent {...props} desktop />;
};

export default MusicMyRatingsDesktopView;
