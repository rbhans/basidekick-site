import { create } from "zustand";
import { toast } from "sonner";
import {
  PointStackPost,
  PointStackPostComment,
  PointStackNotification,
  PointStackConversation,
  PointStackMessage,
  PointStackFeedFilter,
  CreatePointStackPostInput,
  CreatePointStackCommentInput,
  PointStackProfile,
} from "@/lib/types";
import * as api from "./pointstack-api";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

interface PointStackState {
  // Feed state
  posts: PointStackPost[];
  feedFilter: PointStackFeedFilter;
  feedLoading: boolean;
  feedError: string | null;
  hasMorePosts: boolean;

  // Current post detail
  currentPost: PointStackPost | null;
  currentPostComments: PointStackPostComment[];
  currentPostLoading: boolean;

  // Notifications
  notifications: PointStackNotification[];
  unreadNotificationCount: number;
  notificationsLoading: boolean;
  notificationsError: string | null;

  // Messages
  conversations: PointStackConversation[];
  currentConversation: PointStackConversation | null;
  currentMessages: PointStackMessage[];
  unreadMessageCount: number;
  messagesLoading: boolean;
  messagesError: string | null;

  // Floating messenger UI state
  messengerOpen: boolean;
  messengerView: "inbox" | "conversation";
  selectedConversationId: string | null;

  // Current user profile
  currentUserProfile: PointStackProfile | null;

