import {Route, Routes} from 'react-router-dom';

import {Feed} from '@/features/feed';
import FeedTouchView from '@/features/feed/index.touch';
import {MusicChartsPage} from '@/features/music/charts';
import MusicChartsTouchView from '@/features/music/charts/index.touch';
import {MusicMyRatingsPage} from '@/features/music/my-ratings';
import MusicMyRatingsTouchView from '@/features/music/my-ratings/index.touch';
import {MusicReleaseDetailPage} from '@/features/music/release-detail';
import MusicReleaseDetailTouchView from '@/features/music/release-detail/index.touch';
import {MusicReleaseList} from '@/features/music/release-list';
import MusicReleaseListTouchView from '@/features/music/release-list/index.touch';
import {MusicReleaseUploadPage} from '@/features/music/release-upload';
import MusicReleaseUploadTouchView from '@/features/music/release-upload/index.touch';

const AppTouch = () => {
    return (
        <Routes>
            <Route path="/" element={<Feed view={FeedTouchView} />} />
            <Route
                path="/music/releases"
                element={<MusicReleaseList platform="touch" view={MusicReleaseListTouchView} />}
            />
            <Route
                path="/music/releases/new"
                element={<MusicReleaseUploadPage platform="touch" view={MusicReleaseUploadTouchView} />}
            />
            <Route
                path="/music/releases/:releaseId"
                element={<MusicReleaseDetailPage platform="touch" view={MusicReleaseDetailTouchView} />}
            />
            <Route
                path="/music/my-ratings"
                element={<MusicMyRatingsPage platform="touch" view={MusicMyRatingsTouchView} />}
            />
            <Route path="/music/charts" element={<MusicChartsPage platform="touch" view={MusicChartsTouchView} />} />
        </Routes>
    );
};

export default AppTouch;
