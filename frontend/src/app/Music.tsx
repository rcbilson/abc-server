'use client';
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Music() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");
  const [widgetText, setWidgetText] = useState("my widget text");

  useEffect(() => {
    axios.get("/file/tedeum/rehearsal-d.abc")
      .then(
        (result) => {
          setIsLoaded(true);
          setWidgetText(result.data);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, [])

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <p>{widgetText}</p>
    )
  }
}
