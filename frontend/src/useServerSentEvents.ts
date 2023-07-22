import { useEffect, useState } from 'react';

const useServerSentEvents = (url: string) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      // Process the event data
      const eventData = event.data;

      // Update the state with the received data
      setData(eventData);
    };

    eventSource.onerror = (error) => {
      console.error('Error with SSE connection:', error);
    };

    return () => {
      // Close the SSE connection when the component unmounts
      eventSource.close();
    };
  }, [url]);

  return data;
};

export default useServerSentEvents;

