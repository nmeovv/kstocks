import {MusicReleaseDetailContent} from './release-detail-content';
import type {MusicReleaseDetailViewProps} from './index';

const MusicReleaseDetailTouchView = (props: MusicReleaseDetailViewProps) => {
    return <MusicReleaseDetailContent {...props} />;
};

export default MusicReleaseDetailTouchView;
