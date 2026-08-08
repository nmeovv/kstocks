import {MusicChartsContent} from './music-charts-content';
import type {MusicChartsViewProps} from './index';

const MusicChartsDesktopView = (props: MusicChartsViewProps) => {
    return <MusicChartsContent {...props} desktop />;
};

export default MusicChartsDesktopView;
