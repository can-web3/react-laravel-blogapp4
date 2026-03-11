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
import { fetchBlogs } from "@/lib/blogs";
import { getUser } from "@/lib/storage";
import type { BlogItem, User } from "@/lib/types";

const TITLES: Record<string, string> = {
  saved: "Saved Posts",
  liked: "Liked Posts",
  my: "My Posts",
};

export default function ProfileBlogsScreen() {
  const { list } = useLocalSearchParams<{ list: string }>();
  const key = list === "saved" || list === "liked" || list === "my" ? list : "saved";

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      if (key === "my") {
        const user = await getUser<User>();
        const slug = user?.slug ?? user?.username;
        if (!slug) {
          setError("Could not load your profile.");
          setBlogs([]);
          return;
        }
        const res = await fetchBlogs({ perPage: 30, authorSlug: slug });
        setBlogs(res.data ?? []);
      } else if (key === "saved") {
        const res = await fetchBlogs({ perPage: 30, bookmarked: true });
        setBlogs(res.data ?? []);
      } else {
        const res = await fetchBlogs({ perPage: 30, liked: true });
        setBlogs(res.data ?? []);
      }
    } catch (err) {
      console.error("Error loading profile blogs:", err);
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        router.replace("/(auth)/login");
        return;
      }
      setError("Failed to load. Please try again.");
      setBlogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [key]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const title = TITLES[key] ?? "Posts";

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-slate-200 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-slate-900 flex-1">
          {title}
        </Text>
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <>
            {blogs.length === 0 ? (
              <View className="items-center py-12">
                <Ionicons
                  name={key === "saved" ? "bookmark-outline" : key === "liked" ? "heart-outline" : "document-text-outline"}
                  size={48}
                  color="#94a3b8"
                />
                <Text className="text-slate-500 text-center mt-4">
                  {key === "saved" && "No saved posts yet."}
                  {key === "liked" && "No liked posts yet."}
                  {key === "my" && "You haven't written any posts yet."}
                </Text>
              </View>
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
