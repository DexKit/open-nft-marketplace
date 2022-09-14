import useIntersectionObserver from '@react-hook/intersection-observer';
import { useRef } from 'react';

interface Props {
  url?: string;
  title?: string;
}

const LazyYoutubeFrame = ({ url, title }: Props) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const lockRef = useRef(false);

  const { isIntersecting } = useIntersectionObserver(containerRef);

  if (isIntersecting && !lockRef.current) {
    lockRef.current = true;
  }

  return (
    <div
      ref={(ref) => {
        if (ref) {
          containerRef.current = ref;
        }
      }}
    >
      {lockRef.current && (
        <iframe
          title={title}
          src={url}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          width="100%"
          height="315"
        ></iframe>
      )}
    </div>
  );
};

export default LazyYoutubeFrame;
