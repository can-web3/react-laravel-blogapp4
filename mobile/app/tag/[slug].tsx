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
import { fetchBlogs, fetchTagBySlug } from "@/lib/blogs";
import type { BlogItem } from "@/lib/types";

export default function TagDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const [tagName, setTagName] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!slug) return;
    try {
      setError(null);
      setLoading(true);

      const [tagRes, blogsRes] = await Promise.all([
        fetchTagBySlug(String(slug)),
        fetchBlogs({ perPage: 20, tagSlug: String(slug) }),
      ]);

      setTagName(tagRes.data?.name ?? String(slug));
      setBlogs(blogsRes.data ?? []);
    } catch (err) {
      console.error("Failed to load tag detail", err);
      setError("Failed to load tag. Please try again.");
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

  const displayName = tagName ?? `#${slug}`;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
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
            #{displayName}
          </Text>
          <Text className="text-xs text-slate-500" numberOfLines={1}>
            Tag
          </Text>
        </View>
      </View>

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
        {loading && !error && (
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="w-[48%]">
                <BlogCardSkeleton />
              </View>
            ))}
          </View>
        )}

        {!loading && error && (
          <View className="items-center justify-center py-12">
            <Ionicons name="cloud-offline-outline" size={48} color="#94a3b8" />
            <Text className="text-slate-500 text-center mt-4 mb-4">{error}</Text>
            <TouchableOpacity
              onPress={loadData}
              className="bg-primary-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && (
          <View>
            <View className="mb-3">
              <Text className="text-sm font-semibold text-slate-900">
                Articles
              </Text>
            </View>
            {blogs.length === 0 ? (
              <Text className="text-xs text-slate-500">
                No articles with this tag yet.
              </Text>
            ) : (
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {blogs.map((blog) => (
                  <View key={blog.id} className="w-[48%]">
                    <BlogCard
                      blog={blog}
                      onPress={() => router.push(`/blog/${blog.slug}`)}
                      onCategoryPress={(s) => router.push(`/category/${s}`)}
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
