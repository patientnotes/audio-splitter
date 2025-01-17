"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAudio = exports.splitAudio = void 0;
var path_1 = __importDefault(require("path"));
var fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
function splitAudio(params) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    params.ffmpegPath = params.ffmpegPath || "ffmpeg";
                    params.maxNoiseLevel = params.maxNoiseLevel || -40;
                    params.minSilenceLength = params.minSilenceLength || 0.2;
                    params.minSongLength = params.minSongLength || 20;
                    var extensionMatch = params.mergedTrack.match(/\w+$/);
                    if (!extensionMatch)
                        throw new Error("invalid 'mergedTrack' param");
                    var fileExtension = extensionMatch[0];
                    var ffmpegCommand = fluent_ffmpeg_1.default()
                        .setFfmpegPath(params.ffmpegPath)
                        .input(params.mergedTrack)
                        .audioFilters("silencedetect=noise=" + params.maxNoiseLevel + "dB:d=" + params.minSilenceLength)
                        .outputFormat("null");
                    ffmpegCommand
                        .on("start", function (cmdline) { return console.log(cmdline); })
                        .on("end", function (_, silenceDetectResult) {
                        var _a;
                        var tracks = [];
                        var splitPattern = /silence_start: ([\w\.]+)[\s\S]+?silence_end: ([\w\.]+)/g;
                        var silenceInfo;
                        while ((silenceInfo = splitPattern.exec(silenceDetectResult))) {
                            var _1 = silenceInfo[0], silenceStart = silenceInfo[1], silenceEnd = silenceInfo[2];
                            var silenceMiddle = (parseInt(silenceEnd) + parseInt(silenceStart)) / 2;
                            var trackStart = ((_a = tracks[tracks.length - 1]) === null || _a === void 0 ? void 0 : _a.trackEnd) || 0;
                            var trackEnd = silenceMiddle;
                            var trackLength = trackEnd - trackStart;
                            if (trackLength >= params.minSongLength || tracks.length === 0) {
                                tracks.push({
                                    trackStart: trackStart,
                                    trackEnd: trackEnd,
                                });
                            }
                            else {
                                // song is too short -> merge it to the previous one
                                var lastTrack = tracks[tracks.length - 1];
                                lastTrack.trackEnd = trackEnd;
                                tracks[tracks.length - 1] = lastTrack;
                            }
                        }
                        // add last track
                        if (tracks.length > 0) {
                            tracks.push({
                                trackStart: tracks[tracks.length - 1].trackEnd,
                                trackEnd: 999999,
                            });
                        }
                        // split the tracks
                        var promises = tracks.map(function (track, index) {
                            var _a;
                            var trackName = ((_a = params.trackNames) === null || _a === void 0 ? void 0 : _a[index]) ||
                                "Track " + (index + 1).toString().padStart(2, "0");
                            var trackStart = new Date(Math.max(0, track.trackStart * 1000))
                                .toISOString()
                                .substr(11, 8);
                            var trackLength = track.trackEnd - track.trackStart;
                            return extractAudio({
                                ffmpegPath: params.ffmpegPath,
                                inputTrack: params.mergedTrack,
                                start: trackStart,
                                length: trackLength,
                                artist: params.artist,
                                album: params.album,
                                outputTrack: params.outputDir + trackName + "." + fileExtension,
                                fastStart: params.fastStart,
                            });
                        });
                        Promise.all(promises)
                            .then(function () { return resolve(); })
                            .catch(reject);
                    })
                        .on("error", reject)
                        .output("-")
                        .run();
                })];
        });
    });
}
exports.splitAudio = splitAudio;
function extractAudio(params) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var title = path_1.default.parse(params.outputTrack).name;
                    var ffmpegCommand = fluent_ffmpeg_1.default()
                        .setFfmpegPath(params.ffmpegPath)
                        .input(params.inputTrack)
                        .setStartTime(params.start)
                        .setDuration(params.length)
                        .noVideo()
                        .addOutputOptions("-metadata", "title=\"" + title + "\"");
                    if (params.artist) {
                        ffmpegCommand = ffmpegCommand.addOutputOptions("-metadata", "artist=\"" + params.artist + "\"");
                    }
                    if (params.album) {
                        ffmpegCommand = ffmpegCommand.addOutputOptions("-metadata", "album=\"" + params.album + "\"");
                    }
                    if (params.fastStart) {
                        ffmpegCommand = ffmpegCommand.addOutputOptions("-movflags", "faststart");
                    }
                    ffmpegCommand
                        .outputOptions("-c:a", "copy")
                        .on("start", function (cmdline) { return console.log(cmdline); })
                        .on("end", resolve)
                        .on("error", reject)
                        .saveToFile(params.outputTrack);
                })];
        });
    });
}
exports.extractAudio = extractAudio;