  // Feed actions
  fetchFeed: (filter?: PointStackFeedFilter, reset?: boolean) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  setFeedFilter: (filter: PointStackFeedFilter) => void;
  createPost: (input: CreatePointStackPostInput) => Promise<PointStackPost>;
  updatePost: (postId: string, updates: Partial<CreatePointStackPostInput>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  votePost: (postId: string, voteType: 1 | -1) => Promise<void>;

  // Post detail actions
  fetchPostBySlug: (slug: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  createComment: (input: CreatePointStackCommentInput) => Promise<PointStackPostComment>;
  deleteComment: (commentId: string) => Promise<void>;
  acceptAnswer: (commentId: string) => Promise<void>;
  voteComment: (commentId: string, voteType: 1 | -1) => Promise<void>;
  clearCurrentPost: () => void;

  // Notification actions
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Message actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  startConversation: (userId: string, message: string) => Promise<PointStackConversation>;
  markConversationRead: (conversationId: string) => Promise<void>;

  // Floating messenger actions
  toggleMessenger: () => void;
  closeMessenger: () => void;
  openMessengerConversation: (conversationId: string) => void;
  backToMessengerInbox: () => void;

  // Profile actions
  fetchCurrentUserProfile: () => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;

  // Reset
  reset: () => void;
}

const POSTS_PER_PAGE = 20;

export const usePointStackStore = create<PointStackState>((set, get) => ({
  // Initial state
  posts: [],
  feedFilter: {},
  feedLoading: false,
  feedError: null,
  hasMorePosts: true,

  currentPost: null,
  currentPostComments: [],
  currentPostLoading: false,

  notifications: [],
  unreadNotificationCount: 0,
  notificationsLoading: false,
  notificationsError: null,

  conversations: [],
  currentConversation: null,
  currentMessages: [],
  unreadMessageCount: 0,
  messagesLoading: false,
  messagesError: null,

  // Floating messenger UI state
  messengerOpen: false,
  messengerView: "inbox",
  selectedConversationId: null,

  currentUserProfile: null,

  // Feed actions
  fetchFeed: async (filter, reset = true) => {
    const state = get();
    const effectiveFilter = filter ?? state.feedFilter;

    set({ feedLoading: true, feedError: null });

    try {
      const posts = await api.fetchPosts(effectiveFilter, POSTS_PER_PAGE, 0);
      set({
        posts,
        feedFilter: effectiveFilter,
        feedLoading: false,
        hasMorePosts: posts.length === POSTS_PER_PAGE,
      });
    } catch (error) {
      console.error("Error fetching feed:", error);
      // Keep existing posts visible on error instead of showing empty state
      set({ feedLoading: false, feedError: getErrorMessage(error) });
    }
  },

  loadMorePosts: async () => {
    const { feedLoading, hasMorePosts, feedFilter, posts: currentPosts } = get();
    if (feedLoading || !hasMorePosts) return;

    set({ feedLoading: true });

    try {
      const newPosts = await api.fetchPosts(feedFilter, POSTS_PER_PAGE, currentPosts.length);
      // Use functional update to avoid race conditions
      set((state) => ({
        posts: [...state.posts, ...newPosts],
        feedLoading: false,
        hasMorePosts: newPosts.length === POSTS_PER_PAGE,
      }));
    } catch (error) {
      console.error("Error loading more posts:", error);
      set({ feedLoading: false });
    }
  },

  setFeedFilter: (filter) => {
    set({ feedFilter: filter });
    get().fetchFeed(filter);
  },

  createPost: async (input) => {
    const post = await api.createPost(input);
    set((state) => ({ posts: [post, ...state.posts] }));
    return post;
  },

  updatePost: async (postId, updates) => {
    try {
      const updated = await api.updatePost(postId, updates);
      set((state) => ({
        posts: state.posts.map((p) => (p.id === postId ? updated : p)),
        currentPost: state.currentPost?.id === postId ? updated : state.currentPost,
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      await api.deletePost(postId);
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== postId),
        currentPost: state.currentPost?.id === postId ? null : state.currentPost,
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  votePost: async (postId, voteType) => {
    try {
      await api.votePost(postId, voteType);
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                upvote_count:
                  p.user_vote === voteType
                    ? p.upvote_count - voteType
                    : p.user_vote
                    ? p.upvote_count - p.user_vote + voteType
                    : p.upvote_count + voteType,
                user_vote: p.user_vote === voteType ? null : voteType,
              }
            : p
        ),
        currentPost:
          state.currentPost?.id === postId
            ? {
                ...state.currentPost,
                upvote_count:
                  state.currentPost.user_vote === voteType
                    ? state.currentPost.upvote_count - voteType
                    : state.currentPost.user_vote
                    ? state.currentPost.upvote_count - state.currentPost.user_vote + voteType
                    : state.currentPost.upvote_count + voteType,
                user_vote: state.currentPost.user_vote === voteType ? null : voteType,
              }
            : state.currentPost,
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  // Post detail actions
  fetchPostBySlug: async (slug) => {
    set({ currentPostLoading: true });
    try {
      const post = await api.fetchPostBySlug(slug);
      set({ currentPost: post, currentPostLoading: false });
      if (post) {
        get().fetchComments(post.id);
        api.incrementPostViewCount(post.id).catch(() => {});
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      set({ currentPostLoading: false });
    }
  },

  fetchComments: async (postId) => {
    try {
      const comments = await api.fetchComments(postId);
      set({ currentPostComments: comments });
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  },

  createComment: async (input) => {
    const comment = await api.createComment(input);
    set((state) => ({
      currentPostComments: [...state.currentPostComments, comment],
      currentPost: state.currentPost
        ? { ...state.currentPost, comment_count: state.currentPost.comment_count + 1 }
        : null,
    }));
    return comment;
  },

  deleteComment: async (commentId) => {
    try {
      await api.deleteComment(commentId);
      set((state) => ({
        currentPostComments: state.currentPostComments.filter((c) => c.id !== commentId),
        currentPost: state.currentPost
          ? { ...state.currentPost, comment_count: Math.max(0, state.currentPost.comment_count - 1) }
          : null,
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  acceptAnswer: async (commentId) => {
    const state = get();
    if (!state.currentPost) return;

    try {
      await api.acceptAnswer(commentId, state.currentPost.id);
      set((state) => ({
        currentPostComments: state.currentPostComments.map((c) => ({
          ...c,
          is_accepted: c.id === commentId,
        })),
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  voteComment: async (commentId, voteType) => {
    try {
      await api.voteComment(commentId, voteType);
      set((state) => ({
        currentPostComments: state.currentPostComments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                upvote_count:
                  c.user_vote === voteType
                    ? c.upvote_count - voteType
                    : c.user_vote
                    ? c.upvote_count - c.user_vote + voteType
                    : c.upvote_count + voteType,
                user_vote: c.user_vote === voteType ? null : voteType,
              }
            : c
        ),
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  clearCurrentPost: () => {
    set({ currentPost: null, currentPostComments: [] });
  },

  // Notification actions
  fetchNotifications: async () => {
    set({ notificationsLoading: true, notificationsError: null });
    try {
      const notifications = await api.fetchNotifications();
      set({ notifications, notificationsLoading: false });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ notificationsLoading: false, notificationsError: "Failed to load notifications" });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await api.getUnreadNotificationCount();
      set({ unreadNotificationCount: count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  },

  markNotificationRead: async (id) => {
    try {
      await api.markNotificationRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await api.markAllNotificationsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadNotificationCount: 0,
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  // Message actions
  fetchConversations: async () => {
    set({ messagesLoading: true, messagesError: null });
    try {
      const conversations = await api.fetchConversations();
      set({ conversations, messagesLoading: false });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      set({ messagesLoading: false, messagesError: "Failed to load conversations" });
    }
  },

  fetchMessages: async (conversationId) => {
    // Clear old messages immediately to prevent showing stale data
    set({ messagesLoading: true, messagesError: null, currentMessages: [] });
    try {
      const messages = await api.fetchMessages(conversationId);
      const conversation = get().conversations.find((c) => c.id === conversationId) || null;
      set({ currentMessages: messages, currentConversation: conversation, messagesLoading: false });
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({ messagesLoading: false, messagesError: "Failed to load messages" });
    }
  },

  sendMessage: async (conversationId, content) => {
    try {
      const message = await api.sendMessage(conversationId, content);
      set((state) => ({
        currentMessages: [...state.currentMessages, message],
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  startConversation: async (userId, message) => {
    try {
      const conversation = await api.startConversation(userId, message);
      set((state) => ({
        conversations: [conversation, ...state.conversations],
      }));
      return conversation;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  markConversationRead: async (conversationId) => {
    try {
      await api.markConversationRead(conversationId);
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        ),
      }));
    } catch (error) {
      // Silent fail for read receipts - not critical
      console.error("Error marking conversation read:", error);
    }
  },

  // Floating messenger actions
  toggleMessenger: () => {
    set((state) => ({
      messengerOpen: !state.messengerOpen,
      // Reset to inbox when opening
      messengerView: state.messengerOpen ? state.messengerView : "inbox",
      selectedConversationId: state.messengerOpen ? state.selectedConversationId : null,
    }));
  },

  closeMessenger: () => {
    set({ messengerOpen: false });
  },

  openMessengerConversation: (conversationId) => {
    set({
      messengerView: "conversation",
      selectedConversationId: conversationId,
    });
    get().fetchMessages(conversationId);
    get().markConversationRead(conversationId);
  },

  backToMessengerInbox: () => {
    set({
      messengerView: "inbox",
      selectedConversationId: null,
      currentMessages: [],
      currentConversation: null,
    });
  },

  // Profile actions
  fetchCurrentUserProfile: async () => {
    try {
      const { getClient } = await import("@/lib/supabase/client");
      const supabase = getClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await api.fetchProfileById(user.id);
        set({ currentUserProfile: profile });
      }
    } catch (error) {
      console.error("Error fetching current user profile:", error);
    }
  },

  followUser: async (userId) => {
    try {
      await api.followUser(userId);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  unfollowUser: async (userId) => {
    try {
      await api.unfollowUser(userId);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  // Reset
  reset: () => {
    set({
      posts: [],
      feedFilter: {},
      feedLoading: false,
      feedError: null,
      hasMorePosts: true,
      currentPost: null,
      currentPostComments: [],
      currentPostLoading: false,
      notifications: [],
      unreadNotificationCount: 0,
      notificationsLoading: false,
      notificationsError: null,
      conversations: [],
      currentConversation: null,
      currentMessages: [],
      unreadMessageCount: 0,
      messagesLoading: false,
      messagesError: null,
      messengerOpen: false,
      messengerView: "inbox",
      selectedConversationId: null,
      currentUserProfile: null,
    });
  },
}));
