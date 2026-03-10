import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getImageUrl } from "@/lib/api";
import type { BlogItem } from "@/lib/types";

interface BlogCardProps {
  blog: BlogItem;
  onPress?: () => void;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400";

export function BlogCard({ blog, onPress }: BlogCardProps) {
  const imageUrl = blog.featured_image ? getImageUrl(blog.featured_image) : DEFAULT_IMAGE;
  const authorName = blog.user?.username || "Anonymous";
  const categoryName = blog.category?.name || "Uncategorized";

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      className="bg-white rounded-2xl p-4 shadow-md border border-slate-100"
    >
      {/* Image with padding inside card */}
      <View className="relative rounded-xl overflow-hidden">
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-44"
          resizeMode="cover"
        />
        {/* Category Badge */}
        {categoryName && (
          <View className="absolute top-3 left-3 bg-primary-600 px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-semibold">{categoryName}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="mt-4">
        {/* Tags - Above Title */}
        {blog.tags && blog.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mb-2.5">
            {blog.tags.slice(0, 3).map((tag) => (
              <View key={tag.id} className="bg-slate-100 px-2.5 py-1 rounded-full">
                <Text className="text-xs text-slate-600 font-medium">#{tag.name}</Text>
              </View>
            ))}
            {blog.tags.length > 3 && (
              <View className="bg-slate-100 px-2.5 py-1 rounded-full">
                <Text className="text-xs text-slate-500">+{blog.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {/* Title */}
        <Text
          className="text-lg font-bold text-slate-900 mb-2 leading-tight"
          numberOfLines={2}
        >
          {blog.title}
        </Text>

        {/* Excerpt */}
        {blog.excerpt && (
          <Text className="text-sm text-slate-500 mb-3 leading-relaxed" numberOfLines={2}>
            {blog.excerpt}
          </Text>
        )}

        {/* Footer */}
        <View className="pt-3 border-t border-slate-100">
          {/* Author & Date */}
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-primary-100 rounded-full items-center justify-center">
              <Text className="text-primary-700 font-bold text-sm">
                {authorName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="ml-2.5 flex-1">
              <Text className="text-sm font-medium text-slate-700" numberOfLines={1}>
                {authorName}
              </Text>
              {blog.published_at && (
                <Text className="text-xs text-slate-400">
                  {formatDate(blog.published_at)}
                </Text>
              )}
            </View>
          </View>

          {/* Stats - inline row: icon + count only */}
          <View className="mt-2 flex-row items-center gap-3">
            {/* Likes */}
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name={blog.user_has_liked ? "heart" : "heart-outline"}
                size={14}
                color={blog.user_has_liked ? "#ef4444" : "#94a3b8"}
              />
              <Text className="text-[11px] text-slate-500">
                {blog.like_count ?? 0}
              </Text>
            </View>

            {/* Comments */}
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="chatbubble-outline"
                size={13}
                color="#94a3b8"
              />
              <Text className="text-[11px] text-slate-500">
                {blog.comment_count ?? 0}
              </Text>
            </View>

            {/* Saves / bookmarks */}
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name={blog.user_has_bookmarked ? "bookmark" : "bookmark-outline"}
                size={13}
                color={blog.user_has_bookmarked ? "#059669" : "#94a3b8"}
              />
              <Text className="text-[11px] text-slate-500">
                {blog.bookmark_count ?? 0}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function BlogCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-100">
      {/* Image Skeleton */}
      <View className="w-full h-44 bg-slate-200 rounded-xl" />
      
      {/* Content Skeleton */}
      <View className="mt-4">
        {/* Tags Skeleton - Above Title */}
        <View className="flex-row gap-2 mb-2.5">
          <View className="h-6 bg-slate-200 rounded-full w-16" />
          <View className="h-6 bg-slate-200 rounded-full w-20" />
          <View className="h-6 bg-slate-200 rounded-full w-14" />
        </View>
        
        <View className="h-6 bg-slate-200 rounded-lg w-4/5 mb-2" />
        <View className="h-4 bg-slate-200 rounded w-full mb-1" />
        <View className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
        
        {/* Footer Skeleton */}
        <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-slate-200 rounded-full" />
            <View className="ml-2.5">
              <View className="h-4 bg-slate-200 rounded w-20 mb-1" />
              <View className="h-3 bg-slate-200 rounded w-24" />
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="h-4 bg-slate-200 rounded w-8" />
            <View className="h-4 bg-slate-200 rounded w-8" />
            <View className="h-4 bg-slate-200 rounded w-8" />
          </View>
        </View>
      </View>
    </View>
  );
}
