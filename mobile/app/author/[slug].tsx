import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlogCard, BlogCardSkeleton } from "@/components/BlogCard";
import { fetchBlogs, fetchPopularAuthors } from "@/lib/blogs";
import type { BlogItem, PopularAuthor } from "@/lib/types";

export default function AuthorDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const [author, setAuthor] = useState<PopularAuthor | null>(null);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!slug) return;
    try {
      setError(null);
      setLoading(true);

      const [authorsRes, blogsRes] = await Promise.all([
        fetchPopularAuthors(50),
        fetchBlogs({ perPage: 12, authorSlug: String(slug) }),
      ]);

      const foundAuthor =
        authorsRes.data.find((a) => a.slug === slug) ?? null;

      setAuthor(foundAuthor);
      setBlogs(blogsRes.data ?? []);
    } catch (err) {
      console.error("Failed to load author detail", err);
      setError("Failed to load author. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const displayName = author?.name ?? String(slug);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-200 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-slate-900"
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text className="text-xs text-slate-500" numberOfLines={1}>
            Author profile
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#059669"
            colors={["#059669"]}
          />
        }
      >
        {/* Author summary */}
        <View className="mb-6 flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center mr-3">
            <Text className="text-primary-700 font-semibold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-semibold text-slate-900"
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {author?.bio && (
              <Text
                className="text-xs text-slate-500 mt-0.5"
                numberOfLines={2}
              >
                {author.bio}
              </Text>
            )}
            {author && (
              <Text className="text-[11px] text-slate-400 mt-1">
                {author.posts} {author.posts === 1 ? "post" : "posts"}
              </Text>
            )}
          </View>
        </View>

        {/* Loading */}
        {loading && !error && (
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-slate-900">
                Articles
              </Text>
            </View>
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {[1, 2, 3, 4].map((i) => (
                <View key={i} className="w-[48%]">
                  <BlogCardSkeleton />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Error */}
        {!loading && error && (
          <View className="items-center justify-center py-12">
            <Ionicons name="cloud-offline-outline" size={48} color="#94a3b8" />
            <Text className="text-slate-500 text-center mt-4 mb-4">
              {error}
            </Text>
            <TouchableOpacity
              onPress={loadData}
              className="bg-primary-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Blogs list */}
        {!loading && !error && (
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-slate-900">
                Articles
              </Text>
            </View>
            {blogs.length === 0 ? (
              <Text className="text-xs text-slate-500">
                No articles from this author yet.
              </Text>
            ) : (
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {blogs.map((blog) => (
                  <View key={blog.id} className="w-[48%]">
                    <BlogCard
                      blog={blog}
                      onPress={() => router.push(`/blog/${blog.slug}`)}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

