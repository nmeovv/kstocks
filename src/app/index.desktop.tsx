import {Route, Routes} from 'react-router-dom';

import {Feed} from '@/features/feed';
import FeedDesktopView from '@/features/feed/index.desktop';
import {MusicChartsPage} from '@/features/music/charts';
import MusicChartsDesktopView from '@/features/music/charts/index.desktop';
import {MusicMyRatingsPage} from '@/features/music/my-ratings';
import MusicMyRatingsDesktopView from '@/features/music/my-ratings/index.desktop';
import {MusicReleaseDetailPage} from '@/features/music/release-detail';
import MusicReleaseDetailDesktopView from '@/features/music/release-detail/index.desktop';
import {MusicReleaseList} from '@/features/music/release-list';
import MusicReleaseListDesktopView from '@/features/music/release-list/index.desktop';
import {MusicReleaseUploadPage} from '@/features/music/release-upload';
import MusicReleaseUploadDesktopView from '@/features/music/release-upload/index.desktop';

const AppDesktop = () => {
    return (
        <Routes>
            <Route path="/" element={<Feed view={FeedDesktopView} />} />
            <Route
                path="/music/releases"
                element={<MusicReleaseList platform="desktop" view={MusicReleaseListDesktopView} />}
            />
            <Route
                path="/music/releases/new"
                element={<MusicReleaseUploadPage platform="desktop" view={MusicReleaseUploadDesktopView} />}
            />
            <Route
                path="/music/releases/:releaseId"
                element={<MusicReleaseDetailPage platform="desktop" view={MusicReleaseDetailDesktopView} />}
            />
            <Route
                path="/music/my-ratings"
                element={<MusicMyRatingsPage platform="desktop" view={MusicMyRatingsDesktopView} />}
            />
            <Route
                path="/music/charts"
                element={<MusicChartsPage platform="desktop" view={MusicChartsDesktopView} />}
            />
        </Routes>
    );
};

export default AppDesktop;
