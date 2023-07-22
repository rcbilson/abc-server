import { useParams } from 'react-router-dom';
import useServerSentEvents from './useServerSentEvents';
import Abcjs from "./Abcjs";

export default function Music() {
  const params = useParams();
  let body = (<p>nothing yet...</p>);
  const path = params['*'];
  if (!path) throw new Error("could not find * for Music");
  const segments = path.split("/");
  segments.unshift("subscribe");
  const newpath = "/" + segments.join("/");
  const data = useServerSentEvents(newpath);
  if (data) {
    body = (
      <Abcjs
        abcNotation={data}
      />
    )
  }

  return (
    <div>{body}</div>
  )
}
