import { useEffect, useState } from "react";

const flakyFetch = async (url) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 1/6 chance of throwing a JS error
  const randomValue = Math.random() * 100;
  if (randomValue <= 16) {
    throw new Error("The server did not respond");
  }

  // 1/6 chance of returning a server error
  let response = await fetch(url);
  if (randomValue <= 32) {
    const data = { error: "Server error" };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const init = { status: 500, statusText: "Server Error" };
    response = new Response(blob, init);
  }
  return response;
};

export const UserDetail = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const noErrorState = { happened: false, msg: "" };
  const [error, setError] = useState(noErrorState);

  useEffect(() => {
    let ignore = false; // To ignore state updates on unmounted components
    setPosts([]);
    setError(noErrorState);
    setIsLoading(true);

    const fetchUserPosts = async () => {
      let response;
      try {
        response = await flakyFetch(
          `http://localhost:3000/users/${user.id}/posts`
        );
      } catch (err) {
        setError({
          happened: true,
          msg: err.message,
        });
        const posts = await response.json();
        if (!ignore) {
          setPosts(posts);
        }
        setIsLoading(false);
        return;
      }
      if (!ignore) {
        setIsLoading(false);
      }
      if (!response.ok) {
        setError({
          happened: true,
          msg: `${response.status}: ${response.statusText}`,
        });
        setIsLoading(false);
        return;
      }
      const posts = await response.json();
      setPosts(posts);
      setIsLoading(false);
    };
    fetchUserPosts();

    return () => {
      ignore = true; // Avoid setting state on unmounted component
    };
  }, [user]);
  if (error.happened) {
    return <p>The following error occurred: {error.msg} </p>;
  }
  if (isLoading) {
    return <p>loading ...</p>;
  }

  return (
    <div className="user-details">
      <p>
        <b>Name:</b> {user.name}
      </p>
      <p>
        <b>Email:</b> {user.email}
      </p>
      <ul>
        {posts.length > 0 ? (
          posts.map((post) => (
            <li key={post.id}>
              <b>{post.title}</b>
              <p>{post.body}</p>
            </li>
          ))
        ) : (
          <p>No posts available for this user.</p>
        )}
      </ul>
    </div>
  );
};
