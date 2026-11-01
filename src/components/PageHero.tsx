import { ReactNode } from 'react';

// Headline that rises word by word. Screen readers still get the whole sentence.
export const AnimatedHeading = ({ text, className = '', as: Tag = 'h1' }: { text: string; className?: string; as?: 'h1' | 'h2' }) => (
  <Tag className={className}>
    {text.split(/\s+/).map((word, index) => (
      <span key={`${word}-${index}`}>
        <span className="word">
          <span style={{ '--delay': `${index * 70}ms` } as React.CSSProperties}>{word}</span>
        </span>{' '}
      </span>
    ))}
  </Tag>
);

export const PageHero = ({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) => (
  <header className="relative overflow-hidden bg-sand">
    <div aria-hidden className="arch drift absolute -right-16 -top-10 hidden h-96 w-72 border border-gold-strong/50 md:block" />
    <div aria-hidden className="arch absolute -right-4 top-16 hidden h-96 w-72 bg-gold/20 md:block" />
    <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="eyebrow enter">{eyebrow}</p>
      <AnimatedHeading text={title} className="mt-3 max-w-3xl font-display text-5xl font-medium leading-[1.05] sm:text-7xl" />
      {children && (
        <div className="enter mt-5 max-w-xl text-lg text-muted" style={{ '--delay': '250ms' } as React.CSSProperties}>
          {children}
        </div>
      )}
    </div>
  </header>
);
