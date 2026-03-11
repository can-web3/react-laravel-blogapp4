import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchPopularTags, fetchPopularAuthors } from "@/lib/blogs";
import { fetchCategories } from "@/lib/categories";
import type { PopularTag, PopularAuthor } from "@/lib/types";
import type { CategoryItem } from "@/lib/categories";

export default function ExploreScreen() {
  const [tags, setTags] = useState<PopularTag[]>([]);
  const [authors, setAuthors] = useState<PopularAuthor[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authorPage, setAuthorPage] = useState(1);

  const AUTHORS_PER_PAGE = 10;

  const loadData = useCallback(async () => {
    try {
      const [tagsRes, authorsRes, categoriesRes] = await Promise.all([
        fetchPopularTags(20),
        fetchPopularAuthors(40),
        fetchCategories(),
      ]);
      setTags(tagsRes.data ?? []);
      setAuthors(authorsRes.data ?? []);
      setCategories(categoriesRes.data ?? []);
    } catch (err) {
      console.error("Error loading explore data:", err);
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
    setAuthorPage(1);
    loadData();
  }, [loadData]);

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const q = searchQuery.trim().toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(q));
  }, [tags, searchQuery]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.trim().toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        (cat.description ?? "").toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const filteredAuthors = useMemo(() => {
    if (!searchQuery.trim()) return authors;
    const q = searchQuery.trim().toLowerCase();
    return authors.filter((author) => {
      const name = author.name || author.username || "";
      const bio = author.bio || "";
      return (
        name.toLowerCase().includes(q) ||
        bio.toLowerCase().includes(q) ||
        author.username.toLowerCase().includes(q)
      );
    });
  }, [authors, searchQuery]);

  const visibleAuthors = useMemo(() => {
    return filteredAuthors.slice(0, authorPage * AUTHORS_PER_PAGE);
  }, [filteredAuthors, authorPage]);

  const hasMoreAuthors = visibleAuthors.length < filteredAuthors.length;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-100">
        <Text className="text-2xl font-bold text-slate-900 mb-4">Authors</Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-base text-slate-900"
            placeholder="Search authors or tags..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
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
        {loading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : (
          <>
            {/* Categories */}
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-slate-900">
                  Categories
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {filteredCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    className="bg-white border border-slate-200 px-4 py-2 rounded-full"
                    onPress={() => router.push(`/category/${cat.slug}`)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-slate-700 font-medium">
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Popular Tags */}
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-slate-900">
                  Popular Tags
                </Text>
                <TouchableOpacity>
                  <Text className="text-primary-600 font-medium text-sm">
                    See All
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {filteredTags.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    className="bg-white border border-slate-200 px-4 py-2 rounded-full"
                    onPress={() => router.push(`/tag/${tag.slug}`)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-slate-700 font-medium">
                      #{tag.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Popular Authors */}
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-slate-900">
                  Authors
                </Text>
              </View>
              <View className="gap-3">
                {visibleAuthors.map((author) => (
                  <TouchableOpacity
                    key={author.id}
                    className="bg-white rounded-xl p-4 flex-row items-center border border-slate-100"
                    onPress={() => router.push(`/author/${author.slug}`)}
                    activeOpacity={0.7}
                  >
                    <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center">
                      <Text className="text-primary-600 font-bold text-lg">
                        {author.name?.charAt(0) || author.username?.charAt(0) || "?"}
                      </Text>
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="font-semibold text-slate-900">
                        {author.name || author.username}
                      </Text>
                      <Text className="text-sm text-slate-500" numberOfLines={1}>
                        {author.bio || `@${author.username}`}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-medium text-slate-900">
                        {author.posts}
                      </Text>
                      <Text className="text-xs text-slate-500">posts</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              {hasMoreAuthors && (
                <View className="items-center mt-4">
                  <TouchableOpacity
                    onPress={() => setAuthorPage((p) => p + 1)}
                    className="px-4 py-2 rounded-full bg-slate-100"
                  >
                    <Text className="text-sm font-medium text-slate-700">
                      Load more authors
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
