import {MusicReleaseDetailContent} from './release-detail-content';
import type {MusicReleaseDetailViewProps} from './index';

const MusicReleaseDetailDesktopView = (props: MusicReleaseDetailViewProps) => {
    return <MusicReleaseDetailContent {...props} desktop />;
};

export default MusicReleaseDetailDesktopView;
