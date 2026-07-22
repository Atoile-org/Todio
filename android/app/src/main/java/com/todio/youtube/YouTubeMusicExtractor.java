package com.todio.youtube;

import org.schabi.newpipe.extractor.Image;
import org.schabi.newpipe.extractor.InfoItem;
import org.schabi.newpipe.extractor.ServiceList;
import org.schabi.newpipe.extractor.search.SearchInfo;
import org.schabi.newpipe.extractor.stream.StreamInfoItem;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class YouTubeMusicExtractor {

    public static List<YouTubeMusicResult> searchSongs(String query) throws Exception {
        return searchSongs(query, 1);
    }

    public static List<YouTubeMusicResult> searchSongs(String query, int page) throws Exception {
        SearchInfo searchInfo = SearchInfo.getInfo(
                ServiceList.YouTube,
                ServiceList.YouTube.getSearchQHFactory().fromQuery(query)
        );

        List<YouTubeMusicResult> results = new ArrayList<>();

        for (InfoItem item : searchInfo.getRelatedItems()) {
            if (item instanceof StreamInfoItem) {
                results.add(convertToMusicResult((StreamInfoItem) item));
            }
        }

        return results;
    }

    public static List<YouTubeMusicResult> searchSongs(String query, int page, int limit) throws Exception {
        List<YouTubeMusicResult> results = searchSongs(query, page);

        if (limit > 0 && results.size() > limit) {
            return results.subList(0, limit);
        }

        return results;
    }

    public static List<String> getSearchSuggestions(String query) throws Exception {
        List<String> suggestions = new ArrayList<>();

        List<String> raw = ServiceList.YouTube.getSuggestionExtractor().suggestionList(query);

        for (String text : raw) {
            if (text != null && !text.isEmpty()) {
                suggestions.add(text);
            }
        }

        return suggestions;
    }

    private static final ConcurrentHashMap<String, String> authorAvatarCache = new ConcurrentHashMap<>();

    private static YouTubeMusicResult convertToMusicResult(StreamInfoItem item) {
        YouTubeMusicResult result = new YouTubeMusicResult();

        result.title = item.getName();
        result.url = item.getUrl();
        result.thumbnailUrl = getBestThumbnail(item.getThumbnails());
        result.author = item.getUploaderName();
        result.authorUrl = item.getUploaderUrl();
        result.duration = item.getDuration();

        try {
            result.viewCount = item.getViewCount();
        } catch (Exception e) {
            result.viewCount = -1;
        }

        try {
            result.uploadDateText = item.getTextualUploadDate();
        } catch (Exception e) {
            result.uploadDateText = null;
        }

        if (result.authorUrl != null && !result.authorUrl.isEmpty()) {
            try {
                result.authorAvatar = YouTubeProfilePictureExtractor.getChannelAvatarUrl(result.authorUrl);
                authorAvatarCache.put(result.authorUrl, result.authorAvatar);
            } catch (Exception e) {
                result.authorAvatar = authorAvatarCache.get(result.authorUrl);
            }
        }

        return result;
    }

    private static String getBestThumbnail(List<Image> thumbnails) {
        if (thumbnails == null || thumbnails.isEmpty()) {
            return null;
        }

        int bestWidth = -1;
        String bestUrl = null;

        for (Image thumbnail : thumbnails) {
            int width = thumbnail.getWidth();
            if (width > bestWidth) {
                bestWidth = width;
                bestUrl = thumbnail.getUrl();
            }
        }

        return bestUrl != null ? bestUrl : thumbnails.get(thumbnails.size() - 1).getUrl();
    }

    public static class YouTubeMusicResult {
        public String title;
        public String url;
        public String thumbnailUrl;
        public String author;
        public String authorUrl;
        public String authorAvatar;
        public long duration;
        public long viewCount;
        public String uploadDateText;

        public String getTitle() {
            return title;
        }

        public String getUrl() {
            return url;
        }

        public String getThumbnailUrl() {
            return thumbnailUrl;
        }

        public String getAuthor() {
            return author;
        }

        public String getAuthorUrl() {
            return authorUrl;
        }

        public String getAuthorAvatar() {
            return authorAvatar;
        }

        public long getDuration() {
            return duration;
        }

        public long getViewCount() {
            return viewCount;
        }

        public String getUploadDateText() {
            return uploadDateText;
        }

        public String getDurationFormatted() {
            if (duration <= 0) {
                return null;
            }

            long hours = duration / 3600;
            long minutes = (duration % 3600) / 60;
            long seconds = duration % 60;

            if (hours > 0) {
                return String.format("%d:%02d:%02d", hours, minutes, seconds);
            } else {
                return String.format("%d:%02d", minutes, seconds);
            }
        }
    }
}