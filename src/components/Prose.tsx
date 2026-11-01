// Shows rich text from the admin panel. The API cleans it when it is saved.
export const Prose = ({ html, dropCap }: { html: string; dropCap?: boolean }) => (
  <div
    className={`${dropCap ? 'prose-editorial ' : ''}space-y-5 leading-relaxed [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-gold-strong [&_blockquote]:pl-5 [&_blockquote]:font-display [&_blockquote]:text-xl [&_h1]:font-display [&_h1]:text-4xl [&_h1]:font-medium [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-medium [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:font-medium [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5`}
    dangerouslySetInnerHTML={{ __html: html }}
  />
);
