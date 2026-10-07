import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';

type RevealProps = {
  as?: ElementType;
  className?: string;
  delay?: number;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
};

// Görünür alana girince bir kez yumuşakça beliren sarmalayıcı (landing.css → .av-reveal).
export default function Reveal({ as: Tag = 'div', className = '', delay = 0, style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`av-reveal${inView ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={{ ...style, '--d': `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}
