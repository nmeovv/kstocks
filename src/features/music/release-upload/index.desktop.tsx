import {ReleaseUploadContent} from './release-upload-content';
import type {ReleaseUploadViewProps} from './index';

const MusicReleaseUploadDesktopView = (props: ReleaseUploadViewProps) => {
    return <ReleaseUploadContent {...props} desktop />;
};

export default MusicReleaseUploadDesktopView;
