import { Image, Pressable, Text, View, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { formatDistanceToNowStrict } from "date-fns";
import { useRouter } from "expo-router";
import { Tables } from "../types/database.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../lib/supabase";
import { createUpvote, selectMyVote } from "../services/upvotesService";
import { useSession } from "@clerk/clerk-expo";
import SupabaseImage from "./SupabaseImage";

type Post = Tables<"posts"> & {
  user?: Tables<"users">;
  group: Tables<"groups">;
  upvotes: { sum?: number; value?: number }[];
  nr_of_comments?: { count: number }[];
  comments?: { id: string }[];
};

type PostListItemProps = {
  post: Post;
  isDetailedPost?: boolean;
};

export default function PostListItem({
  post,
  isDetailedPost,
}: PostListItemProps) {
  const router = useRouter();
  const supabase = useSupabase();

  const queryClient = useQueryClient();
  const { session } = useSession();

  const { mutate: upvote } = useMutation({
    mutationFn: (value: 1 | -1) => createUpvote(post.id, value, supabase),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { data: myVote } = useQuery({
    queryKey: ["posts", post.id, "my-upvote"],
    queryFn: () => selectMyVote(post.id, session?.user.id || "", supabase),
  });

  const isUpvoted = myVote?.value === 1;
  const isDownvoted = myVote?.value === -1;

  const shouldShowImage = isDetailedPost || post.image;
  const shouldShowDescription = isDetailedPost || !post.image;
  const Container = isDetailedPost ? View : Pressable;

  return (
      <Container
        onPress={
          isDetailedPost ? undefined : () => router.push(`/post/${post.id}`)
        }
        style={{
          width: "100%",
          paddingHorizontal: 15,
          paddingVertical: 10,
          gap: 7,
          borderBottomColor: "lightgrey",
          borderBottomWidth: 0.5,
          backgroundColor: "white",
        }}
      >
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={{ uri: post.group.image || undefined }}
            style={{ width: 20, height: 20, borderRadius: 10, marginRight: 5 }}
          />
          <View>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <Text
                style={{ fontWeight: "bold", fontSize: 13, color: "#3A3B3C" }}
              >
                {post.group.name}
              </Text>
              <Text
                style={{ color: "grey", fontSize: 13, alignSelf: "flex-start" }}
              >
                {post.created_at ? formatDistanceToNowStrict(new Date(post.created_at)) : ""}
              </Text>
            </View>
            {isDetailedPost && (
              <Text style={{ fontSize: 13, color: "#2E5DAA" }}>
                {post.user?.name}
              </Text>
            )}
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              console.log("Pressed");
            }}
            style={{
              marginLeft: "auto",
              backgroundColor: "#0d469b",
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "white",
                paddingVertical: 2,
                paddingHorizontal: 7,
                fontWeight: "bold",
                fontSize: 13,
              }}
            >
              Join
            </Text>
          </Pressable>
        </View>

        {/* CONTENT */}
        <Text style={{ fontWeight: "bold", fontSize: 17, letterSpacing: 0.5 }}>
          {post.title}
        </Text>
        {shouldShowImage && post.image && (
          <View
            collapsable={false}
            style={{
              width: "100%",
              aspectRatio: 4 / 3,
              borderRadius: 15,
              overflow: "hidden",
              backgroundColor: "gainsboro",
            }}
          >
            <SupabaseImage
              key={post.image}
              path={post.image}
              bucket="images"
              style={{ width: "100%", height: "100%" }}
            />
          </View>
        )}

        {shouldShowDescription && post.description && (
          <Text numberOfLines={isDetailedPost ? undefined : 4}>
            {post.description}
          </Text>
        )}

        {/* FOOTER */}
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={[{ flexDirection: "row" }, styles.iconBox]}>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  upvote(1);
                }}
              >
                <MaterialCommunityIcons
                  name={isUpvoted ? "arrow-up-bold" : "arrow-up-bold-outline"}
                  size={19}
                  color={isUpvoted ? "crimson" : "black"}
                />
              </Pressable>
              <Text
                style={{
                  fontWeight: "500",
                  marginLeft: 5,
                  alignSelf: "center",
                }}
              >
                {post.upvotes?.reduce((acc: number, v: any) => acc + (v.value ?? v.sum ?? 0), 0) ?? 0}
              </Text>
              <View
                style={{
                  width: 1,
                  backgroundColor: "#D4D4D4",
                  height: 14,
                  marginHorizontal: 7,
                  alignSelf: "center",
                }}
              />
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  upvote(-1);
                }}
              >
                <MaterialCommunityIcons
                  name={
                    isDownvoted ? "arrow-down-bold" : "arrow-down-bold-outline"
                  }
                  size={19}
                  color={isDownvoted ? "crimson" : "black"}
                />
              </Pressable>
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                if (!isDetailedPost) {
                  router.push(`/post/${post.id}`);
                }
              }}
              style={[{ flexDirection: "row" }, styles.iconBox]}
            >
              <MaterialCommunityIcons
                name="comment-outline"
                size={19}
                color="black"
              />
              <Text
                style={{
                  fontWeight: "500",
                  marginLeft: 5,
                  alignSelf: "center",
                }}
              >
                {post.nr_of_comments?.[0]?.count ?? (post as any).comments?.length ?? 0}
              </Text>
            </Pressable>
          </View>
          <View style={{ marginLeft: "auto", flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.iconBox}
            >
              <MaterialCommunityIcons
                name="trophy-outline"
                size={19}
                color="black"
              />
            </Pressable>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.iconBox}
            >
              <MaterialCommunityIcons
                name="share-outline"
                size={19}
                color="black"
              />
            </Pressable>
          </View>
        </View>
      </Container>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    borderWidth: 0.5,
    borderColor: "#D4D4D4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
});
