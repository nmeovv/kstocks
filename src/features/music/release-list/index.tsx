import type {ComponentType} from 'react';
import {useMemo, useState} from 'react';
import {useSearchParams} from 'react-router-dom';

import {
    MusicApiError,
    type MusicArtistSelection,
    type MusicArtistSummary,
    type MusicReleaseSummary,
    parseArtistSelection,
} from '@/api/music';
import {useArtistListQuery, useReleaseListQuery} from '@/api/use-music';
import {MusicAuthGate, type MusicPlatform, MusicShell} from '@/features/music/music-shell';

export type MusicReleaseListState =
    | {kind: 'catalog-loading'}
    | {kind: 'catalog-error'}
    | {kind: 'catalog-empty'}
    | {kind: 'selection-error'}
    | {
          kind: 'ready';
          artists: MusicArtistSummary[];
          selectedArtist: MusicArtistSummary;
          releases:
              {kind: 'loading'} | {kind: 'error'} | {kind: 'empty'} | {kind: 'populated'; items: MusicReleaseSummary[]};
      };

export type MusicReleaseListViewProps = {
    artistSearch: string;
    state: MusicReleaseListState;
    onArtistSearchChange: (value: string) => void;
    onRetry: () => void;
    onSelectArtist: (artist: MusicArtistSummary) => void;
};

type MusicReleaseListProps = {
    platform: MusicPlatform;
    view: ComponentType<MusicReleaseListViewProps>;
};

type ParsedArtistSelection =
    {kind: 'valid'; selection: MusicArtistSelection | null} | {kind: 'invalid'; error: MusicApiError};

export const MusicReleaseList = ({platform, view: View}: MusicReleaseListProps) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [artistSearch, setArtistSearch] = useState('');
    const parsed = useMemo<ParsedArtistSelection>(() => {
        try {
            return {kind: 'valid', selection: parseArtistSelection(searchParams)};
        } catch (error) {
            return {
                kind: 'invalid',
                error: error instanceof MusicApiError ? error : new MusicApiError('Invalid artist.', 'validation'),
            };
        }
    }, [searchParams]);
    const artistsQuery = useArtistListQuery();
    const selectedArtist =
        parsed.kind === 'valid' && artistsQuery.data
            ? resolveSelectedArtist(artistsQuery.data, parsed.selection)
            : undefined;
    const selectedArtistFilter = selectedArtist ? artistSelection(selectedArtist) : null;
    const releasesQuery = useReleaseListQuery(selectedArtistFilter, parsed.kind === 'valid');
    const artists = useMemo(() => {
        const normalizedSearch = artistSearch.trim().toLocaleLowerCase();
        return normalizedSearch
            ? (artistsQuery.data ?? []).filter(artist => artist.name.toLocaleLowerCase().includes(normalizedSearch))
            : (artistsQuery.data ?? []);
    }, [artistSearch, artistsQuery.data]);
    const state = releaseListState({artists, artistsQuery, parsed, releasesQuery, selectedArtist});

    return (
        <MusicShell platform={platform}>
            <MusicAuthGate>
                <View
                    artistSearch={artistSearch}
                    onArtistSearchChange={setArtistSearch}
                    onRetry={() => {
                        if (parsed.kind === 'invalid' || state.kind === 'selection-error') {
                            setSearchParams({});
                            return;
                        }
                        if (artistsQuery.isError) {
                            void artistsQuery.refetch();
                            return;
                        }
                        void releasesQuery.refetch();
                    }}
                    onSelectArtist={artist => {
                        setSearchParams(
                            artist.kind === 'group' ? {groupId: String(artist.id)} : {idolId: String(artist.id)},
                        );
                    }}
                    state={state}
                />
            </MusicAuthGate>
        </MusicShell>
    );
};

const resolveSelectedArtist = (artists: MusicArtistSummary[], selection: MusicArtistSelection | null) => {
    if (selection === null) {
        return artists[0];
    }
    return artists.find(artist => artist.kind === selection.kind && artist.id === selection.id);
};

const artistSelection = (artist: MusicArtistSummary): MusicArtistSelection => {
    return artist.kind === 'group' ? {kind: 'group', id: artist.id} : {kind: 'idol', id: artist.id};
};

const releaseListState = ({
    artists,
    artistsQuery,
    parsed,
    releasesQuery,
    selectedArtist,
}: {
    artists: MusicArtistSummary[];
    artistsQuery: ReturnType<typeof useArtistListQuery>;
    parsed: ParsedArtistSelection;
    releasesQuery: ReturnType<typeof useReleaseListQuery>;
    selectedArtist: MusicArtistSummary | undefined;
}): MusicReleaseListState => {
    if (parsed.kind === 'invalid') {
        return {kind: 'selection-error'};
    }
    if (artistsQuery.isPending) {
        return {kind: 'catalog-loading'};
    }
    if (artistsQuery.isError) {
        return {kind: 'catalog-error'};
    }
    if (!artistsQuery.data.length) {
        return {kind: 'catalog-empty'};
    }
    if (!selectedArtist) {
        return {kind: 'selection-error'};
    }

    const releases = releasesQuery.isError
        ? {kind: 'error' as const}
        : releasesQuery.isPending
          ? {kind: 'loading' as const}
          : releasesQuery.data.length
            ? {kind: 'populated' as const, items: releasesQuery.data}
            : {kind: 'empty' as const};
    return {kind: 'ready', artists, selectedArtist, releases};
};
