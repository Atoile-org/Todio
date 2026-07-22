package com.todio.youtube;

import org.schabi.newpipe.extractor.Image;
import org.schabi.newpipe.extractor.channel.ChannelInfo;
import org.schabi.newpipe.extractor.exceptions.ExtractionException;

import java.io.IOException;
import java.util.List;

public class YouTubeProfilePictureExtractor {

    public static String getChannelAvatarUrl(String channelUrl) throws IOException, ExtractionException {
        ChannelInfo info = ChannelInfo.getInfo(channelUrl);

        List<Image> avatars = info.getAvatars();
        if (avatars == null || avatars.isEmpty()) {
            return null;
        }

        Image best = null;
        int bestArea = -1;

        for (Image image : avatars) {
            int width = image.getWidth();
            int height = image.getHeight();
            int area = width * height;

            if (area > bestArea) {
                bestArea = area;
                best = image;
            }
        }

        return best != null ? best.getUrl() : avatars.get(avatars.size() - 1).getUrl();
    }
}