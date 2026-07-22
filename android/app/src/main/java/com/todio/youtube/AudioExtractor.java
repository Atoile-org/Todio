package com.todio.youtube;

import org.schabi.newpipe.extractor.MediaFormat;
import org.schabi.newpipe.extractor.ServiceList;
import org.schabi.newpipe.extractor.stream.AudioStream;
import org.schabi.newpipe.extractor.stream.StreamInfo;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class AudioExtractor {

    private static final int MIN_BITRATE = 64000;
    private static final int MAX_BITRATE = 320000;

    public static List<AudioStream> extractAudioStreams(String videoUrl) throws Exception {
        StreamInfo streamInfo = StreamInfo.getInfo(ServiceList.YouTube, videoUrl);
        return streamInfo.getAudioStreams();
    }

    public static AudioStream getBestAudioStream(String videoUrl) throws Exception {
        List<AudioStream> audioStreams = extractAudioStreams(videoUrl);

        if (audioStreams == null || audioStreams.isEmpty()) {
            return null;
        }

        AudioStream bestStream = null;
        int bestBitrate = -1;

        for (AudioStream stream : audioStreams) {
            int bitrate = stream.getAverageBitrate();
            if (bitrate > bestBitrate && bitrate >= MIN_BITRATE && bitrate <= MAX_BITRATE) {
                bestBitrate = bitrate;
                bestStream = stream;
            }
        }

        if (bestStream == null) {
            bestStream = Collections.max(audioStreams, (s1, s2) ->
                Integer.compare(s1.getAverageBitrate(), s2.getAverageBitrate()));
        }

        return bestStream;
    }

    public static List<AudioStream> filterByBitrate(List<AudioStream> streams, int minBitrate, int maxBitrate) {
        List<AudioStream> filtered = new ArrayList<>();

        for (AudioStream stream : streams) {
            int bitrate = stream.getAverageBitrate();
            if (bitrate >= minBitrate && bitrate <= maxBitrate) {
                filtered.add(stream);
            }
        }

        return filtered;
    }

    public static List<AudioStream> filterByFormat(List<AudioStream> streams, MediaFormat format) {
        List<AudioStream> filtered = new ArrayList<>();

        for (AudioStream stream : streams) {
            if (format.equals(stream.getFormat())) {
                filtered.add(stream);
            }
        }

        return filtered;
    }
}