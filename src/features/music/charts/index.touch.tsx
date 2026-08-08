import {MusicChartsContent} from './music-charts-content';
import type {MusicChartsViewProps} from './index';

const MusicChartsTouchView = (props: MusicChartsViewProps) => {
    return <MusicChartsContent {...props} />;
};

export default MusicChartsTouchView;
