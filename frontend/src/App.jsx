import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import React from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(false); // Track fetching status
  const targetRef = useRef(null); // Use ref for the target element

  const fetchData = useCallback(async () => {
    if (isFetching) return;
    let response;
    try {
      setIsFetching(true); // Start fetching
      response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/get-posts?limit=${
          skip + limit
        }&skip=${skip}`
      );

      // Append new data to existing data
      if (response.data) {
        setData((prevData) => [...prevData, ...response.data?.data]);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, skip]);

  useEffect(() => {
    fetchData();
  }, [skip]);
  useEffect(() => {
    ///observer logic for infinite scrolling

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && skip < total - limit) {
          setSkip((prevSkip) => {
            return prevSkip + 10;
          });
        }
      },
      { threshold: 1 } // Trigger when 100% of the element is visible
    );

    const targetElement = targetRef.current; // Get the target element through ref
    if (targetElement) {
      observer.observe(targetElement); // Start observing
    }

    return () => {
      if (targetElement) observer.unobserve(targetElement); // Cleanup
    };
  }, [isFetching]); // Observe changes in `isFetching`

  const PostItem = React.memo(({ item }) => {
    return (
      <li>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
      </li>
    );
  });

  // This PostItem component will only re-render if the `title` or `body` props change.

  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {data.map((item, i) => (
        <PostItem item={item} key={i} />
      ))}
      <div ref={targetRef} className="target"></div>
      {/* Use ref for the target */}
      {isFetching && <p>Loading more data...</p>} {/* Show loading status */}
    </ul>
  );
}

export default App;
