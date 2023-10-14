export declare type SplitAudioParams = {
    mergedTrack: string;
    outputDir: string;
    ffmpegPath?: string;
    artist?: string;
    album?: string;
    trackNames?: string[];
    maxNoiseLevel?: number;
    minSilenceLength?: number;
    minSongLength?: number;
    fastStart?: boolean;
};
export declare function splitAudio(params: SplitAudioParams): Promise<void>;
export declare type ExtractAudioParams = {
    ffmpegPath: string;
    inputTrack: string;
    start: number | string;
    length: number;
    artist?: string;
    album?: string;
    outputTrack: string;
    fastStart?: boolean;
};
export declare function extractAudio(params: ExtractAudioParams): Promise<void>;
