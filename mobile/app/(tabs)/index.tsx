import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlogCard, BlogCardSkeleton } from "@/components/BlogCard";
import {
  fetchTrendingBlogs,
  fetchLatestBlogs,
  fetchDiscussedBlogs,
  fetchPopularAuthors,
  fetchPopularTags,
} from "@/lib/blogs";
import { fetchCategories } from "@/lib/categories";
import type { BlogItem, PopularAuthor, PopularTag } from "@/lib/types";
import type { CategoryItem } from "@/lib/categories";

export default function HomeScreen() {
  const [trendingBlogs, setTrendingBlogs] = useState<BlogItem[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogItem[]>([]);
  const [discussedBlogs, setDiscussedBlogs] = useState<BlogItem[]>([]);
  const [popularAuthors, setPopularAuthors] = useState<PopularAuthor[]>([]);
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const [trending, latest, discussed, authors, tags, categoriesRes] = await Promise.all([
        fetchTrendingBlogs(6),
        fetchLatestBlogs(6),
        fetchDiscussedBlogs(6),
        fetchPopularAuthors(6),
        fetchPopularTags(10),
        fetchCategories(),
      ]);

      setTrendingBlogs(trending.data ?? []);
      setLatestBlogs(latest.data ?? []);
      setDiscussedBlogs(discussed.data ?? []);
      setPopularAuthors(authors.data ?? []);
      setPopularTags(tags.data ?? []);
      setCategories(categoriesRes.data ?? []);
    } catch (err) {
      setError("Failed to load blogs. Please try again.");
      console.error("Error loading blogs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-slate-900">Discover</Text>
            <Text className="text-sm text-slate-500 mt-0.5">
              Find interesting stories
            </Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
            <Ionicons name="search-outline" size={22} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#059669"
            colors={["#059669"]}
          />
        }
      >
        {/* Global loading state */}
        {loading && !error && (
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-slate-900">
                Trending blogs
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

        {/* Error State */}
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
          <View className="gap-10">
            {/* Trending blogs */}
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-slate-900">
                  Trending blogs
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: "/blogs", params: { sort: "trending" } })}
                >
                  <Text className="text-xs font-medium text-primary-600">
                    View all
                  </Text>
                </TouchableOpacity>
              </View>
              {trendingBlogs.length === 0 ? (
                <Text className="text-xs text-slate-500">
                  No trending blogs yet.
                </Text>
              ) : (
                <View className="flex-row flex-wrap justify-between gap-y-4">
                  {trendingBlogs.map((blog) => (
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

            {/* Latest blogs */}
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-slate-900">
                  Latest blogs
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: "/blogs", params: { sort: "latest" } })}
                >
                  <Text className="text-xs font-medium text-primary-600">
                    View all
                  </Text>
                </TouchableOpacity>
              </View>
              {latestBlogs.length === 0 ? (
                <Text className="text-xs text-slate-500">
                  No latest blogs yet.
                </Text>
              ) : (
                <View className="flex-row flex-wrap justify-between gap-y-4">
                  {latestBlogs.map((blog) => (
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

            {/* Most discussed */}
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-slate-900">
                  Most discussed
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: "/blogs", params: { sort: "discussed" } })}
                >
                  <Text className="text-xs font-medium text-primary-600">
                    View all
                  </Text>
                </TouchableOpacity>
              </View>
              {discussedBlogs.length === 0 ? (
                <Text className="text-xs text-slate-500">
                  No discussed blogs yet.
                </Text>
              ) : (
                <View className="flex-row flex-wrap justify-between gap-y-4">
                  {discussedBlogs.map((blog) => (
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

            {/* Popular authors */}
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-slate-900">
                  Popular authors
                </Text>
              </View>
              {popularAuthors.length === 0 ? (
                <Text className="text-xs text-slate-500">
                  No authors yet.
                </Text>
              ) : (
                <View className="flex-row flex-wrap justify-between gap-y-4">
                  {popularAuthors.map((author) => (
                    <TouchableOpacity
                      key={author.id}
                      activeOpacity={0.9}
                      className="w-[48%] rounded-2xl bg-white p-4 border border-slate-100 shadow-sm"
                      onPress={() => router.push(`/author/${author.slug}`)}
                    >
                      <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mb-2.5">
                        <Text className="text-primary-700 font-semibold">
                          {author.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text
                        className="text-sm font-semibold text-slate-900"
                        numberOfLines={1}
                      >
                        {author.name}
                      </Text>
                      <Text
                        className="text-xs text-slate-500 mt-0.5"
                        numberOfLines={2}
                      >
                        {author.bio || "Writer"}
                      </Text>
                      <Text className="text-[11px] text-slate-400 mt-2">
                        {author.posts} {author.posts === 1 ? "post" : "posts"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Categories */}
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-slate-900">
                  Categories
                </Text>
              </View>
              {categories.length === 0 ? (
                <Text className="text-xs text-slate-500">
                  No categories yet.
                </Text>
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      className="rounded-full bg-primary-100 px-3 py-1.5"
                      onPress={() => router.push(`/category/${cat.slug}`)}
                      activeOpacity={0.7}
                    >
                      <Text className="text-xs font-medium text-primary-700">
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Popular tags */}
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-slate-900">
                  Popular tags
                </Text>
              </View>
              {popularTags.length === 0 ? (
                <Text className="text-xs text-slate-500">
                  No tags yet.
                </Text>
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <TouchableOpacity
                      key={tag.id}
                      className="rounded-full bg-slate-100 px-3 py-1"
                      onPress={() => router.push(`/tag/${tag.slug}`)}
                      activeOpacity={0.7}
                    >
                      <Text className="text-xs text-slate-700">
                        #{tag.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
