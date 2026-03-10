import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getImageUrl } from "@/lib/api";
import { getToken } from "@/lib/storage";
import {
  fetchBlogBySlug,
  fetchBlogComments,
  addComment,
  likeBlog,
  unlikeBlog,
  bookmarkBlog,
  unbookmarkBlog,
} from "@/lib/blogs";
import type { BlogItem, Comment } from "@/lib/types";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800";
const COMMENTS_PER_PAGE = 5;

export default function BlogDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [visibleComments, setVisibleComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadBlog = useCallback(async () => {
    if (!slug) return;
    
    try {
      setError(null);
      const token = await getToken();
      setIsAuthenticated(!!token);
      
      const response = await fetchBlogBySlug(slug);
      setBlog(response.data);
    } catch (err) {
      setError("Failed to load blog post");
      console.error("Error loading blog:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug]);

  const loadComments = useCallback(async () => {
    if (!blog) return;
    
    setCommentsLoading(true);
    try {
      const response = await fetchBlogComments(blog.id);
      setComments(response.data);
      setVisibleComments(response.data.slice(0, COMMENTS_PER_PAGE));
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, [blog]);

  useEffect(() => {
    loadBlog();
  }, [loadBlog]);

  useEffect(() => {
    if (showComments && blog && comments.length === 0) {
      loadComments();
    }
  }, [showComments, blog, comments.length, loadComments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setComments([]);
    setVisibleComments([]);
    setShowComments(false);
    loadBlog();
  }, [loadBlog]);

  const handleShowMoreComments = () => {
    const currentCount = visibleComments.length;
    const nextComments = comments.slice(0, currentCount + COMMENTS_PER_PAGE);
    setVisibleComments(nextComments);
  };

  const handleSubmitComment = async () => {
    if (!blog || !commentText.trim()) return;

    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to comment", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await addComment(blog.id, commentText.trim());
      setComments([response.data, ...comments]);
      setVisibleComments([response.data, ...visibleComments]);
      setCommentText("");
      setBlog({ ...blog, comment_count: (blog.comment_count || 0) + 1 });
    } catch (err) {
      Alert.alert("Error", "Failed to post comment. Please try again.");
      console.error("Error posting comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    if (!blog) return;
    
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to like posts", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }

    try {
      if (blog.user_has_liked) {
        await unlikeBlog(blog.id);
        setBlog({ 
          ...blog, 
          user_has_liked: false, 
          like_count: (blog.like_count || 1) - 1 
        });
      } else {
        await likeBlog(blog.id);
        setBlog({ 
          ...blog, 
          user_has_liked: true, 
          like_count: (blog.like_count || 0) + 1 
        });
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleBookmark = async () => {
    if (!blog) return;
    
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to bookmark posts", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }

    try {
      if (blog.user_has_bookmarked) {
        await unbookmarkBlog(blog.id);
        setBlog({ 
          ...blog, 
          user_has_bookmarked: false, 
          bookmark_count: (blog.bookmark_count || 1) - 1 
        });
      } else {
        await bookmarkBlog(blog.id);
        setBlog({ 
          ...blog, 
          user_has_bookmarked: true, 
          bookmark_count: (blog.bookmark_count || 0) + 1 
        });
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

  const handleShare = async () => {
    if (!blog) return;
    
    try {
      await Share.share({
        message: `Check out "${blog.title}"`,
        title: blog.title,
      });
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric",
      year: "numeric"
    });
  };

  const formatCommentDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="text-slate-500 mt-4">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !blog) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#475569" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#94a3b8" />
          <Text className="text-slate-500 text-center mt-4 mb-4">
            {error || "Blog post not found"}
          </Text>
          <TouchableOpacity
            onPress={loadBlog}
            className="bg-primary-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const imageUrl = blog.featured_image ? getImageUrl(blog.featured_image) : DEFAULT_IMAGE;
  const authorName = blog.user?.username || "Anonymous";
  const hasMoreComments = visibleComments.length < comments.length;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#475569" />
          </TouchableOpacity>
          
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handleShare}
              className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
            >
              <Ionicons name="share-outline" size={20} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1"
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
          {/* Featured Image */}
          <View className="px-4 pt-4">
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-56 rounded-2xl"
              resizeMode="cover"
            />
          </View>

          {/* Content */}
          <View className="px-5 pt-5 pb-24">
            {/* Category & Reading Time */}
            <View className="flex-row items-center gap-3 mb-4">
              {blog.category && (
                <View className="bg-primary-100 px-3 py-1.5 rounded-full">
                  <Text className="text-primary-700 text-sm font-semibold">
                    {blog.category.name}
                  </Text>
                </View>
              )}
              {blog.reading_time_minutes && (
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={16} color="#94a3b8" />
                  <Text className="text-slate-500 text-sm ml-1">
                    {blog.reading_time_minutes} min read
                  </Text>
                </View>
              )}
            </View>

            {/* Tags - Above Title */}
            {blog.tags && blog.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-3">
                {blog.tags.map((tag) => (
                  <View key={tag.id} className="bg-slate-100 px-3 py-1.5 rounded-full">
                    <Text className="text-slate-600 font-medium text-sm">#{tag.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Title */}
            <Text className="text-2xl font-bold text-slate-900 leading-tight mb-4">
              {blog.title}
            </Text>

            {/* Author & Date */}
            <View className="flex-row items-center mb-6 pb-6 border-b border-slate-100">
              <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center">
                <Text className="text-primary-700 font-bold text-lg">
                  {authorName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-slate-900">{authorName}</Text>
                <Text className="text-sm text-slate-500">
                  {formatDate(blog.published_at)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="eye-outline" size={16} color="#94a3b8" />
                <Text className="text-slate-500 text-sm ml-1">{blog.view_count}</Text>
              </View>
            </View>

            {/* Body */}
            <View className="mb-6">
              <Text className="text-base text-slate-700 leading-7">
                {blog.body}
              </Text>
            </View>

            {/* Stats & Actions */}
            <View className="flex-row items-center justify-between pt-6 border-t border-slate-100 mb-8">
              <View className="flex-row items-center gap-6">
                {/* Like Button */}
                <TouchableOpacity
                  onPress={handleLike}
                  className="flex-row items-center"
                >
                  <Ionicons
                    name={blog.user_has_liked ? "heart" : "heart-outline"}
                    size={24}
                    color={blog.user_has_liked ? "#ef4444" : "#94a3b8"}
                  />
                  <Text className={`ml-2 font-medium ${blog.user_has_liked ? "text-red-500" : "text-slate-500"}`}>
                    {blog.like_count ?? 0}
                  </Text>
                </TouchableOpacity>

                {/* Comment Count */}
                <TouchableOpacity 
                  onPress={() => setShowComments(!showComments)}
                  className="flex-row items-center"
                >
                  <Ionicons 
                    name={showComments ? "chatbubble" : "chatbubble-outline"} 
                    size={22} 
                    color={showComments ? "#059669" : "#94a3b8"} 
                  />
                  <Text className={`ml-2 font-medium ${showComments ? "text-primary-600" : "text-slate-500"}`}>
                    {blog.comment_count ?? 0}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bookmark Button */}
              <TouchableOpacity
                onPress={handleBookmark}
                className="flex-row items-center"
              >
                <Ionicons
                  name={blog.user_has_bookmarked ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={blog.user_has_bookmarked ? "#059669" : "#94a3b8"}
                />
                <Text className={`ml-2 font-medium ${blog.user_has_bookmarked ? "text-primary-600" : "text-slate-500"}`}>
                  {blog.bookmark_count ?? 0}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Comments Section */}
            {showComments && (
              <View className="border-t border-slate-100 pt-6">
                <Text className="text-lg font-bold text-slate-900 mb-4">
                  Comments ({blog.comment_count ?? 0})
                </Text>

                {/* Add Comment */}
                <View className="flex-row items-start gap-3 mb-6">
                  <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                    <Ionicons name="person" size={18} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 min-h-[80px]"
                      placeholder={isAuthenticated ? "Write a comment..." : "Sign in to comment"}
                      placeholderTextColor="#94a3b8"
                      multiline
                      value={commentText}
                      onChangeText={setCommentText}
                      editable={isAuthenticated}
                      textAlignVertical="top"
                    />
                    <TouchableOpacity
                      onPress={handleSubmitComment}
                      disabled={!commentText.trim() || submittingComment}
                      className={`mt-2 self-end px-5 py-2.5 rounded-xl ${
                        commentText.trim() && !submittingComment
                          ? "bg-primary-600"
                          : "bg-slate-200"
                      }`}
                    >
                      {submittingComment ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text
                          className={`font-medium ${
                            commentText.trim() ? "text-white" : "text-slate-400"
                          }`}
                        >
                          Post
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Comments Loading */}
                {commentsLoading && (
                  <View className="items-center py-8">
                    <ActivityIndicator size="small" color="#059669" />
                    <Text className="text-slate-500 mt-2">Loading comments...</Text>
                  </View>
                )}

                {/* Comments List */}
                {!commentsLoading && visibleComments.length === 0 && (
                  <View className="items-center py-8">
                    <Ionicons name="chatbubbles-outline" size={40} color="#94a3b8" />
                    <Text className="text-slate-500 mt-2">No comments yet</Text>
                    <Text className="text-slate-400 text-sm">Be the first to comment!</Text>
                  </View>
                )}

                {!commentsLoading && visibleComments.length > 0 && (
                  <View className="gap-4">
                    {visibleComments.map((comment) => (
                      <View key={comment.id} className="flex-row gap-3">
                        <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
                          <Text className="text-slate-600 font-bold">
                            {comment.user?.username?.charAt(0).toUpperCase() || "?"}
                          </Text>
                        </View>
                        <View className="flex-1 bg-slate-50 rounded-xl p-3">
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="font-semibold text-slate-900">
                              {comment.user?.username || "Anonymous"}
                            </Text>
                            <Text className="text-xs text-slate-400">
                              {formatCommentDate(comment.created_at)}
                            </Text>
                          </View>
                          <Text className="text-slate-700 leading-relaxed">
                            {comment.body}
                          </Text>
                        </View>
                      </View>
                    ))}

                    {/* Show More Button */}
                    {hasMoreComments && (
                      <TouchableOpacity
                        onPress={handleShowMoreComments}
                        className="items-center py-4 border border-slate-200 rounded-xl mt-2"
                      >
                        <Text className="text-primary-600 font-medium">
                          Show More Comments ({comments.length - visibleComments.length} remaining)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
